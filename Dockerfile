FROM node:16-alpine
USER node
WORKDIR /home/node/app
COPY --chown=node:node . .
COPY k8s/overlays/dev/secrets ./secrets/

ENV NODE_ENV "production"
RUN yarn config set enableNetwork false && \
  yarn install --immutable --immutable-cache && \
  rm -rf .yarn yarn.lock

ENV NODE_OPTIONS "--require /home/node/app/.pnp.cjs"
CMD ["/home/node/app/bin/node.sh", "agent"]
