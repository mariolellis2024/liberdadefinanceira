# Build stage — compile React frontend
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage — run Express server
FROM node:20-alpine
WORKDIR /app

# Copy built frontend
COPY --from=build /app/dist ./dist

# Copy server files and package.json
COPY --from=build /app/server ./server
COPY --from=build /app/package*.json ./
COPY --from=build /app/tsconfig.server.json ./

# Install only production dependencies + tsx for running TS server
RUN npm ci --omit=dev && npm install tsx

EXPOSE 3000

CMD ["npx", "tsx", "server/index.ts"]
