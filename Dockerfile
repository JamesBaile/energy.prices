FROM node:7

RUN npm install -g nodemon

# Define working directory.
WORKDIR /src

# Bundle code
COPY . /src

RUN npm install

EXPOSE 3002
CMD npm start
