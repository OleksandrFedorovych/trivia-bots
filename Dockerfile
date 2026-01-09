# Trivia Bots Docker Image
# Supports running 100+ concurrent browser instances

FROM mcr.microsoft.com/playwright:v1.40.0-jammy

# Set working directory
WORKDIR /app

# Install Node.js dependencies first (for caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY src/ ./src/
COPY .env* ./

# Create data directory for Excel files and results
RUN mkdir -p /app/src/data /app/logs

# Set environment variables
ENV NODE_ENV=production
ENV HEADLESS=true
ENV LOG_LEVEL=info
ENV MAX_CONCURRENT_BOTS=50

# Volume for data persistence (Excel files, logs, results)
VOLUME ["/app/src/data", "/app/logs"]

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "console.log('healthy')" || exit 1

# Default command - run scheduler
CMD ["node", "src/runScheduler.js"]




