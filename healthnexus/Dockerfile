FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./backend/
RUN npm --prefix backend ci

COPY frontend/package*.json ./frontend/
RUN npm --prefix frontend ci

COPY . .

RUN npm --prefix frontend run build

ENV NODE_ENV=production
EXPOSE 5000

CMD ["npm", "--prefix", "backend", "start"]
