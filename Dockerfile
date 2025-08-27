FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile

COPY . .

RUN yarn build

ENV NODE_ENV=production

# Use a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000

CMD ["node", "--enable-source-maps", "--no-deprecation", "dist/main.js"]