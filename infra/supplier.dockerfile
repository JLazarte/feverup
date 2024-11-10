# Resolve dependencies step
FROM node:latest as events-core

WORKDIR /app

COPY ../apps/events-core/src ./src
COPY ../apps/events-core/package*.json ./
COPY ../config/ ./

RUN npm install
RUN npm run build


FROM node:latest as dependencies

WORKDIR /app

COPY ../apps/events-supplier/package*.json ./
RUN npm install

#Replace simbolic links to the real files or folders
RUN rm -rf ./node_modules/events-core
COPY --from=events-core /app ./node_modules/events-core



# build distribution
FROM node:latest as distribution

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules

COPY ../apps/events-supplier/src ./src
COPY ../apps/events-supplier/package*.json .
COPY ../config/ .

RUN npm run build

RUN npm prune --omit=dev

#Replace events-core link to the real package
RUN rm -rf ./node_modules/events-core
COPY --from=events-core /app ./node_modules/events-core



# Run app
FROM node:lts as App

WORKDIR /app

COPY --from=distribution /app/package*.json ./
COPY --from=distribution /app/node_modules ./node_modules
COPY --from=distribution /app/dist ./dist

# "start-server:gathering": "node ./dist/gathering-entrypoint.js ",
# "start-server:supplier": "node ./dist/supplier-entrypoint.js ",
CMD ["node", "./dist/supplier-entrypoint.js"]