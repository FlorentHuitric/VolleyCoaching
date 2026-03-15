FROM node:20-alpine

# Install PostgreSQL client and OpenSSL for Prisma
RUN apk add --no-cache postgresql-client openssl openssl-dev

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose port
EXPOSE 3001

# Use entrypoint script
ENTRYPOINT ["docker-entrypoint.sh"]