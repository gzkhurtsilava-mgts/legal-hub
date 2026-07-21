# ruff: noqa: E501  — таблица каталога: строки-кортежи намеренно длинные, перенос ухудшает читаемость
"""Каталог полномочий: метаданные + гранты по подразделениям.

Тексты (`text_full`) НЕ хранятся здесь — берутся дословно из исходных документов
через `poa_texts.load_texts()`. Здесь только: категория, короткая подпись (UI),
вид, направление сделки, флаги лимита и перечень узлов оргструктуры, в чьём
разделе документа это полномочие буквально присутствует.

Универсальных («доступно везде») полномочий нет: каждое полномочие выдаётся
только тем подразделениям, в разделе которых оно перечислено в документе.
Повторяющиеся дословно формулировки (NDA, обмен ЭДО, представительство и т.п.)
дедуплицированы в один код с грантами на несколько узлов.
"""
from app.models.poa import AuthorityKind as K
from app.models.poa import DealDirection as D

# (code, cat, short, kind, direction, limit, no_limit, scopes)
_C = [
    # ── Коммерческий блок ──
    ("POA-DEAL-010", "deal-sales", "Сбытовые договоры (любая цена)", K.deal, D.income, 0, 0, ["comm"]),
    ("POA-DEAL-011", "deal-procure", "Закупочно-сбытовые договоры ≤150 млн", K.deal, D.expense, 1, 0, ["comm"]),
    ("POA-DEAL-018", "deal-sales", "Соглашения о компенсации потерь", K.deal, D.income, 0, 0, ["comm"]),
    ("POA-DEAL-019", "deal-sales", "Возмещение расходов ПАО МГТС", K.deal, D.income, 0, 0, ["comm"]),
    ("POA-DEAL-003", "deal-agree", "Меморандумы о намерениях и сотрудничестве", K.deal, D.na, 0, 0, ["comm"]),
    ("POA-DEAL-001", "deal-agree", "Соглашения о конфиденциальности", K.deal, D.na, 0, 0, ["comm", "legal", "admin"]),
    ("POA-DEAL-002", "deal-agree", "Обмен электронными документами", K.deal, D.na, 0, 0, ["comm", "legal", "admin"]),
    ("POA-SIGN-002", "sign-primary", "Счета, счета-фактуры и акты", K.action, D.na, 0, 0, ["comm"]),
    ("POA-SIGN-001", "sign-tmc", "Доверенности на получение ТМЦ", K.action, D.na, 0, 0, ["comm"]),
    ("POA-ACT-010", "act-ops", "Рассрочки и отсрочки платежей", K.action, D.na, 0, 0, ["comm"]),
    ("POA-REP-010", "rep-third", "Договоры МГ/МН связи от имени операторов", K.representation, D.na, 0, 0, ["comm"]),
    ("POA-REP-011", "rep-third", "Договоры подвижной связи от имени ПАО МТС", K.representation, D.na, 0, 0, ["comm"]),
    ("POA-REP-012", "rep-third", "Документы по агентскому договору с ОАО МТТ", K.representation, D.na, 0, 0, ["comm"]),
    ("POA-ACT-002", "act-certify", "Заверение копий документов", K.action, D.na, 0, 0, ["comm"]),
    ("POA-REP-002", "rep-gov", "Защита по делам об адм. правонарушениях", K.representation, D.na, 0, 0, ["comm"]),
    ("POA-ACT-001", "act-secrecy", "Защита охраняемой законом тайны", K.action, D.na, 0, 0, ["comm"]),
    ("POA-REP-001", "rep-gov", "Представительство в госорганах и судах", K.representation, D.na, 0, 0, ["comm", "tech"]),
    # ── Технический блок ──
    ("POA-DEAL-020", "deal-infra", "Сделки техблока ≤50 млн (п. 1)", K.deal, D.expense, 1, 0, ["tech"]),
    ("POA-DEAL-029", "deal-infra", "Сделки техблока без ограничения цены (п. 2)", K.deal, D.expense, 0, 1, ["tech"]),
    ("POA-DEAL-033", "deal-infra", "Техприсоединение и NDA техблока (п. 3)", K.deal, D.expense, 0, 0, ["tech"]),
    ("POA-ACT-024", "act-certify", "Заверение копий договоров (архитектура ИТ)", K.action, D.na, 0, 0, ["tech"]),
    ("POA-SIGN-020", "sign-primary", "Подписание документов техблока (п. 4)", K.action, D.na, 0, 0, ["tech"]),
    ("POA-ACT-020", "act-tech", "ТУ на прокладку средств связи в ЛКС", K.action, D.na, 0, 0, ["tech"]),
    ("POA-ACT-021", "act-tech", "Утверждение ТЗ на проектирование", K.action, D.na, 0, 0, ["tech"]),
    ("POA-ACT-025", "act-tech", "ТУ на присоединение сетей электросвязи", K.action, D.na, 0, 0, ["tech"]),
    ("POA-ACT-026", "act-tech", "ТУ на размещение/демонтаж оборудования", K.action, D.na, 0, 0, ["tech"]),
    ("POA-ACT-027", "act-tech", "Схемы организации связи для нумерации", K.action, D.na, 0, 0, ["tech"]),
    ("POA-ACT-028", "act-tech", "ТУ на телефонизацию, интернет, IP TV", K.action, D.na, 0, 0, ["tech"]),
    ("POA-ACT-029", "act-tech", "ТУ на строительство/демонтаж в ЛКС", K.action, D.na, 0, 0, ["tech"]),
    ("POA-ACT-030", "act-tech", "ТУ на прокладку кабеля в ЛКС", K.action, D.na, 0, 0, ["tech"]),
    ("POA-ACT-031", "act-tech", "Техпроекты в ЛКС (СКТВ)", K.action, D.na, 0, 0, ["tech"]),
    ("POA-ACT-032", "act-tech", "Разрешения на работы в ЛКС", K.action, D.na, 0, 0, ["tech"]),
    ("POA-ACT-033", "act-tech", "Разрешения на допуск в помещения", K.action, D.na, 0, 0, ["tech"]),
    ("POA-ACT-034", "act-tech", "Техпроекты на строительство линий связи", K.action, D.na, 0, 0, ["tech"]),
    ("POA-ACT-023", "act-tech", "Локальные сметы (ремонт, ПСД)", K.action, D.na, 0, 0, ["tech"]),
    ("POA-DEAL-034", "deal-agree", "Соглашения об условиях работ в ЛКС", K.deal, D.na, 0, 0, ["tech"]),
    ("POA-ACT-035", "act-tech", "Локальные сметы по договорам п. 1–4", K.action, D.na, 0, 0, ["tech"]),
    # ── Блок безопасности и режима секретности ──
    ("POA-DEAL-040", "deal-procure", "Сделки безопасности ≤50 млн (п. 1)", K.deal, D.expense, 1, 0, ["sec"]),
    ("POA-DEAL-045", "deal-sales", "Услуги связи по формам (любая сумма)", K.deal, D.income, 0, 0, ["sec"]),
    ("POA-DEAL-046", "deal-sales", "Договоры/госконтракты (п. 3)", K.deal, D.income, 0, 0, ["sec"]),
    ("POA-ACT-011", "act-ops", "Решения по отсрочкам и схемам связи", K.action, D.na, 0, 0, ["sec"]),
    ("POA-REP-013", "rep-third", "Договоры МГ/МН связи от имени операторов (безопасность)", K.representation, D.na, 0, 0, ["sec"]),
    ("POA-REP-014", "rep-third", "Договоры подвижной связи от имени ПАО МТС (безопасность)", K.representation, D.na, 0, 0, ["sec"]),
    ("POA-DEAL-047", "deal-agree", "NDA и допсоглашения по гостайне", K.deal, D.na, 0, 0, ["sec"]),
    ("POA-REP-041", "rep-tender", "Торги для госнужд (безопасность)", K.representation, D.na, 0, 0, ["sec"]),
    ("POA-SIGN-041", "sign-procure", "Подписание документов (безопасность)", K.action, D.na, 0, 0, ["sec"]),
    ("POA-SIGN-040", "sign-gov", "Служебные удостоверения и пропуска", K.action, D.na, 0, 0, ["sec"]),
    ("POA-ACT-040", "act-secrecy", "Согласование выезда секретоносителей", K.action, D.na, 0, 0, ["sec"]),
    ("POA-ACT-041", "act-secrecy", "Выезд с допуском «совершенно секретно»", K.action, D.na, 0, 0, ["sec"]),
    ("POA-ACT-043", "act-secrecy", "Документы о выезде (формы 17/18)", K.action, D.na, 0, 0, ["sec"]),
    ("POA-ACT-044", "act-secrecy", "Допуск к гостайне (форма № 1)", K.action, D.na, 0, 0, ["sec"]),
    ("POA-ACT-045", "act-secrecy", "Отработка секретных документов", K.action, D.na, 0, 0, ["sec"]),
    ("POA-ACT-046", "act-secrecy", "Вскрытие секретных пакетов «лично»", K.action, D.na, 0, 0, ["sec"]),
    ("POA-REP-042", "rep-gov", "Защита по адм. правонарушениям (тайна)", K.representation, D.na, 0, 0, ["sec"]),
    ("POA-REP-040", "rep-gov", "Представительство в правоохранительных органах", K.representation, D.na, 0, 0, ["sec"]),
    ("POA-ACT-042", "act-secrecy", "Орган по аттестации объектов информатизации", K.action, D.na, 0, 0, ["sec"]),
    # ── Финансовый блок ──
    ("POA-DEAL-050", "deal-fin", "Любые сделки гражданско-правового характера", K.deal, D.expense, 0, 1, ["fin"]),
    ("POA-SIGN-056", "sign-primary", "Подписание документов (финблок)", K.action, D.na, 0, 0, ["fin"]),
    ("POA-SIGN-050", "sign-corp", "Векселя", K.action, D.na, 0, 0, ["fin"]),
    ("POA-SIGN-051", "sign-corp", "Раскрытие информации эмитента", K.action, D.na, 0, 0, ["fin"]),
    ("POA-SIGN-057", "sign-corp", "Списки инсайдеров", K.action, D.na, 0, 0, ["fin"]),
    ("POA-SIGN-052", "sign-gov", "Документы валютного контроля", K.action, D.na, 0, 0, ["fin"]),
    ("POA-ACT-050", "act-ops", "Банковское обслуживание и ДБО", K.action, D.na, 0, 0, ["fin"]),
    ("POA-SIGN-058", "sign-corp", "Пластиковые карты работников", K.action, D.na, 0, 0, ["fin"]),
    ("POA-SIGN-059", "sign-corp", "Документы по системе ДБО", K.action, D.na, 0, 0, ["fin"]),
    ("POA-SIGN-100", "sign-corp", "Переход прав на ценные бумаги", K.action, D.na, 0, 0, ["fin"]),
    ("POA-SIGN-101", "sign-gov", "Статистическая и регуляторная отчётность", K.action, D.na, 0, 0, ["fin"]),
    ("POA-SIGN-054", "sign-primary", "Претензии", K.action, D.na, 0, 0, ["fin"]),
    ("POA-ACT-051", "act-ops", "Утверждение закупочной документации", K.action, D.na, 0, 0, ["fin"]),
    ("POA-SIGN-103", "sign-procure", "Протоколы закупок >50 млн (ИКК)", K.action, D.na, 0, 0, ["fin"]),
    ("POA-SIGN-104", "sign-procure", "Протоколы закупок >150 млн (ИКК)", K.action, D.na, 0, 0, ["fin"]),
    ("POA-ACT-053", "act-ops", "Проведение закупочных процедур", K.action, D.na, 0, 0, ["fin"]),
    ("POA-ACT-052", "act-certify", "Заверение финансовых и учредительных копий", K.action, D.na, 0, 0, ["fin"]),
    ("POA-REP-050", "rep-corp", "Представительство акционера", K.representation, D.na, 0, 0, ["fin"]),
    ("POA-REP-051", "rep-gov", "Представительство в госорганах (финблок)", K.representation, D.na, 0, 0, ["fin"]),
    # ── Блок по управлению персоналом ──
    ("POA-DEAL-060", "deal-hr", "Договоры по управлению персоналом ≤50 млн", K.deal, D.expense, 1, 0, ["hr"]),
    ("POA-DEAL-066", "deal-hr", "Трудовые договоры и соглашения", K.deal, D.na, 0, 0, ["hr"]),
    ("POA-SIGN-060", "sign-hr", "Кадровые документы и отчётность в СФР", K.action, D.na, 0, 0, ["hr"]),
    ("POA-ACT-060", "act-certify", "Заверение кадровых копий", K.action, D.na, 0, 0, ["hr"]),
    ("POA-ACT-110", "act-ops", "Переписка и коммерческие предложения (персонал)", K.action, D.na, 0, 0, ["hr"]),
    # ── Блок правового обеспечения ──
    ("POA-DEAL-070", "deal-procure", "Расходные договоры ≤30 млн", K.deal, D.expense, 1, 0, ["legal"]),
    ("POA-DEAL-071", "deal-agree", "Меморандумы о намерениях (правовой блок)", K.deal, D.na, 0, 0, ["legal"]),
    ("POA-SIGN-071", "sign-primary", "Акты по договорам (включая Интерфакс)", K.action, D.na, 0, 0, ["legal"]),
    ("POA-SIGN-072", "sign-corp", "Раскрытие информации эмитента (правовой блок)", K.action, D.na, 0, 0, ["legal"]),
    ("POA-REP-071", "rep-corp", "Представительство акционера (участника)", K.representation, D.na, 0, 0, ["legal"]),
    ("POA-ACT-070", "act-certify", "Заверение копий (правовой блок)", K.action, D.na, 0, 0, ["legal"]),
    ("POA-SIGN-073", "sign-procure", "ОВП и протоколы закупок ≤30 млн", K.action, D.na, 1, 0, ["legal"]),
    ("POA-SIGN-070", "sign-letters", "Письма, справки, запросы, уведомления", K.action, D.na, 0, 0, ["legal"]),
    ("POA-REP-070", "rep-gov", "Представительство по всем вопросам", K.representation, D.na, 0, 0, ["legal"]),
    # ── Административный блок ──
    ("POA-DEAL-080", "deal-procure", "Закупочно-сбытовые договоры ≤150 млн (админ)", K.deal, D.expense, 1, 0, ["admin"]),
    ("POA-DEAL-085", "deal-infra", "Аренда у группы АФК «Система» (без лимита)", K.deal, D.expense, 0, 1, ["admin"]),
    ("POA-SIGN-081", "sign-procure", "ОВП и протоколы закупок ≤150 млн", K.action, D.na, 1, 0, ["admin"]),
    ("POA-SIGN-082", "sign-gov", "Экологические декларации (Мосводосток)", K.action, D.na, 0, 0, ["admin"]),
    ("POA-SIGN-080", "sign-gov", "Экологическая отчётность", K.action, D.na, 0, 0, ["admin"]),
    ("POA-REP-080", "rep-gov", "Защита по адм. правонарушениям (экология)", K.representation, D.na, 0, 0, ["admin"]),
    ("POA-REP-082", "rep-gov", "Представительство в госорганах (админ)", K.representation, D.na, 0, 0, ["admin"]),
    # ── Блок информационных технологий ──
    ("POA-DEAL-091", "deal-it", "Договоры ИТ (сбыт без лимита, закупка ≤100 млн)", K.deal, D.expense, 1, 0, ["it"]),
    ("POA-SIGN-091", "sign-primary", "Подписание документов ИТ (счета, акты)", K.action, D.na, 0, 0, ["it"]),
    ("POA-SIGN-090", "sign-corp", "Гарантийные письма ИТ (в пределах лимита)", K.action, D.na, 1, 0, ["it"]),
    ("POA-SIGN-092", "sign-procure", "ОВП и протоколы закупок ≤500 тыс. (ИТ)", K.action, D.na, 1, 0, ["it"]),
    ("POA-SIGN-093", "sign-tmc", "Доверенности на ТМЦ (ИТ)", K.action, D.na, 0, 0, ["it"]),
    ("POA-DEAL-092", "deal-agree", "Соглашения о конфиденциальности (ИТ)", K.deal, D.na, 0, 0, ["it"]),
    ("POA-ACT-092", "act-certify", "Заверение копий (ИТ)", K.action, D.na, 0, 0, ["it"]),
    ("POA-REP-091", "rep-gov", "Защита по адм. правонарушениям (ИТ)", K.representation, D.na, 0, 0, ["it"]),
    ("POA-ACT-091", "act-secrecy", "Защита охраняемой тайны (ИТ)", K.action, D.na, 0, 0, ["it"]),
    ("POA-REP-090", "rep-gov", "Представительство в госорганах (ИТ)", K.representation, D.na, 0, 0, ["it"]),
    # ── CEO-2: Департамент взаимодействия с государственными заказчиками ──
    ("POA-DEAL-180", "deal-sales", "Сбытовые договоры с госзаказчиками", K.deal, D.income, 0, 0, ["dep-gov"]),
    ("POA-DEAL-181", "deal-procure", "Закупки для госпроектов ≤50 млн", K.deal, D.expense, 1, 0, ["dep-gov"]),
    ("POA-DEAL-182", "deal-agree", "NDA и соглашения о намерениях (госпроекты)", K.deal, D.na, 0, 0, ["dep-gov"]),
    ("POA-SIGN-181", "sign-primary", "Документы по договорам (госпроекты)", K.action, D.na, 0, 0, ["dep-gov"]),
    ("POA-REP-180", "rep-tender", "Участие в закупках любых заказчиков", K.representation, D.na, 0, 0, ["dep-gov"]),
    ("POA-ACT-180", "act-ops", "Переписка и коммерческие предложения (госпроекты)", K.action, D.na, 0, 0, ["dep-gov"]),
    ("POA-REP-181", "rep-gov", "Представительство в госорганах (госпроекты)", K.representation, D.na, 0, 0, ["dep-gov"]),
    # ── CEO-2: Департамент коммерческого развития инфраструктуры ──
    ("POA-DEAL-150", "deal-sales", "Сбытовые и закупочно-сбытовые договоры (ДКРИ)", K.deal, D.income, 0, 0, ["dep-dkri"]),
    ("POA-SIGN-150", "sign-primary", "Переписка и подписание документов (ДКРИ)", K.action, D.na, 0, 0, ["dep-dkri"]),
    ("POA-DEAL-154", "deal-agree", "Соглашения о ведении переговоров (ДКРИ)", K.deal, D.na, 0, 0, ["dep-dkri"]),
    ("POA-ACT-150", "act-ops", "Перерасчёты начислений (ДКРИ)", K.action, D.na, 0, 0, ["dep-dkri"]),
    ("POA-REP-150", "rep-tender", "Торги для госнужд (ДКРИ)", K.representation, D.na, 0, 0, ["dep-dkri"]),
    ("POA-SIGN-154", "sign-procure", "ОВП ≤10 млн (ДКРИ)", K.action, D.na, 1, 0, ["dep-dkri"]),
    # ── CEO-2: Департамент сопровождения проектов по компенсации потерь ──
    ("POA-DEAL-160", "deal-sales", "Соглашения о компенсации потерь (без лимита)", K.deal, D.na, 0, 1, ["dep-compens"]),
    ("POA-DEAL-161", "deal-infra", "ПИР/СМР по компенсации потерь ≤5 млн", K.deal, D.expense, 1, 0, ["dep-compens"]),
    ("POA-ACT-161", "act-ops", "Переписка по доходным договорам (компенсация)", K.action, D.na, 0, 0, ["dep-compens"]),
    ("POA-SIGN-160", "sign-primary", "Подписание документов (компенсация потерь)", K.action, D.na, 0, 0, ["dep-compens"]),
    ("POA-ACT-162", "act-tech", "Утверждение локальных смет (компенсация)", K.action, D.na, 0, 0, ["dep-compens"]),
    ("POA-ACT-160", "act-certify", "Заверение копий (компенсация потерь)", K.action, D.na, 0, 0, ["dep-compens"]),
    # ── CEO-2: Центр продаж и реализации новых услуг и сервисов ──
    ("POA-DEAL-190", "deal-sales", "Доходные договоры центра продаж ≤50 млн", K.deal, D.expense, 1, 0, ["center-sales"]),
    ("POA-DEAL-191", "deal-procure", "Расходные договоры центра ≤30 млн", K.deal, D.expense, 1, 0, ["center-sales"]),
    ("POA-DEAL-192", "deal-agree", "Соглашения о конфиденциальности (центр)", K.deal, D.na, 0, 0, ["center-sales"]),
    ("POA-DEAL-193", "deal-agree", "Соглашения о намерениях (центр)", K.deal, D.na, 0, 0, ["center-sales"]),
    ("POA-SIGN-192", "sign-primary", "Подписание актов и счетов (центр)", K.action, D.na, 0, 0, ["center-sales"]),
    ("POA-SIGN-190", "sign-letters", "Коммерческие предложения без ограничения суммы", K.action, D.na, 0, 0, ["center-sales"]),
    ("POA-SIGN-191", "sign-primary", "Корректировка расчётов (центр)", K.action, D.na, 0, 0, ["center-sales"]),
    ("POA-ACT-190", "act-ops", "Приёмка и передача товара (центр)", K.action, D.na, 0, 0, ["center-sales"]),
    ("POA-ACT-191", "act-ops", "Переписка с юрлицами (центр)", K.action, D.na, 0, 0, ["center-sales"]),
    # ── CEO-2: Центр технического развития новых услуг и сервисов ──
    ("POA-DEAL-200", "deal-procure", "Сделки ДРИП ≤30 млн", K.deal, D.expense, 1, 0, ["center-tech"]),
    ("POA-DEAL-201", "deal-procure", "Заказы к рамочным договорам ДРИП ≤30 млн", K.deal, D.expense, 1, 0, ["center-tech"]),
    ("POA-SIGN-200", "sign-primary", "Подписание документов ДРИП", K.action, D.na, 0, 0, ["center-tech"]),
    ("POA-SIGN-203", "sign-tmc", "Доверенности на ТМЦ (ДРИП)", K.action, D.na, 0, 0, ["center-tech"]),
    ("POA-ACT-003", "act-secrecy", "Защита охраняемой тайны (ДРИП)", K.action, D.na, 0, 0, ["center-tech"]),
]


def catalog(texts: dict) -> list[dict]:
    """Собирает записи каталога, подставляя дословный текст по коду."""
    out = []
    for code, cat, short, kind, direction, limit, no_limit, scopes in _C:
        if code not in texts:
            raise KeyError(f"Нет дословного текста для {code}")
        out.append(dict(
            code=code, cat=cat, short=short, full=texts[code], kind=kind,
            direction=direction, limit=bool(limit), no_limit=bool(no_limit),
            scopes=list(scopes),
        ))
    return out
