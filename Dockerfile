FROM node:16-alpine
RUN apk add jq
RUN apk --no-cache --virtual build-dependencies add python3 py3-pip make g++

USER node

RUN mkdir -p /home/node/app/frontend && mkdir -p /home/node/app/backend && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY --chown=node:node backend/package*.json ./backend/

COPY --chown=node:node frontend/package*.json ./frontend/
COPY --chown=node:node frontend/yarn.lock ./frontend/

WORKDIR /home/node/app/frontend

RUN yarn install

WORKDIR /home/node/app/backend

RUN npm ci

WORKDIR /home/node/app

# Copy local code to the container image.
COPY --chown=node:node . .

WORKDIR /home/node/app/frontend

RUN yarn test

RUN tmp=$(mktemp); jq '.homepage = "/embed"' ./package.json > "$tmp" && mv "$tmp" package.json
RUN yarn build-embed

RUN tmp=$(mktemp); jq '.homepage = "/"' ./package.json > "$tmp" && mv "$tmp" package.json
RUN yarn build

WORKDIR /home/node/app/backend

RUN npm run build

RUN rm -rf ../frontend

EXPOSE 3000

ENV NODE_ENV=production

# Run the web service on container startup.
CMD [ "node", "dist/backend/src/main"]
