# Dockerfile for question-service
FROM node:20-alpine

ARG PORT
ARG QUESTION_PORT

WORKDIR /app

COPY package*.json ./

RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the service port
EXPOSE $PORT

# Start the question service
CMD ["npm", "start"]