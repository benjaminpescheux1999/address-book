# Build
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html