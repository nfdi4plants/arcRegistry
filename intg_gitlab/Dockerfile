FROM node:latest

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

#WORKDIR /usr/src/app

RUN wget https://github.com/nfdi4plants/arcCommander/releases/download/v0.4.0-linux.x64/arc && chmod u+x arc

COPY . .

EXPOSE 3000

RUN chmod +x wait-for-it.sh

CMD [ "./wait-for-it.sh", "arc_logger:6000", "-t", "0", "-s", "--", "node", "index.js" ]