FROM node:17.1.0-alpine3.12

ENV CI=true
ENV WDS_SOCKET_PORT=0

WORKDIR /app
COPY ./ ./
RUN yarn

CMD ["yarn", "start"]