# Dockerfile for question-service
FROM node:20-alpine

ARG PORT
ARG REDIS_HOST
ARG REDIS_PORT

WORKDIR /app

COPY package*.json ./

RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the service port
EXPOSE $PORT

# Start the service
CMD ["npm", "start"]