## Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --silent

# Copy source and build
COPY . .
RUN npm run build

## Production image
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built assets and package files
COPY --from=builder /app .

EXPOSE 3000

# Start Next.js server
CMD ["npm", "run", "start"]
