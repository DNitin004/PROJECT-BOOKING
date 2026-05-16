# Use Node.js LTS
FROM node:16-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Production environment
ENV NODE_ENV=production

# Start application
CMD ["npm", "start"]
