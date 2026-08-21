"""Gemini API를 이용해 영상 제목/설명 텍스트를 구조화된 레시피 JSON으로 변환.

DB 스키마(Menu / Ingredient / Menu_Ingredient)에 맞춰 다음 형태로 뽑아낸다.

{
  "day": 3,                      # N일차. 못 찾으면 null
  "menu_name": "제육볶음",
  "recipe": "...",
  "ingredients": [
    {
      "name": "돼지고기",
      "type": "육류",
      "amount_type": "EXACT",     # EXACT | APPROX
      "amount_value": 300,        # EXACT일 때만 숫자, APPROX면 null
      "amount_unit": "g",         # EXACT일 때만 단위, APPROX면 null
      "amount_text": null         # APPROX일 때만 원문 표기, EXACT면 null
    },
    ...
  ]
}

amount_value/amount_unit 와 amount_text는 서로 배타적이다 (한쪽이 채워지면 다른 쪽은 null).
"""
from __future__ import annotations

import json

from google import genai
from google.genai import types

import config

RESPONSE_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "day": {
            "type": "INTEGER",
            "nullable": True,
            "description": "N일차 숫자. 제목/설명에서 확인 안 되면 null",
        },
        "menu_name": {"type": "STRING"},
        "recipe": {
            "type": "STRING",
            "description": "조리 순서/레시피 본문. 설명란에 있는 그대로 정리",
        },
        "ingredients": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "name": {"type": "STRING", "description": "재료 이름 (단위/수량 제외)"},
                    "type": {
                        "type": "STRING",
                        "description": "재료 분류: 육류, 해산물, 채소, 곡류, 양념, 유제품, 기타 중 하나",
                    },
                    "amount_type": {"type": "STRING", "enum": ["EXACT", "APPROX"]},
                    "amount_value": {
                        "type": "INTEGER",
                        "nullable": True,
                        "description": "EXACT일 때 숫자 값(단위 제외). APPROX면 null",
                    },
                    "amount_unit": {
                        "type": "STRING",
                        "nullable": True,
                        "description": "EXACT일 때 단위 (g, ml, 개, 큰술, 작은술 등). APPROX면 null",
                    },
                    "amount_text": {
                        "type": "STRING",
                        "nullable": True,
                        "description": "APPROX일 때 원문 표기 그대로 (예: '적당량', '약간'). EXACT면 null",
                    },
                },
                "required": [
                    "name",
                    "type",
                    "amount_type",
                    "amount_value",
                    "amount_unit",
                    "amount_text",
                ],
            },
        },
    },
    "required": ["menu_name", "recipe", "ingredients"],
}

PROMPT_TEMPLATE = """\
너는 요리 유튜브 영상의 제목과 설명란 텍스트에서 레시피 정보를 구조화해서 뽑아내는 도우미야.
아래 [제목]과 [설명]을 읽고, 메뉴 이름/N일차/레시피 본문/재료 목록을 JSON으로 정리해줘.

규칙:
- amount_type은 "300g", "1개"처럼 구체적인 숫자+단위가 있으면 EXACT, "적당량"/"약간"/"조금" 같이
  모호한 표현이면 APPROX로 분류해.
- EXACT면 amount_value(숫자)와 amount_unit(단위: g, ml, 개, 큰술, 작은술 등)을 채우고,
  amount_text는 null로 둬.
- APPROX면 amount_text에 원문 표현을 그대로(혹은 자연스럽게 다듬어서) 적고,
  amount_value와 amount_unit은 둘 다 null로 둬.
- day는 제목이나 설명에 "N일차", "Day N" 같은 표현이 있으면 그 숫자를 쓰고, 못 찾으면 null로 둬.
  추측하지 마.
- 재료가 하나도 안 보이면 ingredients를 빈 배열로 둬.

[제목]
{title}

[설명]
{description}
"""


def extract_recipe(title: str, description: str) -> dict:
    client = genai.Client(api_key=config.GEMINI_API_KEY)

    prompt = PROMPT_TEMPLATE.format(title=title, description=description)

    response = client.models.generate_content(
        model=config.GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=RESPONSE_SCHEMA,
        ),
    )

    return json.loads(response.text)
