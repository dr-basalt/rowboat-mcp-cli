# Use official Node.js LTS image
FROM node:20-slim

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Make scripts executable
RUN chmod +x server.js init-rowboat.js

# Expose port (Coolify will map this)
EXPOSE 3000

# Health check - Test the SSE endpoint
# SSE will return HTTP 200 with text/event-stream content-type
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/sse || exit 1

# Start the server
CMD ["node", "server.js"]
