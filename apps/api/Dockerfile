FROM node:lts AS builder

WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm install --only=development --silent

# Copy the rest of the application code to the working directory
COPY . .

RUN npx nx build api --prod --vervose

COPY ./libs/core/src/lib/api/schema ./dist/apps/api/schema


FROM node:lts

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install -g pm2@latest
RUN npm install --only=production --silent
RUN npm install express

COPY --from=builder /usr/src/app/dist/apps/api ./build
COPY --from=builder /usr/src/app/email-templates ./email-templates


ENTRYPOINT ["pm2-runtime","build/main.js"]