FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Expose port
EXPOSE 3030

# Set environment
ENV NODE_ENV=production
ENV PORT=3030

# Start the application
CMD ["bun", "start"]
