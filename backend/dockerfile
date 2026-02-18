# 1. Escolhe a imagem base
FROM python:3.12-slim

# 2. Define variáveis de ambiente úteis
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# 3. Define o diretório de trabalho
WORKDIR /app

# 4. Instala pacotes de sistema necessários para compilação (se houver) e banco de dados
# O 'apt-get update' é necessário para garantir que os pacotes mais recentes sejam instalados.
# O 'apt-get clean' remove arquivos temporários para manter a camada pequena.
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    # Dependência comum para psycopg2 e conexões com PostgreSQL
    libpq-dev \
    # Outras ferramentas de build que podem ser necessárias
    build-essential \
    # Limpa o cache do apt para reduzir o tamanho da imagem
    && rm -rf /var/lib/apt/lists/*

# 5. Copia e instala as dependências
# Copia o arquivo de requisitos para o diretório de trabalho
COPY requirements.txt /app/

# Instala as bibliotecas Python sem cache de instalação
# O '--no-cache-dir' garante que os arquivos temporários não inflem o contêiner.
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 6. Copia o código do projeto
# Copia o restante do código do projeto para o container
COPY . /app/

# 7. Comando de inicialização (Exemplo para Django)
# COMMAND [ "python", "manage.py", "runserver", "0.0.0.0:8000" ]