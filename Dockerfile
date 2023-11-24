FROM node:21-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./

RUN npm ci

FROM node:21-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules

COPY . .

RUN npm run tsc && npm prune --production

CMD [ "npm", "start" ]
