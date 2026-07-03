"""M4 (Фаза 2): навигатор заявок — маршрутизация (все блоки) + пошаговый движок.

route()/step() — чистые функции (без БД). HTTP-проверка: навигатор доступен
роли employee (самообслуживание)."""

import pytest

from app.services.poa import navigator as nav
from app.services.poa.navigator import (
    BEYOND,
    CEO1,
    MANY,
    MCHD,
    MGTS,
    NOT_NOTAR,
    NOTAR,
    ONE,
    OTHERS,
    PAPER,
    THIRD,
)

pytestmark = pytest.mark.asyncio


# ─── route(): блоки маршрутизации ─────────────────────────────────────────────


def test_block_a_gilmanov():
    assert "Гильманов" in nav.route(MANY, CEO1)["result"]
    assert "Гильманов" in nav.route(MANY, BEYOND)["result"]
    assert "Гильманов" in nav.route(ONE, BEYOND)["result"]
    assert nav.route(MANY, CEO1)["url"] == nav.URL_GILMANOV


def test_block_b_notarial_mchd_staff():
    r = nav.route(ONE, OTHERS, MGTS, NOTAR, MCHD)
    assert r["url"] == nav.URL_KUZ_STAFF and "работникам МГТС" in r["result"]
    # для СЕО-1 (не Нескольким) тоже Б, а не Гильманов
    assert nav.route(ONE, CEO1, MGTS, NOTAR, MCHD)["url"] == nav.URL_KUZ_STAFF


def test_block_v_notarial_mchd_contractor():
    r = nav.route(ONE, THIRD, MGTS, NOTAR, MCHD)
    assert r["url"] == nav.URL_KUZ_NONSTAFF and "НЕ работникам" in r["result"]


def test_block_b_general():
    assert nav.route(MANY, OTHERS, MGTS)["url"] == nav.URL_KUZ_STAFF


def test_block_v_general():
    assert nav.route(MANY, THIRD, MGTS)["url"] == nav.URL_KUZ_NONSTAFF


def test_subsidiaries_by_q3_only():
    # Дочка определяется по Q3; проверяем достижимые комбинации Q1/Q2
    # (MANY+CEO1 недостижим — перехватывается Блоком А до Q3).
    for company, (_, url) in nav.SUBSIDIARIES.items():
        assert nav.route(ONE, THIRD, company)["url"] == url
        assert nav.route(ONE, OTHERS, company)["url"] == url
        assert nav.route(MANY, OTHERS, company)["url"] == url


def test_block_i_servicedesk_mchd():
    assert nav.route(ONE, OTHERS, MGTS, NOT_NOTAR, MCHD)["url"] == nav.URL_SD_MCHD


def test_block_k_paper():
    r = nav.route(ONE, OTHERS, MGTS, NOT_NOTAR, PAPER)
    assert r["url"] == nav.URL_SD_PAPER and "❗" not in r["result"]
    # нотариальная бумажная — та же ссылка + предупреждение
    r2 = nav.route(ONE, OTHERS, MGTS, NOTAR, PAPER)
    assert r2["url"] == nav.URL_SD_PAPER and "❗" in r2["result"]


def test_edge_notarial_mchd_never_servicedesk():
    # нотариальная МЧД → Босс-Референт (Б/В), не ServiceDesk
    assert nav.route(ONE, OTHERS, MGTS, NOTAR, MCHD)["url"] != nav.URL_SD_MCHD


def test_fallback():
    assert nav.route(ONE, CEO1, MGTS, None, None)["url"] is None  # МГТС без вида/формата


# ─── step(): пошаговый движок ─────────────────────────────────────────────────


def test_step_asks_q1_then_q2():
    assert nav.step({})["question"]["id"] == "q1"
    assert nav.step({"q1": ONE})["question"]["id"] == "q2"


def test_step_early_gilmanov_skips_q3():
    r = nav.step({"q1": MANY, "q2": CEO1})
    assert r["status"] == "result" and r["url"] == nav.URL_GILMANOV
    r2 = nav.step({"q1": ONE, "q2": BEYOND})
    assert r2["status"] == "result" and r2["url"] == nav.URL_GILMANOV


def test_step_one_ceo1_needs_q3():
    # ОДНОМУ + СЕО-1 — не Гильманов, спрашиваем компанию
    assert nav.step({"q1": ONE, "q2": CEO1})["question"]["id"] == "q3"


def test_step_subsidiary_result_after_q3():
    r = nav.step({"q1": ONE, "q2": OTHERS, "q3": "Орбита"})
    assert r["status"] == "result" and "Орбита" in r["result"]


def test_step_mgts_asks_q4_q5_then_result():
    a = {"q1": ONE, "q2": OTHERS, "q3": MGTS}
    assert nav.step(a)["question"]["id"] == "q4"
    a["q4"] = NOT_NOTAR
    assert nav.step(a)["question"]["id"] == "q5"
    a["q5"] = MCHD
    r = nav.step(a)
    assert r["status"] == "result" and r["url"] == nav.URL_SD_MCHD
    assert r["total"] == 5


def test_step_invalid_answer_raises():
    with pytest.raises(ValueError):
        nav.step({"q1": "мусор"})


# ─── HTTP: доступ employee ────────────────────────────────────────────────────


async def test_navigator_available_to_employee(client, as_employee):
    r = await client.post("/api/poa/navigator/step", json={})
    assert r.status_code == 200
    assert r.json()["question"]["id"] == "q1"

    r2 = await client.post("/api/poa/navigator/step",
                           json={"q1": MANY, "q2": CEO1})
    assert r2.status_code == 200
    assert r2.json()["status"] == "result"


async def test_navigator_bad_answer_400(client, as_employee):
    r = await client.post("/api/poa/navigator/step", json={"q1": "нет такого"})
    assert r.status_code == 400
