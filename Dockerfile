# Stage 0
FROM node:lts-alpine as stage0
WORKDIR /stage0

COPY .env .
COPY package.json .
COPY tsconfig.json .
COPY webpack.config.ts .
COPY src src

RUN npm install
RUN npm i -g webpack-cli
RUN webpack-cli --config webpack.config.ts

COPY entrypoint.sh entrypoint.sh

RUN npm i -g pm2

USER node

ENTRYPOINT ["./entrypoint.sh"]
