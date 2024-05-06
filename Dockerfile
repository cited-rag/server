# syntax = docker/dockerfile:1

FROM node:20-alpine

# Node.js app lives here
WORKDIR /app

# Install node modules

COPY . .

RUN apk add --update py-pip

RUN npm install -g typescript

RUN npm ci && \
    npm run build && \
    npm i -g pm2 && \
    npm cache clean --force \
    pip install chromadb

EXPOSE 8080 8080

# Remove development dependencies
RUN npm prune --omit=dev

# Start the server by default, this can be overwritten at runtime
CMD ["pm2-runtime", "ecosystem.config.js"]
