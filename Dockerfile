FROM nginx:alpine

# Copy web app files to nginx html directory
COPY index.html /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/
COPY words_with_examples.json /usr/share/nginx/html/

# Copy custom nginx configuration (optional, for better caching)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
