"""Rebuild sections/tags: entity_type, new 3-level structure, test data

Revision ID: d4e5f6a7b8c9
Revises: c1d2e3f4a5b6
Create Date: 2026-06-03
"""
from alembic import op
import sqlalchemy as sa

revision = 'd4e5f6a7b8c9'
down_revision = 'c1d2e3f4a5b6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('tags', sa.Column('entity_type', sa.String(20), nullable=True))

    # Clear old seed data in correct FK order
    op.execute("DELETE FROM user_favorites")
    op.execute("DELETE FROM knowledge_item_tags")
    op.execute("DELETE FROM knowledge_items")
    op.execute("DELETE FROM sections WHERE parent_id IS NOT NULL")
    op.execute("DELETE FROM sections WHERE parent_id IS NULL")
    op.execute("DELETE FROM tags")

    op.execute("SELECT setval('sections_id_seq', 1, false)")
    op.execute("SELECT setval('tags_id_seq', 1, false)")
    op.execute("SELECT setval('knowledge_items_id_seq', 1, false)")

    # Top-level sections
    op.execute("""
        INSERT INTO sections (name, slug, description, visibility, order_index, created_at, updated_at) VALUES
        ('Бизнес',  'biznes',   'Правовые вопросы бизнес-подразделений МГТС', 'public', 1, NOW(), NOW()),
        ('Право',   'pravo',    'Нормативная база, судебная практика, НПА',    'public', 2, NOW(), NOW()),
        ('Общее',   'obshchee', 'Общая информация и справочные материалы',      'public', 3, NOW(), NOW())
    """)

    # Subsections of Бизнес
    op.execute("""
        INSERT INTO sections (parent_id, name, slug, visibility, order_index, created_at, updated_at)
        SELECT s.id, v.name, v.slug, 'public', v.ord, NOW(), NOW()
        FROM sections s
        JOIN (VALUES
            ('Коммерческий блок',                      'kommercheskiy-blok',    1),
            ('Блок информационных технологий',          'blok-it',               2),
            ('Финансовый блок',                        'finansovyy-blok',       3),
            ('Технический блок',                       'tekhnicheskiy-blok',    4),
            ('Блок безопасности и режима секретности', 'blok-bezopasnosti',     5),
            ('Административный блок',                  'administrativnyy-blok', 6),
            ('Блок по управлению персоналом',          'blok-hr',               7)
        ) AS v(name, slug, ord) ON TRUE
        WHERE s.slug = 'biznes'
    """)

    # Tags per entity type
    op.execute("""
        INSERT INTO tags (name, slug, color, entity_type) VALUES
        ('Практика',         'praktika',          '#008ae0', 'article'),
        ('Методология',      'metodologiya',      '#7c3aed', 'article'),
        ('Аналитика',        'analitika',         '#0891b2', 'article'),
        ('Обзор',            'obzor',             '#059669', 'article'),
        ('Договор',          'dogovor-tag',       '#7c3aed', 'document'),
        ('Регламент',        'reglament-tag',     '#008ae0', 'document'),
        ('Инструкция',       'instrukciya-tag',   '#059669', 'document'),
        ('Шаблон',           'shablon-tag',       '#6b7280', 'document'),
        ('Законодательство', 'zakonodatelstvo',   '#1d4ed8', 'link'),
        ('Реестр',           'reestr',            '#0891b2', 'link'),
        ('Ресурс',           'resurs',            '#059669', 'link'),
        ('Справочник',       'spravochnik',       '#6b7280', 'link'),
        ('Процедуры',        'procedury',         '#008ae0', 'faq'),
        ('Сроки',            'sroki',             '#f59e0b', 'faq'),
        ('Полномочия',       'polnomochiya',      '#7c3aed', 'faq'),
        ('Оплата',           'oplata',            '#059669', 'faq')
    """)

    # Test knowledge items
    op.execute("""
        INSERT INTO knowledge_items
            (section_id, item_type, title, summary, visibility, status, published_at, content_text, created_at, updated_at)
        SELECT
            (SELECT id FROM sections WHERE slug = v.sec),
            v.typ::knowledge_item_type,
            v.title,
            v.summary,
            v.vis::knowledge_visibility,
            'published',
            NOW(),
            v.title || ' ' || v.summary,
            NOW(),
            NOW()
        FROM (VALUES
            ('pravo', 'article',
             'Порядок согласования хозяйственных договоров',
             'Пошаговая инструкция по согласованию договоров с контрагентами: от инициирования до подписания.',
             'public'),
            ('pravo', 'article',
             'Практика по спорам с абонентами 2024–2025',
             'Обзор судебной практики по спорам с физическими и юридическими лицами — абонентами МГТС.',
             'public'),
            ('pravo', 'faq',
             'Нужно ли согласование договора на сумму до 50 000 руб.?',
             'Ответ: зависит от типа договора и контрагента. Подробности в тексте.',
             'public'),
            ('pravo', 'document',
             'Типовой договор оказания услуг связи',
             'Шаблон договора для физических лиц. Версия актуальна с 01.01.2025.',
             'public'),
            ('pravo', 'document',
             'Регламент работы БПО (редакция 3.0)',
             'Внутренний регламент правового департамента. Обязателен для всех сотрудников БПО.',
             'bpo_only'),
            ('pravo', 'link',
             'Федеральный закон № 126-ФЗ «О связи»',
             'Базовый НПА в сфере телекоммуникаций. Редакция от 2024 г.',
             'public'),
            ('obshchee', 'article',
             'Введение в правовую систему МГТС',
             'Общий обзор правовой структуры компании для новых сотрудников.',
             'public'),
            ('kommercheskiy-blok', 'document',
             'NDA: соглашение о конфиденциальности',
             'Типовое NDA для партнёров коммерческого блока. Шаблон на русском и английском языках.',
             'public'),
            ('kommercheskiy-blok', 'faq',
             'Сроки согласования коммерческих договоров',
             'БПО рассматривает коммерческие договоры в течение 5 рабочих дней.',
             'public'),
            ('blok-it', 'article',
             'Правовые аспекты работы с персональными данными',
             'Требования 152-ФЗ применительно к ИТ-системам и обработке данных абонентов.',
             'public'),
            ('finansovyy-blok', 'faq',
             'Порядок согласования договоров займа и кредитных соглашений',
             'Внутренние лимиты и процедура согласования кредитных договоров в финансовом блоке.',
             'public')
        ) AS v(sec, typ, title, summary, vis)
    """)

    # Assign tags to items by matching titles
    op.execute("""
        INSERT INTO knowledge_item_tags (item_id, tag_id)
        SELECT ki.id, t.id
        FROM knowledge_items ki, tags t
        WHERE
            (ki.item_type = 'article'   AND ki.title LIKE '%согласования%'           AND t.slug = 'praktika')    OR
            (ki.item_type = 'article'   AND ki.title LIKE '%практика%'               AND t.slug = 'praktika')    OR
            (ki.item_type = 'article'   AND ki.title LIKE '%практика%'               AND t.slug = 'analitika')   OR
            (ki.item_type = 'article'   AND ki.title LIKE '%персональных данных%'    AND t.slug = 'metodologiya') OR
            (ki.item_type = 'article'   AND ki.title LIKE '%Введение%'               AND t.slug = 'obzor')       OR
            (ki.item_type = 'faq'       AND ki.title LIKE '%согласование%'           AND t.slug = 'procedury')   OR
            (ki.item_type = 'faq'       AND ki.title LIKE '%согласование%'           AND t.slug = 'sroki')       OR
            (ki.item_type = 'faq'       AND ki.title LIKE '%Сроки%'                  AND t.slug = 'sroki')       OR
            (ki.item_type = 'faq'       AND ki.title LIKE '%займа%'                  AND t.slug = 'procedury')   OR
            (ki.item_type = 'document'  AND ki.title LIKE '%Типовой%'                AND t.slug = 'shablon-tag') OR
            (ki.item_type = 'document'  AND ki.title LIKE '%Типовой%'                AND t.slug = 'dogovor-tag') OR
            (ki.item_type = 'document'  AND ki.title LIKE '%Регламент%'              AND t.slug = 'reglament-tag') OR
            (ki.item_type = 'document'  AND ki.title LIKE '%NDA%'                    AND t.slug = 'dogovor-tag') OR
            (ki.item_type = 'document'  AND ki.title LIKE '%NDA%'                    AND t.slug = 'shablon-tag') OR
            (ki.item_type = 'link'      AND ki.title LIKE '%126-ФЗ%'                 AND t.slug = 'zakonodatelstvo')
    """)


def downgrade() -> None:
    op.drop_column('tags', 'entity_type')
