# 🚀 ARQUITETURA DOCKER - CHECKLISTS.TECH

## 📋 Descrição

Arquitetura Docker de produção com:
- **Backend**: Django + Gunicorn (porta 8000 interna)
- **Frontend**: React/Vite + Nginx (porta 80 interna)
- **Nginx**: Reverse proxy + SSL/TLS (portas 80/443 públicas)
- **SSL**: Let's Encrypt + Auto-renovação

## 📁 Estrutura do Projeto

```
projeto_checklistv03/
├── backend/                    # Django + Gunicorn
│   ├── checklist_project/
│   ├── authentication/
│   ├── tasks/
│   ├── gunicorn.conf.py       # Config Gunicorn (produção)
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                   # React + Vite
│   ├── src/
│   ├── Dockerfile
│   └── nginx.conf             # Config Nginx do Frontend
├── nginx/                      # NOVO: Reverse proxy + SSL
│   ├── nginx.conf             # Configuração principal
│   ├── conf.d/                # Configurações adicionais
│   ├── certs/                 # Certificados SSL (gitignored)
│   └── cache/                 # Cache do Nginx
├── compose.yml                # Docker Compose (ATUALIZADO)
├── setup-ssl.sh               # Script de setup SSL
├── .env                       # Variáveis de ambiente
└── README.md                  # Documentação
```

## 🔧 Setup Inicial

### 1. Verificar Status Nginx do Sistema

```bash
# O nginx do sistema deve estar parado
sudo systemctl status nginx

# Se estiver rodando, parar
sudo systemctl stop nginx
sudo systemctl disable nginx
```

### 2. Build e Inicio dos Containers

```bash
# Build das imagens
docker-compose build

# Iniciar containers
docker-compose up -d

# Verificar status
docker-compose ps
```

**Output esperado:**
```
NAME      COMMAND                          STATE
backend   /app/entrypoint.sh gunicorn      Up
frontend  /docker-entrypoint.sh nginx      Up
nginx     /docker-entrypoint.sh nginx      Up
```

### 3. Testar Acesso HTTP (antes do SSL)

```bash
# Verificar se responde
curl -H "Host: checklists.tech" http://localhost/

# Backend
curl -H "Host: checklists.tech" http://localhost/api/authentication/

# Health check
curl http://localhost/health
```

## 🔒 Configurar SSL/HTTPS com Let's Encrypt

### Pré-requisitos
- Domínio apontado para o servidor (DNS A record)
- Email válido para Let's Encrypt

### Processo Automático (Recomendado)

```bash
# 1. Editar script com seu email
nano setup-ssl.sh
# Alterar: EMAIL="seu_email@gmail.com"

# 2. Executar setup
chmod +x setup-ssl.sh
./setup-ssl.sh setup

# Output esperado:
# ✓ Diretório de certbot criado
# ✓ Certificado SSL gerado!
# → Copiando certificados...
# ✓ Certificados configurados
# ✓ SSL configurado com sucesso!
```

### Testar HTTPS

```bash
# Após setup-ssl.sh
curl -k https://checklists.tech/

# Verificar certificado
openssl s_client -connect checklists.tech:443
```

## 🔄 Fluxo de Requisições

```
[Cliente HTTPS] (443)
        ↓
[Nginx Reverse Proxy]
        ├→ /api/* -----→ Backend:8000 (Gunicorn)
        ├→ /admin/* ---→ Backend:8000
        ├→ /static/* --→ Backend:8000
        ├→ /media/* ---→ Backend:8000
        └→ /* --------→ Frontend:80 (React)
```

## 📊 Variáveis de Ambiente (.env)

Exemplo básico:

```env
# Django
SECRET_KEY=seu-secret-key-aqui
DEBUG=False
ALLOWED_HOSTS=checklists.tech,www.checklists.tech

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=seu_email@gmail.com
EMAIL_HOST_PASSWORD=sua_senha_app
EMAIL_USE_TLS=True

# Banco de dados
DB_NAME=db.sqlite3
```

## 🔄 Renovação Automática de SSL

### Opção 1: Cron Job (Recomendado)

```bash
# Adicionar ao crontab
sudo crontab -e

# Renovar certificados diariamente
0 2 * * * cd /root/projeto_checklistv03 && ./setup-ssl.sh renew >> /var/log/ssl-renewal.log 2>&1
```

