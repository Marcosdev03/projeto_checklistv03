# 1. Escolhe a imagem base
FROM python:3.12-slim

# 2. Define variáveis de ambiente úteis
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# 3. Define o diretório de trabalho
WORKDIR /app 

# 4. Copia e instala as dependências
# Copia o arquivo de requisitos para o diretório de trabalho
COPY requirements.txt /app/

# Instala as bibliotecas Python
RUN pip install --upgrade pip && pip install -r requirements.txt

# 5. Copia o código do projeto
# Copia o restante do código do projeto para o container
COPY . /app/