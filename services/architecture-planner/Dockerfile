# Use a lightweight Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy dependency definitions first (for better cache)
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy the rest of your source files
COPY . .

# Set environment variables at runtime as needed

# Start the service
CMD ["node", "src/index.js"]
