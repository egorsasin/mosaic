FROM node:lts-alpine AS builder

WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm ci --only=development --silent

# Copy the rest of the application code to the working directory
COPY . .

RUN npx nx build api --prod --vervose

FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install -g pm2@latest
RUN npm ci --only=production --silent

COPY --from=builder /usr/src/app/dist/apps/api ./build

ENTRYPOINT ["pm2-runtime","build/main.js"]