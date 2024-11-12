# Dockerfile for api-gateway-service
FROM node:20-alpine

ARG PORT
ARG COLLAB_PORT
ARG QUESTION_PORT
ARG HISTORY_PORT
ARG USER_PORT

ARG HISTORY_URL
ARG USER_URL
ARG COLLAB_URL
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