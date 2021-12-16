FROM node:16-alpine as build_image
WORKDIR /app
RUN apk add --no-cache git
RUN apk add g++ make python3
COPY package.json .
RUN yarn set version berry

COPY .yarn/ .yarn/

# Install packages
COPY yarn.lock .yarn .yarnrc.yml ./
RUN yarn install
COPY . .

# Compile types
RUN yarn build

# Second 
FROM node:16-alpine
WORKDIR /app
COPY ./render-server/package.json ./
RUN yarn set version berry
COPY ./render-server/yarn.lock ./render-server/.yarn ./render-server/.yarnrc.yml ./
RUN yarn

COPY --from=build_image ./app/render-server .
RUN yarn typescript:deploy

EXPOSE 3000

CMD yarn prod:start