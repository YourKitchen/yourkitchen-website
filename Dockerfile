FROM node:16-alpine as build_image
WORKDIR /
RUN apk add --no-cache git
RUN apk add g++ make python3
COPY package.json lerna.json yarn.lock ./

# Install packages
ENV YARN_CACHE_FOLDER=/tmp/yarn_cache
RUN --mount=type=cache,target=/tmp/yarn_cache yarn install --prefer-offline  --immutable --immutable-cache --check-cache

# Fix types on models and common
COPY . .

# Compile types
RUN yarn build

# Second 
FROM node:16-alpine

COPY --from=build_image ./render-server .
RUN yarn --frozen-lockfile
RUN yarn typescript:deploy

EXPOSE 3000

CMD yarn prod:start