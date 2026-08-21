"""yt-dlp를 이용한 유튜브 재생목록/영상 정보 조회.

API 키 없이 동작한다. 영상 다운로드는 하지 않고 메타데이터(제목, 설명)만 가져온다.
"""
from __future__ import annotations

from dataclasses import dataclass

import yt_dlp


@dataclass
class VideoInfo:
    video_id: str
    title: str
    description: str
    url: str


def get_playlist_video_ids(playlist_url: str) -> list[str]:
    """재생목록에 있는 영상들의 video_id 목록을 순서대로 반환한다.

    --flat-playlist 방식이라 목록만 빠르게 가져오고, 개별 영상의 title/description은
    포함하지 않는다 (get_video_info로 따로 조회).
    """
    opts = {
        "extract_flat": True,
        "quiet": True,
        "skip_download": True,
    }
    with yt_dlp.YoutubeDL(opts) as ydl:
        result = ydl.extract_info(playlist_url, download=False)

    entries = result.get("entries") or []
    return [entry["id"] for entry in entries if entry and entry.get("id")]


def get_video_info(video_id: str) -> VideoInfo:
    """영상 하나의 제목/설명을 가져온다."""
    url = f"https://www.youtube.com/watch?v={video_id}"
    opts = {
        "quiet": True,
        "skip_download": True,
    }
    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(url, download=False)

    return VideoInfo(
        video_id=video_id,
        title=info.get("title", "") or "",
        description=info.get("description", "") or "",
        url=url,
    )
