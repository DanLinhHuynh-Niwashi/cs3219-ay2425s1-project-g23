# Dockerfile for question-service
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the service port
EXPOSE 3001

# Start the question service
CMD ["npm", "start"]