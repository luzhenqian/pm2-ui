FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
RUN npm ci --only=production
RUN cd server && npm ci --only=production
RUN cd client && npm ci

# Copy source code
COPY . .

# Build the application
RUN cd server && npm run build
RUN cd client && npm run build

# Expose port
EXPOSE 3030

# Start the server
CMD ["npm", "start"]