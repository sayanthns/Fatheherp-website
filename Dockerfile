FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Build the frontend and backend
RUN npm run build

# Expose the designated port
EXPOSE 5050

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5050

# Start server
CMD ["node", "dist/index.js"]
