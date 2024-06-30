FROM node:14-alpine
# Install necessary packages
RUN apk update && apk add --no-cache --virtual .build-deps \
    g++ make py3-pip alpine-sdk python3 \
    libjpeg-turbo-dev libpng-dev \
    # Additional dependencies for canvas
    cairo-dev jpeg-dev pango-dev giflib-dev

# Ensure python3 is used
RUN ln -sf python3 /usr/bin/python

# Install node-gyp globally to help with native builds
RUN npm install -g node-gyp

RUN npm install -g typescript
EXPOSE 3000

# Setup the app directory
RUN mkdir /app
WORKDIR /app
COPY . /app
COPY package*.json /app

# Install dependencies with verbose logging
RUN npm cache verify && npm install --verbose
# RUN npm install @types/react-router-dom@latest
# Verify that react-scripts and other dependencies are installed
RUN ls -la node_modules/.bin && ls -la node_modules/react-scripts

# Attempt to rebuild node-sass with more verbose output for troubleshooting
#RUN npm rebuild node-sass --verbose || echo "Failed to rebuild node-sass, consider using Dart Sass as an alternative."

CMD ["npm", "start"]