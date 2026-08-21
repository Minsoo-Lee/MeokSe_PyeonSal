"""1단계: 재생목록 -> JSON 파싱.

사용법:
    python extract.py                 # 재생목록 전체(신규 영상만) 처리
    python extract.py --limit 3       # 테스트로 신규 영상 3개만 처리

이미 처리한 video_id는 data/processed_videos.json에 기록되어 다음 실행 때 건너뛴다.
결과는 data/extracted/extracted_<타임스탬프>.json 에 저장되고, 이 파일을 사람이 검수한 뒤
load.py로 넘긴다.
"""
from __future__ import annotations

import argparse
import json
import sys
import time
from datetime import datetime

import config
import youtube
from extractor import extract_recipe


def load_processed_ids() -> set[str]:
    if not config.PROCESSED_VIDEOS_FILE.exists():
        return set()
    with open(config.PROCESSED_VIDEOS_FILE, encoding="utf-8") as f:
        return set(json.load(f))


def save_processed_ids(ids: set[str]) -> None:
    with open(config.PROCESSED_VIDEOS_FILE, "w", encoding="utf-8") as f:
        json.dump(sorted(ids), f, ensure_ascii=False, indent=2)


def needs_review(record: dict) -> bool:
    if record.get("day") is None:
        return True
    if not record.get("ingredients"):
        return True
    for ing in record["ingredients"]:
        if not ing.get("name"):
            return True
    return False


def main() -> None:
    parser = argparse.ArgumentParser(description="유튜브 재생목록에서 레시피를 뽑아 JSON으로 저장")
    parser.add_argument("--limit", type=int, default=None, help="신규 영상 중 앞에서부터 N개만 처리 (테스트용)")
    args = parser.parse_args()

    if not config.PLAYLIST_URL:
        sys.exit("PLAYLIST_URL이 설정되지 않았습니다. .env 파일을 확인하세요.")
    if not config.GEMINI_API_KEY:
        sys.exit("GEMINI_API_KEY가 설정되지 않았습니다. .env 파일을 확인하세요.")

    processed = load_processed_ids()

    print("재생목록 조회 중...")
    all_ids = youtube.get_playlist_video_ids(config.PLAYLIST_URL)
    new_ids = [vid for vid in all_ids if vid not in processed]

    print(f"전체 {len(all_ids)}개 중 신규 {len(new_ids)}개 발견")

    if args.limit is not None:
        new_ids = new_ids[: args.limit]
        print(f"--limit 옵션으로 {len(new_ids)}개만 처리")

    if not new_ids:
        print("처리할 신규 영상이 없습니다.")
        return

    results = []
    failed = []

    for i, video_id in enumerate(new_ids, start=1):
        print(f"[{i}/{len(new_ids)}] {video_id} 처리 중...")
        try:
            info = youtube.get_video_info(video_id)
            recipe = extract_recipe(info.title, info.description)
        except Exception as exc:  # noqa: BLE001 - 배치 작업이라 개별 실패는 건너뛰고 계속 진행
            print(f"  실패: {exc}")
            failed.append({"video_id": video_id, "error": str(exc)})
            continue

        record = {
            "video_id": video_id,
            "video_url": f"https://www.youtube.com/watch?v={video_id}",
            "video_title": info.title,
            **recipe,
        }
        record["needs_review"] = needs_review(record)
        if record["needs_review"]:
            print("  -> 검수 필요 표시됨 (day 없음 / 재료 없음 등)")

        results.append(record)
        processed.add(video_id)

        # 무료 티어 예의상 살짝 텀 (레이트리밋 여유있게)
        time.sleep(1)

    save_processed_ids(processed)

    print()
    if not results:
        print("성공적으로 추출된 항목이 없어 파일을 저장하지 않았습니다.")
    else:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        out_path = config.EXTRACTED_DIR / f"extracted_{timestamp}.json"
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)

        print(f"완료: {len(results)}개 저장 -> {out_path}")
        review_count = sum(1 for r in results if r["needs_review"])
        if review_count:
            print(f"  ⚠ 검수 필요 항목 {review_count}개 (record.needs_review == true)")

    if failed:
        print(f"  ⚠ 처리 실패 {len(failed)}개: {[f['video_id'] for f in failed]}")
        print("    (실패한 영상은 processed_videos.json에 기록되지 않아 다음 실행 때 재시도됩니다)")


if __name__ == "__main__":
    main()