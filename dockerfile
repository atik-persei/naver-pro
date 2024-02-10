FROM node:20.11.0
WORKDIR /app
COPY . .
RUN npm i
CMD ["sleep", "infinity"]