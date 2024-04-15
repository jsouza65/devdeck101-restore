FROM node:20.11-slim
RUN npm install -g npm@10.5.2

USER node

WORKDIR /home/node/app

CMD ["tail", "-f", "/dev/null"]
