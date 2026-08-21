"""2단계: 검수된 JSON -> 운영 DB 직접 insert + SQL 파일 export.

사용법:
    python load.py data/extracted/extracted_20260821_120000.json

옵션:
    --force              needs_review=true 인 항목도 강제로 적재 (기본은 건너뜀)
    --sql-out PATH        export할 SQL 파일 경로 (기본: data/exported_<타임스탬프>.sql)

동작:
    1. JSON에 있는 메뉴들을 순서대로 운영 DB(config의 DB_* 값)에 직접 INSERT
       - Menu.day 는 UNIQUE 라고 가정 -> 이미 존재하는 day면 건너뜀 (덮어쓰지 않음)
       - Ingredient 는 이름 기준으로 dedupe (이미 있으면 재사용, 없으면 새로 insert)
       - Menu_Ingredient 는 (menu_id, ingredient_id) UNIQUE 라고 가정 -> INSERT IGNORE
    2. 동시에 실제 실행한 것과 동일한 INSERT문을 SQL 파일로도 저장
       -> 이 파일을 자바 프로젝트의 resources/data.sql 로 복사해서 쓰면 됨 (dev 프로파일 전용)
"""
from __future__ import annotations

import argparse
import json
from datetime import datetime

import pymysql

import config


def get_connection():
    return pymysql.connect(
        host=config.DB_HOST,
        port=config.DB_PORT,
        user=config.DB_USER,
        password=config.DB_PASSWORD,
        database=config.DB_NAME,
        charset="utf8mb4",
        autocommit=False,
    )


def load_ingredient_cache(cursor) -> dict[str, int]:
    cursor.execute("SELECT ingredient_id, name FROM ingredient")
    return {name: ingredient_id for ingredient_id, name in cursor.fetchall()}


def main() -> None:
    parser = argparse.ArgumentParser(description="검수된 JSON을 DB에 적재하고 SQL로도 export")
    parser.add_argument("json_path", help="extract.py가 만든(그리고 검수한) JSON 파일 경로")
    parser.add_argument("--force", action="store_true", help="needs_review=true 항목도 적재")
    parser.add_argument("--sql-out", default=None, help="export할 SQL 파일 경로")
    args = parser.parse_args()

    with open(args.json_path, encoding="utf-8") as f:
        records = json.load(f)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    sql_out = args.sql_out or str(config.DATA_DIR / f"exported_{timestamp}.sql")

    sql_statements: list[str] = []
    skipped: list[str] = []
    inserted_menus = 0
    inserted_ingredients = 0
    inserted_links = 0

    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            ingredient_cache = load_ingredient_cache(cursor)

            for record in records:
                title = record.get("video_title", record.get("video_id", "?"))

                if record.get("needs_review") and not args.force:
                    print(f"건너뜀 (검수 필요 표시됨): {title}")
                    skipped.append(title)
                    continue

                day = record.get("day")
                cursor.execute("SELECT menu_id FROM menu WHERE day = %s", (day,))
                existing = cursor.fetchone()
                if existing:
                    print(f"건너뜀 (이미 존재하는 day={day}): {title}")
                    skipped.append(title)
                    continue

                menu_sql = "INSERT INTO menu (day, recipe) VALUES (%s, %s)"
                menu_params = (day, record.get("recipe", ""))
                cursor.execute(menu_sql, menu_params)
                menu_id = cursor.lastrowid
                sql_statements.append(cursor.mogrify(menu_sql, menu_params) + ";")
                inserted_menus += 1

                for ing in record.get("ingredients", []):
                    name = (ing.get("name") or "").strip()
                    if not name:
                        continue

                    ingredient_id = ingredient_cache.get(name)
                    if ingredient_id is None:
                        ing_sql = "INSERT INTO ingredient (name, type) VALUES (%s, %s)"
                        ing_params = (name, ing.get("type", "기타"))
                        cursor.execute(ing_sql, ing_params)
                        ingredient_id = cursor.lastrowid
                        ingredient_cache[name] = ingredient_id
                        sql_statements.append(cursor.mogrify(ing_sql, ing_params) + ";")
                        inserted_ingredients += 1

                    link_sql = (
                        "INSERT IGNORE INTO menu_ingredient "
                        "(menu_id, ingredient_id, amount_type, amount_value, amount_unit, amount_text) "
                        "VALUES (%s, %s, %s, %s, %s, %s)"
                    )
                    link_params = (
                        menu_id,
                        ingredient_id,
                        ing.get("amount_type", "APPROX"),
                        ing.get("amount_value"),
                        ing.get("amount_unit"),
                        ing.get("amount_text"),
                    )
                    cursor.execute(link_sql, link_params)
                    sql_statements.append(cursor.mogrify(link_sql, link_params) + ";")
                    inserted_links += 1

                print(f"적재 완료: day={day} {title}")

        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

    with open(sql_out, "w", encoding="utf-8") as f:
        f.write("\n".join(sql_statements) + "\n")

    print()
    print(f"운영 DB 적재: menu {inserted_menus}건 / ingredient(신규) {inserted_ingredients}건 / menu_ingredient {inserted_links}건")
    print(f"SQL export: {sql_out}")
    if skipped:
        print(f"건너뛴 항목 {len(skipped)}개: {skipped}")
    print()
    print(f"-> {sql_out} 내용을 자바 프로젝트의 src/main/resources/data.sql 로 복사하면 dev 프로파일에서 자동 로드됩니다.")


if __name__ == "__main__":
    main()
