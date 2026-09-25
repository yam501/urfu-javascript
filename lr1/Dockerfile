FROM nginx:alpine

RUN apk add --no-cache openssl \
 && mkdir /etc/nginx/ssl \
 && openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/key.pem \
    -out /etc/nginx/ssl/cert.pem \
    -subj "/CN=localhost"

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/index.html
COPY grid.html  /usr/share/nginx/html/grid.html
COPY flex.html  /usr/share/nginx/html/flex.html

EXPOSE 80 443
