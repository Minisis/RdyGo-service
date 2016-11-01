FROM node:boron

# Create app directory
RUN mkdir -p /usr/src/rdygo-service
WORKDIR /usr/src/rdygo-service

# Install app dependencies
COPY package.json /usr/src/rdygo-service/
RUN npm install

# Bundle app source
COPY . /usr/src/rdygo-service

EXPOSE 8080
CMD [ "npm", "start" ]
