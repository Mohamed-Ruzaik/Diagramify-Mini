# Production-style container for the Diagramify Mini Vite app.
# The build stage installs locked dependencies and creates static assets.
FROM node:20-alpine AS build

WORKDIR /app

# Copy package metadata first so Docker can cache dependency installs.
COPY package*.json ./

# Use npm ci when package-lock.json is available for repeatable builds.
RUN npm ci

# Copy the application source and build the Vite production bundle.
COPY . .
RUN npm run build

# Runtime stage: serve the generated static files with a lightweight server.
FROM node:20-alpine AS runtime

WORKDIR /app

# serve is enough for a static SPA preview and keeps the image simple.
RUN npm install -g serve

COPY --from=build /app/dist ./dist

EXPOSE 4173

# The -s flag enables SPA fallback routing for protected/dashboard routes.
CMD ["serve", "-s", "dist", "-l", "4173"]
