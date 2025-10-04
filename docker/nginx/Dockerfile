FROM nginx:alpine

# Remove configuração padrão
RUN rm /etc/nginx/conf.d/default.conf

# Copiar configuração customizada
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf

# Criar diretórios para SSL (caso necessário)
RUN mkdir -p /etc/nginx/ssl

# Expor portas
EXPOSE 80 443

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
