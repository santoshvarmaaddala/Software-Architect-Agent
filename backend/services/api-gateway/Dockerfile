FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production

COPY . .

CMD ["node", "src/index.js"]