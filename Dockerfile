FROM node:16-alpine as build_image
WORKDIR /
RUN apk add --no-cache git openssh-client
RUN apk add g++ make python3
COPY package.json yarn.lock ./

# Install packages
RUN yarn

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