git pull 
docker build -t  cited . --no-cache
docker tag cited:latest cited:prod
docker compose stop
docker compose up -d