FROM node:18-alpine as build_image
WORKDIR /app
RUN apk add --no-cache git
RUN apk add g++ make python3
RUN yarn config set network-timeout 600000
COPY package.json yarn.lock ./

# Install packages
RUN yarn install
COPY . .

# Compile types
RUN yarn build

# Second 
FROM node:18-alpine
WORKDIR /app
COPY ./render-server/yarn.lock ./render-server/package.json ./
RUN yarn install

COPY --from=build_image ./app/render-server .
RUN yarn typescript:deploy

EXPOSE 3000

CMD yarn prod:start