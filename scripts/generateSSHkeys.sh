openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -sha256 -days 3650
rm -rf ./cert
mkdir ./cert
mv ./cert.pem ./cert/cert.pem
mv ./key.pem ./cert/key.pem
