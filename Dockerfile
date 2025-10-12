# Use official Playwright image with Ubuntu (same as GitHub Actions)
FROM mcr.microsoft.com/playwright:v1.51.1-jammy

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application and test files
COPY . .

# Set environment variables
ENV CI=true
ENV FORCE_COLOR=1

# Default command: update visual snapshots
CMD ["npx", "playwright", "test", "--update-snapshots", "--project=chromium"]