### Opção 2: Manual

```bash
./setup-ssl.sh renew
```

## 📊 Logs

### Ver logs de todos os services

```bash
# Todos os serviços
docker-compose logs -f

# Apenas backend
docker-compose logs -f backend

# Apenas frontend
docker-compose logs -f frontend

# Apenas nginx
docker-compose logs -f nginx
```

### Acessar logs permanentes

```bash
# Nginx
docker-compose exec nginx tail -f /var/log/nginx/access.log
docker-compose exec nginx tail -f /var/log/nginx/error.log

# Backend
docker-compose logs --tail 100 backend
```

## 🔐 Segurança

✅ Implementado:
- [x] HTTPS/TLS obrigatório
- [x] HTTP → HTTPS redirect
- [x] Security headers (HSTS, X-Frame-Options, etc)
- [x] Rate limiting de API
- [x] Proxy headers configurados
- [x] Gzip compression
- [x] Cache inteligente

⚠️ Production Checklist:
- [ ] Alterar `DEBUG=False` no .env
- [ ] Gerar novo `SECRET_KEY` seguro
- [ ] Configurar `ALLOWED_HOSTS` corretamente
- [ ] Revisar contrasenha do email
- [ ] Testar recuperação de senha
- [ ] Testar registro de usuários
- [ ] Monitorar logs regularmente

## 🚨 Troubleshooting

### "Address already in use" porta 80/443

```bash
# Verificar qual processo está usando
sudo lsof -i :80
sudo lsof -i :443

# Parar nginx do sistema
sudo systemctl stop nginx
sudo systemctl disable nginx
```

### Nginx não consegue conectar ao backend

```bash
# Verificar conexão entre containers
docker-compose exec nginx ping backend

# Verificar rede
docker network ls
docker network inspect projeto_checklistv03_checklists-network
```

### Certificado SSL não funciona

```bash
# Verificar certificado
docker-compose exec nginx openssl x509 -in /etc/letsencrypt/live/checklists.tech/fullchain.pem -text

# Renovar manualmente
./setup-ssl.sh renew

# Restar nginx
docker-compose restart nginx
```

### Backend retornando 502 Bad Gateway

```bash
# Verificar se backend está rodando
docker-compose ps backend

# Ver logs do backend
docker-compose logs backend | tail -50

# Restart
docker-compose restart backend
```

## 📈 Performance & Monitoring

### Recursos utilizados

```bash
# Ver uso de CPU/Memória
docker stats

# Logs de acesso (últimos 50)
docker-compose exec nginx tail -50 /var/log/nginx/access.log
```

### Otimizações Ativas

- [x] Gunicorn multi-worker (CPU × 2 + 1)
- [x] Nginx gzip compression
- [x] Cache de static files (1 ano)
- [x] Keep-alive conexões
- [x] Rate limiting API
- [x] Connection pooling

## 🆘 Suporte & Manutenção

### Backup do banco de dados

```bash
# SQLite
cp backend/db.sqlite3 backup/db.sqlite3.$(date +%Y%m%d)

# Automated (cron)
0 2 * * * cp /root/projeto_checklistv03/backend/db.sqlite3 /backup/db.sqlite3.$(date +\%Y\%m\%d)
```

### Atualizar aplicação

```bash
# 1. Pull mudanças
git pull origin main

# 2. Rebuild e restart
docker-compose down
docker-compose build
docker-compose up -d

# 3. Migrations (se houver)
docker-compose exec backend python manage.py migrate
```

### Mudar para PostgreSQL (Futuro)

```env
# Alterar .env
DB_ENGINE=postgresql
DB_NAME=checklists_prod
DB_USER=postgres
DB_PASSWORD=senha_forte
DB_HOST=db
DB_PORT=5432
```

## 📚 Documentação Adicional

- [Django Deployment Checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/pt_BR/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)

## 📞 Próximos Passos

1. **Implementar CI/CD** - GitHub Actions para deploy automático
2. **Monitoramento** - Sentry para error tracking
3. **Database** - PostgreSQL em produção
4. **CDN** - CloudFlare para cache global
5. **Backups** - S3 ou similiar para backups automáticos

---

**Última atualização**: Fevereiro 2026  
**Status**: ✅ Pronto para produção
