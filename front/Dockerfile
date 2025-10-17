FROM nginx:alpine

ARG COMMIT_HASH=1

# Copy your custom Nginx configuration file to the container
COPY nginx.conf /etc/nginx/nginx.conf
COPY . /var/www/.

RUN sed -i "s/__COMMIT_HASH__/$COMMIT_HASH/g" /var/www/index.html