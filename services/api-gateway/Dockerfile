# Dockerfile for api-gateway-service
FROM node:20-alpine

ARG PORT
ARG MATCHING_PORT
ARG QUESTION_PORT
ARG USER_PORT
ARG USER_URL
ARG MATCHING_URL
ARG QUESTION_URL

WORKDIR /app

COPY package*.json ./

RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the service port
EXPOSE $PORT

# Start the service
CMD ["npm", "start"]