"""M3: склонение ФИО для тела доверенности (petrovich).

Род определяется только по отчеству. Без отчества ФИО не склоняется:
мужские правила коверкают женские/несклоняемые фамилии («Седых Анна» →
«Седыха Анна»), а юридический документ важнее грамматики.
"""

from app.services.poa.morph import to_accusative


def test_full_fio_declined():
    assert to_accusative("Кузнецова Елена Владимировна") == "Кузнецову Елену Владимировну"
    assert to_accusative("Кузнецов Сергей Петрович") == "Кузнецова Сергея Петровича"


def test_indeclinable_lastname_kept():
    assert to_accusative("Седых Ольга Ивановна") == "Седых Ольгу Ивановну"


def test_no_patronymic_left_as_is():
    assert to_accusative("Седых Анна") == "Седых Анна"
    assert to_accusative("Кузнецова Елена") == "Кузнецова Елена"
    assert to_accusative("Иванов") == "Иванов"


def test_empty_string():
    assert to_accusative("") == ""
