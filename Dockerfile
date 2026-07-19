FROM python:3.12-slim

WORKDIR /app

# 1. Instalação de dependências do sistema
RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev \
    build-essential \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# 2. Instalação das dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 3. Copia o código do projeto para o container
COPY . .

# 4. Executa o collectstatic agora que o código e o manage.py já estão lá
RUN python manage.py collectstatic --noinput

# 5. Comando de inicialização
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "13", "--timeout", "120"]
