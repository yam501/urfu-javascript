FROM nginx:alpine

RUN apk add --no-cache openssl \
 && mkdir /etc/nginx/ssl \
 && openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/key.pem \
    -out /etc/nginx/ssl/cert.pem \
    -subj "/CN=localhost"

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html      /usr/share/nginx/html/index.html
COPY horizontal.html /usr/share/nginx/html/horizontal.html
COPY vertical.html   /usr/share/nginx/html/vertical.html
COPY dock.css        /usr/share/nginx/html/dock.css
COPY images/         /usr/share/nginx/html/images/

EXPOSE 80 443
