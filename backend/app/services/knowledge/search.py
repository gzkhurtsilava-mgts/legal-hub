from sqlalchemy import func, or_

from app.models.knowledge import KnowledgeItem

# ─── EN→RU layout converter ───────────────────────────────────────────────────

_EN_TO_RU_MAP = {
    "q": "й", "w": "ц", "e": "у", "r": "к", "t": "е", "y": "н", "u": "г",
    "i": "ш", "o": "щ", "p": "з", "[": "х", "]": "ъ",
    "a": "ф", "s": "ы", "d": "в", "f": "а", "g": "п", "h": "р", "j": "о",
    "k": "л", "l": "д", ";": "ж", "'": "э",
    "z": "я", "x": "ч", "c": "с", "v": "м", "b": "и", "n": "т", "m": "ь",
    ",": "б", ".": "ю",
    "Q": "Й", "W": "Ц", "E": "У", "R": "К", "T": "Е", "Y": "Н", "U": "Г",
    "I": "Ш", "O": "Щ", "P": "З", "{": "Х", "}": "Ъ",
    "A": "Ф", "S": "Ы", "D": "В", "F": "А", "G": "П", "H": "Р", "J": "О",
    "K": "Л", "L": "Д", ":": "Ж", '"': "Э",
    "Z": "Я", "X": "Ч", "C": "С", "V": "М", "B": "И", "N": "Т", "M": "Ь",
    "<": "Б", ">": "Ю",
}
_EN_TO_RU = str.maketrans(_EN_TO_RU_MAP)


def translate_layout(q: str) -> str:
    """Return RU transliteration if q looks like Russian typed in EN layout."""
    latin = sum(1 for c in q if c.isascii() and c.isalpha())
    cyrillic = sum(1 for c in q if "Ѐ" <= c <= "ӿ")
    if latin <= cyrillic:
        return q  # already Russian (or mixed — don't touch)
    return q.translate(_EN_TO_RU)


# ─── Search helpers ───────────────────────────────────────────────────────────

def build_search_conditions(q: str):
    """
    OR-chain of FTS (search_vector) + trigram (title) conditions
    for both the original query and its layout-converted variant.
    """
    q = q.strip()
    if not q:
        return None

    variants: set[str] = {q}
    translated = translate_layout(q)
    if translated != q:
        variants.add(translated)

    conditions = []
    for variant in variants:
        tsq = func.plainto_tsquery("russian", variant)
        conditions.append(KnowledgeItem.search_vector.op("@@")(tsq))
        # trigram for typos / short queries
        conditions.append(KnowledgeItem.title.op("%")(variant))

    return or_(*conditions)


def search_rank(q: str):
    """ts_rank expression for ORDER BY relevance."""
    q_ru = translate_layout(q.strip())
    return func.ts_rank(
        KnowledgeItem.search_vector,
        func.plainto_tsquery("russian", q_ru),
    )
