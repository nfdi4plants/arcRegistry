FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

RUN chmod +x wait-for-it.sh

CMD [ "./wait-for-it.sh", "arc_logger:6000", "-t", "0", "-s", "--", "./wait-for-it.sh", "arc_es:9200", "-t", "0", "-s", "--", "node", "index.js" ]