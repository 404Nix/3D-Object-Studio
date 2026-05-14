FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

RUN npm install -g serve

COPY . .

# Provide the backend URL so Vite can embed it into the built HTML/JS
ENV VITE_API_URL=http://localhost:5000/api

RUN npm run build

EXPOSE 3000

CMD ["serve", "-s", "dist"]
