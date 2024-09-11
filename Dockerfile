# Stage 1: Build stage
FROM alpine:3.19.1 AS build

# Install dependencies
RUN apk add --update nodejs npm

# Set working directory
WORKDIR /application

# Copy package.json and .npmrc
COPY package.json .
COPY .npmrc .

# Install dependencies and generate package-lock.json
RUN npm install

# Copy the entire application
COPY . .

# Build the application
RUN npm run build

# Stage 2: Final stage
FROM alpine:3.19.1

# Install Node.js and npm in the final stage
RUN apk add --update nodejs npm vim tzdata

# Set timezone
ENV TZ=America/Santiago

# Set working directory
WORKDIR /application

# Copy build artifacts and package-lock.json from the build stage
COPY --from=build /application/build /application/build
COPY --from=build /application/package-lock.json /application/build/package-lock.json
COPY --from=build /application/package.json /application/build/package.json

# Set working directory to the build folder
WORKDIR /application/build

# Copy .npmrc
COPY .npmrc .

# Copy .env if needed
# COPY .env .

# Install production dependencies using the copied package-lock.json
RUN npm ci --omit="dev"

# Expose port
EXPOSE 3333

# Command to run the application
CMD ["node", "bin/server.js"]
