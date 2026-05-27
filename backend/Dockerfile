FROM python:3.12.7-slim

WORKDIR /app

# Устанавливаем uv — быстрый менеджер пакетов Python
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Копируем зависимости и устанавливаем
COPY pyproject.toml .
RUN uv pip install --system -e ".[dev]"

# Копируем код
COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
