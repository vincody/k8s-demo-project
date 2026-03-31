# Sử dụng image Node.js phiên bản nhẹ (alpine) để tiết kiệm tài nguyên
FROM node:18-alpine

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Copy file package.json vào trước để cài đặt thư viện
COPY package*.json ./
RUN npm install

# Copy toàn bộ code vào container
COPY . .

# Mở cổng 3000
EXPOSE 3000

# Lệnh khởi chạy ứng dụng
CMD ["npm", "start"]