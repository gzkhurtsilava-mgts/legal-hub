"""Склонение ФИО в винительный падеж для тела доверенности.

«…уполномочивает (кого?) <Фамилию Имя Отчество в винительном падеже>»:
Кузнецову Елену Владимировну / Кузнецова Сергея Петровича. У мужских
одушевлённых форм винительный совпадает с родительным, у женских — отличается.

Используется petrovich (правила склонения русских ФИО): корректно оставляет
несклоняемые фамилии (-ко, -ых/-их, женские на согласный, иностранные на
гласный) и склоняет остальные. Род определяется по окончанию отчества; если
отчества нет или окончание незнакомое — ФИО не склоняется вовсе (склонение
мужскими правилами коверкает женские фамилии: «Седых Анна» → «Седыха Анна»).
При ошибке склонения часть возвращается как есть.
"""
from petrovich.enums import Case, Gender
from petrovich.main import Petrovich

_p = Petrovich()


def _detect_gender(middlename: str) -> int | None:
    """Род по окончанию отчества; None — определить нельзя."""
    m = middlename.lower()
    if m.endswith(("вич", "оглы", "уулу")):
        return Gender.MALE
    if m.endswith(("вна", "кызы", "гызы")):
        return Gender.FEMALE
    return None


def to_accusative(fio: str) -> str:
    """«Кузнецова Елена Владимировна» → «Кузнецову Елену Владимировну».

    Ожидает порядок «Фамилия Имя Отчество». Пустые/лишние части пропускаются;
    при ошибке склонения возвращает исходную часть без изменений. Без отчества
    род не определить — ФИО возвращается в именительном падеже как есть.
    """
    parts = fio.split()
    if not parts:
        return fio
    last = parts[0] if len(parts) > 0 else ""
    first = parts[1] if len(parts) > 1 else ""
    middle = " ".join(parts[2:]) if len(parts) > 2 else ""
    gender = _detect_gender(middle)
    if gender is None:
        return fio

    out: list[str] = []
    for value, decliner in (
        (last, _p.lastname),
        (first, _p.firstname),
        (middle, _p.middlename),
    ):
        if not value:
            continue
        try:
            out.append(decliner(value, Case.ACCUSATIVE, gender))
        except Exception:
            out.append(value)
    return " ".join(out)
