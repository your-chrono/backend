FROM node:22.11.0-alpine as builder

WORKDIR /home/app

COPY package.json ./
COPY package-lock.json ./

RUN npm ci --ignore-scripts
RUN npm rebuild bcrypt

COPY . .

RUN npm run prisma:generate
RUN npm run build

FROM  node:22.11.0-alpine

RUN apk add --no-cache curl

WORKDIR /home/app

COPY --from=builder /home/app/package*.json ./
COPY --from=builder /home/app/prisma/ ./prisma/
COPY --from=builder /home/app/dist/ ./dist/
COPY --from=builder /home/app/node_modules/ ./node_modules/
COPY --from=builder /home/app/node_modules/.prisma/ ./node_modules/.prisma/
COPY --from=builder /home/app/node_modules/@prisma/ ./node_modules/@prisma/

CMD ["npm", "run", "start:prod"]
