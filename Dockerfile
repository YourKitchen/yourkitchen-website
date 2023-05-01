FROM node:16-alpine as build_image
WORKDIR /app
RUN apk add --no-cache git
RUN yarn cache clean
COPY package.json yarn.lock ./

# Install packages
COPY yarn.lock yarn.lock
RUN yarn install --frozen-lockfile --network-timeout 1000000 --network-concurrency 1
COPY . .

# Compile types
RUN yarn build

# Second 
FROM node:16-alpine
WORKDIR /app
COPY ./render-server/package.json ./render-server/yarn.lock ./
RUN yarn --frozen-lockfile --network-timeout 1000000 --network-concurrency 1

# To copy /build folder
COPY --from=build_image ./app/render-server .
# Compile typescript file
RUN yarn typescript:build

EXPOSE 3000

CMD yarn prod:start