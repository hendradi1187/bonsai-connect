FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

RUN mkdir -p uploads

EXPOSE 3000

# Production: jalankan langsung dengan Node, bukan nodemon
CMD ["npm", "start"]
