FROM node:21-alpine
RUN mkdir -p /home/node/app && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY . /home/node/app
EXPOSE 3000
CMD [ "node", "api.js" ]