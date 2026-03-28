# Build stage
FROM node:18-alpine as build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# The VITE_API_URL should be provided as a build arg or mapped later.
RUN npm run build

# Production stage (Nginx)
FROM nginx:alpine
# Copy built static files
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Custom Nginx config to serve the React app and listen on Cloud Run's default port 8080
COPY nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
