# syntax = docker/dockerfile:1

FROM debian:stable-slim

# Node.js app lives here
WORKDIR /app

# Install node modules

COPY . .


ENV PYTHONUNBUFFERED=1
RUN apt update && \
    apt install -y python3-dev && \
    ln -sf python3 /usr/bin/python && \ 
    python3 --version
RUN apt install python3-pip -y && \  
    SYSTEM_VERSION_COMPAT=0 pip install --no-cache-dir --break-system-packages "onnxruntime>=1.14.1"
RUN pip install --break-system-packages chromadb===0.5.0 
    
RUN apt install -y nodejs npm 
RUN npm install -g typescript && \
    npm install @types/node && \
    npm ci && \
    npm run build && \
    npm i -g pm2 && \
    npm cache clean --force 
    

EXPOSE 8080 8080

# Remove development dependencies
RUN npm prune --omit=dev

# Start the server by default, this can be overwritten at runtime
CMD ["pm2-runtime", "ecosystem.config.js"]
