git pull 
docker build -t cited .
docker tag cited:latest cited:prod
docker-compose up -d