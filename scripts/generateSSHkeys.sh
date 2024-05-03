openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -sha256 -days 3650
rm -rf ./certs
mkdir ./certs
mv ./cert.pem ./certs/cert.pem
mv ./key.pem ./certs/key.pem
