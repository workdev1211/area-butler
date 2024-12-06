FROM node:16-alpine as frontend-builder

ENV APP_DIR=/home/node/app

RUN apk add jq
RUN apk --no-cache --virtual build-dependencies add python3 py3-pip make g++

USER node

RUN mkdir -p $APP_DIR/frontend && \
    mkdir -p $APP_DIR/shared && \
    chown -R node:node $APP_DIR

WORKDIR $APP_DIR

# Copy local code to the container image.
COPY --chown=node:node frontend ./frontend
COPY --chown=node:node shared ./shared

WORKDIR $APP_DIR/frontend

RUN yarn install && \
    CI=true yarn test

RUN tmp=$(mktemp); jq '.homepage = "/embed"' ./package.json > "$tmp" && mv "$tmp" package.json
RUN yarn build-embed

RUN tmp=$(mktemp); jq '.homepage = "/on-office"' ./package.json > "$tmp" && mv "$tmp" package.json
RUN yarn build-on-office

RUN tmp=$(mktemp); jq '.homepage = "/propstack"' ./package.json > "$tmp" && mv "$tmp" package.json
RUN yarn build-propstack

RUN tmp=$(mktemp); jq '.homepage = "/my-vivenda"' ./package.json > "$tmp" && mv "$tmp" package.json
RUN yarn build-my-vivenda

RUN tmp=$(mktemp); jq '.homepage = "/"' ./package.json > "$tmp" && mv "$tmp" package.json
RUN yarn build

WORKDIR $APP_DIR

RUN mkdir -p dist/static && \
    mv ./frontend/build-main dist/static/main && \
    mv ./frontend/build-embed dist/static/embed && \
    mv ./frontend/build-on-office dist/static/on-office && \
    mv ./frontend/build-propstack dist/static/propstack && \
    mv ./frontend/build-my-vivenda dist/static/my-vivenda && \
    rm -rf ./frontend && \
    rm -rf ./shared



FROM node:20-alpine

ENV APP_DIR=/home/node/app

RUN apk add jq
RUN apk --no-cache --virtual build-dependencies add python3 py3-pip make g++

USER node

RUN mkdir -p $APP_DIR/backend && \
    mkdir -p $APP_DIR/shared && \
    chown -R node:node $APP_DIR

WORKDIR $APP_DIR

COPY --chown=node:node backend ./backend
COPY --chown=node:node shared ./shared

WORKDIR $APP_DIR/backend

RUN npm ci && \
    npm run build

COPY --from=frontend-builder --chown=node:node $APP_DIR .

EXPOSE 3000

ENV NODE_ENV=production

# Run the web service on container startup.
CMD ["node", "dist/backend/src/main"]