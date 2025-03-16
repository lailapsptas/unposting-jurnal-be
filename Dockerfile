# Gunakan base image yang ringan
FROM node:22.11.0-alpine AS base

# Set working directory
WORKDIR /app

# Copy package.json dan package-lock.json untuk caching layer
COPY package*.json ./

# Install global dependencies yang diperlukan
RUN npm install -g knex nodemon

# Install dependencies proyek
RUN npm install

# Copy seluruh file proyek (agar tidak memicu reinstall dependencies)
COPY . .

# Beri izin eksekusi pada startup script (fix the path if needed)
RUN ls -la && \
    ls -la ./bin && \
    ls -la ./bin/sh && \
    chmod +x ./bin/sh/startup.sh

# Expose port aplikasi
EXPOSE 3001

# Gunakan environment variable untuk menentukan mode
ENV NODE_ENV=development

# Development Stage
FROM base AS development
ENV NODE_ENV=development
CMD [ "sh", "./bin/sh/startup.sh" ]

# Production Stage
FROM base AS production
ENV NODE_ENV=production
CMD [ "sh", "./bin/sh/startup.sh" ]