FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm install --production

COPY . .
RUN mkdir -p uploads logs

EXPOSE 8000

CMD ["node", "server.js"]
