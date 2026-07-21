"""Модуль «Доверенности» — навигатор заявок (Модуль 4).

ЕДИНЫЙ ИСТОЧНИК правил маршрутизации: и веб-навигатор, и будущий LLM-агент
потребляют этот модуль, чтобы правила не разъехались (актуальный регламент).

Пошаговый движок: по частичным ответам возвращает либо следующий вопрос, либо
готовый маршрут (как только он однозначно определён — опрос прекращается).
"""

# ─── Значения ответов (точные строки — ключи маршрутизации) ──────────────────

# Q1 — количество
ONE = "Одному / себе"
MANY = "Нескольким"

# Q2 — кому
CEO1 = "Сотруднику МГТС (СЕО-1 в пределах 50 млн. руб.)"
OTHERS = "Остальным сотрудникам МГТС (в пределах 30 млн. руб., в т.ч. безденежные доверенности)"
THIRD = "3-му лицу / контрагенту"
BEYOND = "Сотруднику МГТС за пределами финансового лимита"

# Q3 — компания
MGTS = "МГТС"
SUBSIDIARIES = {
    "Комсомольский": (
        "Кузнецов Р.В. — по компании Комсомольский",
        "https://bossreferent.mgts.corp.net/br/sz?create=3B7F716D9AF8EF9C43258D5E0038F034",
    ),
    "МГТС-Н": (
        "Кузнецов Р.В. — по компании МГТС-Н",
        "https://bossreferent.mgts.corp.net/br/sz?create=5C81DFB1094D301F43258DB0002B3D53",
    ),
    "Телеком-Девелопмент": (
        "Кузнецов Р.В. — по компании Телеком-Девелопмент",
        "https://bossreferent.mgts.corp.net/br/sz?create=9B5E9D6B7D07A76243258D5E00393EDC",
    ),
    "БН-Телеком": (
        "Кузнецов Р.В. — по компании БН-Телеком",
        "https://bossreferent.mgts.corp.net/br/sz?create=7A75B75E47BD083943258D5E0038643E",
    ),
    "Орбита": (
        "Кузнецов Р.В. — по компании Орбита",
        "https://bossreferent.mgts.corp.net/br/sz?create=75EE149111B3698643258DB0002B1686",
    ),
}

# Q4 — вид
NOTAR = "Нотариальная"
NOT_NOTAR = "Не нотариальная"

# Q5 — формат
MCHD = "МЧД (электронная)"
PAPER = "Бумажная"

# ─── Ссылки блоков ────────────────────────────────────────────────────────────

URL_GILMANOV = "https://bossreferent.mgts.corp.net/br/sz?create=11DFD9D6792EDDAA43258A6D0048310D"
URL_KUZ_STAFF = "https://bossreferent.mgts.corp.net/br/sz?create=D6848F7F7D99975643258A6E004A1D97"
URL_KUZ_NONSTAFF = "https://bossreferent.mgts.corp.net/br/sz?create=2525D8E503C127F043258A6E004A7D97"
URL_SD_MCHD = "https://servicedesk.mts.ru/blueprints/637b7a6f-86cb-436c-9bf7-cf8d8537acce"
URL_SD_PAPER = "https://servicedesk.mts.ru/blueprints/88218727-3d02-48a2-ac8d-1fdbde4bc83c"

# ─── Вопросы ──────────────────────────────────────────────────────────────────

QUESTIONS: dict[str, dict] = {
    "q1": {"id": "q1", "title": "Сколько поверенных?", "options": [ONE, MANY]},
    "q2": {"id": "q2", "title": "Кому выдаётся доверенность?",
           "options": [CEO1, OTHERS, THIRD, BEYOND]},
    "q3": {"id": "q3", "title": "От какой компании?",
           "options": [MGTS, "Комсомольский", "МГТС-Н", "Телеком-Девелопмент",
                       "БН-Телеком", "Орбита"]},
    "q4": {"id": "q4", "title": "Вид доверенности?", "options": [NOTAR, NOT_NOTAR]},
    "q5": {"id": "q5", "title": "Формат доверенности?", "options": [MCHD, PAPER]},
}

ORDER = ["q1", "q2", "q3", "q4", "q5"]


def _valid(answers: dict) -> None:
    for qid, val in answers.items():
        if qid not in QUESTIONS or val not in QUESTIONS[qid]["options"]:
            raise ValueError(f"Недопустимый ответ на {qid}: {val!r}")


