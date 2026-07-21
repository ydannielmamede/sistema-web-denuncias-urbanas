FROM python:3.12-slim

WORKDIR /app

# Variáveis de ambiente python
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 1. Instalação de dependências do sistema (removidas as versões engessadas)
RUN apt-get update && apt-get install -y --no-install-recommends \
    default-libmysqlclient-dev \
    build-essential \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# 2. Instalação das dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 3. Copia o código do projeto para o container
COPY . .

# 4. Apenas o collectstatic (se ele não depender do banco no load). 
# Se o seu settings.py tentar ler o banco no collectstatic, comente esta linha também.
RUN python manage.py collectstatic --noinput

EXPOSE 8000

# 5. Comando de inicialização: roda as migrações e depois sobe o Gunicorn
CMD ["sh", "-c", "python manage.py migrate && gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 13 --timeout 120"]
