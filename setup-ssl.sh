#!/bin/bash

# Script para setup do Let's Encrypt com Docker Compose
# Uso: ./setup-ssl.sh

set -e

DOMAIN="checklists.tech"
EMAIL="seu_email@gmail.com"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

log_error() {
    echo -e "${RED}✗ $1${NC}"
}

log_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Função principal
setup_ssl() {
    log_info "Iniciando setup de SSL com Let's Encrypt..."

    # Verificar se docker-compose está rodando
    if ! docker-compose ps | grep -q "nginx"; then
        log_error "Nginx não está rodando. Execute 'docker-compose up -d' primeiro"
        exit 1
    fi

    # 1. Criar diretório para certbot
    mkdir -p "$PROJECT_DIR/certbot/conf"
    mkdir -p "$PROJECT_DIR/certbot/www"

    log_success "Diretório de certbot criado"

    # 2. Gerar certificado
    log_info "Gerando certificado SSL para $DOMAIN..."

    docker run --rm \
        -v "$PROJECT_DIR/certbot/conf:/etc/letsencrypt" \
        -v "$PROJECT_DIR/certbot/www:/var/www/certbot" \
        certbot/certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email "$EMAIL" \
        --agree-tos \
        --no-eff-email \
        --non-interactive \
        -d "$DOMAIN" \
        -d "www.$DOMAIN" 2>&1 || {
            log_error "Falha ao gerar certificado"
            exit 1
        }

    log_success "Certificado SSL gerado!"

    # 3. Copiar certificados para o local correto
    log_info "Copiando certificados..."
    
    mkdir -p "$PROJECT_DIR/nginx/certs"
    
    if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
        sudo cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "$PROJECT_DIR/nginx/certs/" 2>/dev/null || {
            log_info "Usando symlink para certificados (requer acesso root em produção)"
        }
        sudo cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" "$PROJECT_DIR/nginx/certs/" 2>/dev/null || true
    fi
    
    log_success "Certificados configurados"

    # 4. Restartar nginx
    log_info "Reiniciando nginx..."
    docker-compose restart nginx

    log_success "SSL configurado com sucesso!"
    log_info "Seu site está disponível em https://$DOMAIN"
}

# Função para renovar certificado
renew_ssl() {
    log_info "Renovando certificados SSL..."
    
    docker run --rm \
        -v "/etc/letsencrypt:/etc/letsencrypt" \
        -v "$PROJECT_DIR/certbot/www:/var/www/certbot" \
        certbot/certbot renew \
        --webroot \
        --webroot-path=/var/www/certbot \
        --non-interactive
    
    log_success "Certificados renovados"
    
    docker-compose restart nginx
    log_success "Nginx reiniciado"
}

# Menu
case "${1:-setup}" in
    setup)
        setup_ssl
        ;;
    renew)
        renew_ssl
        ;;
    *)
        echo "Uso: $0 [setup|renew]"
        echo ""
        echo "setup  - Configurar novo certificado SSL"
        echo "renew  - Renovar certificados existentes"
        exit 1
        ;;
esac
