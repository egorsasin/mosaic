FROM node:alpine AS builder
WORKDIR /usr/src/api
RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

RUN npm install -g pm2@latest

# Install the dependencies
RUN npm install --only=production --silent

# Copy the rest of the application code to the working directory
COPY . .

RUN npx nx build api --prod