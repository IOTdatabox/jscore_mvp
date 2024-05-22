FROM node

WORKDIR /app

COPY package.json /app

RUN npm install

COPY . /app

RUN set -a && . /app/.aptible.env && npm run build

EXPOSE 3000

CMD ["npm", "start"]