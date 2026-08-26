FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies from the lockfile for reproducible builds
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Expose port 5000
EXPOSE 5000

# Start development server
CMD ["npx", "nodemon", "src/index.ts"]
