FROM node:20 AS build

LABEL maintainer=""

WORKDIR /app

COPY . .

RUN yarn install && yarn build

FROM node:20-alpine3.17

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/bootstrap.js ./
COPY --from=build /app/package.json ./

RUN npm install pm2 -g

EXPOSE 8001

ENTRYPOINT ["yarn", "online"]
