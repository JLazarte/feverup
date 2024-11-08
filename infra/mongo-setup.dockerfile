FROM node:latest

WORKDIR /app

COPY ./infra/mongo-setup.js .

RUN npm install mongodb

CMD ["node", "mongo-setup.js"]