def route(q1=None, q2=None, q3=None, q4=None, q5=None) -> dict:
    """Итоговый маршрут по полным (или достаточным) ответам. Порядок проверок важен."""
    # БЛОК А — Гильманов (перекрывает Q1+Q2 без Q3)
    if (
        (q1 == MANY and q2 == CEO1)
        or (q1 == MANY and q2 == BEYOND)
        or (q1 == ONE and q2 == BEYOND)
    ):
        return {"result": "Оформите служебную записку через Босс-Референт (Гильманов А.Т.)",
                "url": URL_GILMANOV}

    # БЛОК В — нотариальная МЧД + контрагент → Кузнецов НЕ работникам
    if q3 == MGTS and q4 == NOTAR and q5 == MCHD and q2 == THIRD:
        return {"result": "Оформите служебную записку через Босс-Референт (Кузнецов Р.В.) — "
                          "доверенность не работникам МГТС", "url": URL_KUZ_NONSTAFF}

    # БЛОК Б — нотариальная МЧД + сотрудники → Кузнецов работникам
    if q3 == MGTS and q4 == NOTAR and q5 == MCHD and q2 in (CEO1, OTHERS):
        return {"result": "Оформите служебную записку через Босс-Референт (Кузнецов Р.В.) — "
                          "доверенность работникам МГТС", "url": URL_KUZ_STAFF}

    # БЛОК Б общий — Нескольким + сотрудники + МГТС
    if q1 == MANY and q3 == MGTS and q2 == OTHERS:
        return {"result": "Оформите служебную записку через Босс-Референт (Кузнецов Р.В.) — "
                          "доверенность работникам МГТС", "url": URL_KUZ_STAFF}

    # БЛОК В общий — Нескольким + контрагент + МГТС
    if q1 == MANY and q3 == MGTS and q2 == THIRD:
        return {"result": "Оформите служебную записку через Босс-Референт (Кузнецов Р.В.) — "
                          "доверенность не работникам МГТС", "url": URL_KUZ_NONSTAFF}

    # БЛОКИ дочек Г–З — по Q3
    if q3 in SUBSIDIARIES:
        label, url = SUBSIDIARIES[q3]
        return {"result": f"Оформите служебную записку через Босс-Референт ({label})", "url": url}

    # БЛОК И — ServiceDesk МЧД (только НЕ нотариальная)
    if q3 == MGTS and q4 == NOT_NOTAR and q5 == MCHD:
        return {"result": "Оформите заявку в ServiceDesk — МЧД", "url": URL_SD_MCHD}

    # БЛОК К — ServiceDesk Бумажная
    if q3 == MGTS and q5 == PAPER:
        note = (" Важно: не забудьте выбрать вид «Нотариальная» в самой заявке."
                if q4 == NOTAR else "")
        return {"result": f"Оформите заявку в ServiceDesk — Письменная доверенность.{note}",
                "url": URL_SD_PAPER}

    return {"result": "Ваш случай нестандартный — обратитесь к юристу БПО напрямую.", "url": None}


def _next_question_id(a: dict) -> str | None:
    """Следующий нужный вопрос или None (маршрут уже определён)."""
    if "q1" not in a:
        return "q1"
    if "q2" not in a:
        return "q2"
    # Ранние результаты после Q2 (Блок А): за пределами лимита или Нескольким+СЕО-1
    if a["q2"] == BEYOND or (a.get("q1") == MANY and a["q2"] == CEO1):
        return None
    if "q3" not in a:
        return "q3"
    if a["q3"] != MGTS:  # дочка — маршрут по Q3
        return None
    # Q3 = МГТС → нужны вид и формат
    if "q4" not in a:
        return "q4"
    if "q5" not in a:
        return "q5"
    return None


def _estimate_total(a: dict) -> int:
    """Оценка длины пути (для прогресс-бара). Ответы могут прийти не по порядку
    (API-first: бот/LLM-агент) — не полагаемся на наличие q1 при данном q2."""
    if "q2" in a and (a["q2"] == BEYOND or (a.get("q1") == MANY and a["q2"] == CEO1)):
        return 2
    if a.get("q3") and a["q3"] != MGTS:
        return 3
    if a.get("q3") == MGTS:
        return 5
    return 5  # до Q3 путь ещё не определён — верхняя оценка


def step(answers: dict) -> dict:
    """Пошаговый движок: следующий вопрос или итоговый маршрут."""
    _valid(answers)
    answered = len(answers)
    total = _estimate_total(answers)
    nq = _next_question_id(answers)
    if nq is None:
        r = route(
            answers.get("q1"), answers.get("q2"), answers.get("q3"),
            answers.get("q4"), answers.get("q5"),
        )
        return {"status": "result", "answered": answered, "total": total,
                "question": None, "result": r["result"], "url": r["url"]}
    return {"status": "question", "answered": answered, "total": total,
            "question": QUESTIONS[nq], "result": None, "url": None}
