# Use an official Node.js runtime as the base image
FROM node:current-alpine3.22

# Set the working directory in the container
WORKDIR /usr/app

# Copy package.json and package-lock.json to the container
COPY package.json .

# Install app dependencies
RUN npm install
RUN apk add --update libpq-dev g++ make python3 py3-pip && ln -sf python3 /usr/bin/python
RUN pip3 install --no-cache --upgrade --break-system-packages pip setuptools
RUN npm i pg-native

COPY . .

EXPOSE 3000

# Define the command to start your application
CMD npm run start:prod