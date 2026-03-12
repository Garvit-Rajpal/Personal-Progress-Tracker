FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# We don't RUN npm run build because this is for local dev
EXPOSE 3000

CMD ["npm", "run", "dev"]
