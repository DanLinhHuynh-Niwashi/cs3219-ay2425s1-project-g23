# Dockerfile for frontend
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the service port
EXPOSE 3000

# Start the frontend
CMD ["npm", "start"]