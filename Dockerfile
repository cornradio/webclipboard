FROM nginx:1.25.3-alpine
COPY index.html /usr/share/nginx/html
COPY docker-entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
# 在 /usr/share/nginx/html 目录下创建并写入 apiport.txt 文件
ARG API_PORT
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]