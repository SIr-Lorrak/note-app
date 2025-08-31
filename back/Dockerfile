# Use an official Node.js runtime as the base image
FROM node:current-alpine3.22

# Set the working directory in the container
WORKDIR /usr/app

# Copy package.json and package-lock.json to the container
COPY package.json .

# Install app dependencies
RUN apk add --no-cache --update libpq-dev g++ make python3
RUN npm install pg-native

COPY . .

EXPOSE 3000

# Define the command to start your application
CMD ["npm", "run", "start:prod"]