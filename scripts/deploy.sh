
docker compose stop
git pull 
docker build -t  cited . --no-cache
docker tag cited:latest cited:prod
docker compose up -d