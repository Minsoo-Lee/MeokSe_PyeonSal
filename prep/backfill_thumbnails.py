"""이미 DB에 적재된 기존 메뉴들의 썸네일을 한 번에 내려받는 백필 스크립트.

load.py에 썸네일 다운로드 기능이 생기기 전에 이미 들어간 메뉴들은 썸네일이 없으므로,
이 스크립트를 한 번 실행해서 채워준다.

DB에는 전혀 접근하지 않는다 — extract.py가 남겨둔 data/extracted/*.json 파일들에서
video_id를 모아서 다운로드만 한다. (DB를 조회하는 방식이면, load.py가 항상 접속하는
DB_HOST/DB_PORT는 로컬 개발용 컨테이너를 가리키고 있어서, 실제 운영 서버에 이미 들어간
62개 메뉴와 내용이 다를 수 있다. JSON 파일 기준으로 하면 이런 문제가 없다.)

download_thumbnail이 이미 파일이 있으면 건너뛰므로 여러 번 실행해도 안전하다.

사용법:
    python backfill_thumbnails.py
"""
from __future__ import annotations

import json

import config
from load import download_thumbnail


def collect_video_ids() -> set[str]:
    video_ids: set[str] = set()
    for path in sorted(config.EXTRACTED_DIR.glob("extracted_*.json")):
        with open(path, encoding="utf-8") as f:
            records = json.load(f)
        for record in records:
            video_id = record.get("video_id")
            if video_id:
                video_ids.add(video_id)
    return video_ids


def main() -> None:
    video_ids = collect_video_ids()
    print(f"data/extracted/*.json에서 video_id {len(video_ids)}개 확인")

    downloaded = 0
    skipped = 0
    for video_id in sorted(video_ids):
        dest = config.THUMBNAILS_DIR / f"{video_id}.jpg"
        already_had = dest.exists()
        download_thumbnail(video_id)
        if already_had:
            skipped += 1
        elif dest.exists():
            downloaded += 1

    print(f"완료: 새로 받은 썸네일 {downloaded}개, 이미 있어서 건너뛴 {skipped}개")


if __name__ == "__main__":
    main()
