FROM python:3.12.7-slim

WORKDIR /app

# uv через pip — не зависит от ghcr.io (заблокирован в корп сети)
RUN pip install --no-cache-dir uv==0.5.29

# Копируем зависимости и устанавливаем
COPY pyproject.toml .
RUN uv pip install --system -e ".[dev]"

# Копируем код
COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
