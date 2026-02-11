FROM mcr.microsoft.com/playwright:v1.50.0-jammy

WORKDIR /app

# Faylni aniq nusxalash (shunda xato bo'lsa darrov bilinadi)
COPY package.json ./

# Oddiy install
RUN npm install

COPY . .

CMD ["node", "index.js"]