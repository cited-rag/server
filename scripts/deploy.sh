
docker compose stop
git pull 
docker build -t --no-cache cited .
docker tag cited:latest cited:prod
docker compose up -d