FROM node:22

WORKDIR /app

# Copy backend package files and install dependencies
COPY package*.json ./
RUN npm install
RUN npm rebuild better-sqlite3 --build-from-source

# Copy backend application code
COPY . .

EXPOSE 4000

ENV PORT=4000
ENV ML_SERVICE_URL=http://ml-service:5000

CMD ["npm", "start"]
