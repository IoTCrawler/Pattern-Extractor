# Build container
FROM node:lts-alpine as builder

WORKDIR /usr/src/app

## Install dependencies
COPY package*.json ./
RUN apk add --no-cache --virtual .deps g++ make python && npm ci --quiet && apk del .deps

## Copy source
COPY ./src src
COPY tsconfig.json .

## Build
RUN npm run build
# ----------------


# Runtime container
FROM node:lts-alpine

ENV NODE_ENV=production

WORKDIR /app

## Install runtime dependencies
COPY package*.json ./
RUN apk add --no-cache --virtual .deps g++ make python && npm ci --quiet --production && apk del .deps

## Copy build output from previous stage
COPY --from=builder /usr/src/app/dist dist

## Create user that will run the app
RUN addgroup -S iotcrawler
RUN adduser -S -D -g '' -H patternExtractor iotcrawler
RUN chown -R patternExtractor:iotcrawler .

## Make sure we are not running as root
USER patternExtractor:iotcrawler

## Start the App
CMD ["node", "dist/index.js"]
# ----------------
