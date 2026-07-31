FROM node:20-alpine AS base
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3010
ENV NITRO_PORT=3010
CMD ["node", ".output/server/index.mjs"]
