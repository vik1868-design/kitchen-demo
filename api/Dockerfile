FROM node:20-alpine

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev

COPY . .
RUN chmod +x entrypoint.sh

EXPOSE 3001
CMD ["sh", "entrypoint.sh"]
