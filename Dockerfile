FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run lint && npm test && npm run build

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --chown=node:node backend ./backend
COPY --chown=node:node src ./src
COPY --from=build --chown=node:node /app/dist ./dist
USER node
EXPOSE 8080
CMD ["npm", "run", "start:api"]
