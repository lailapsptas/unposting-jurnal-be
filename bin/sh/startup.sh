#!/bin/sh

# Log the current environment
echo "Starting in $NODE_ENV environment"

# Ensure the directory exists
mkdir -p /app/bin/sh

# Ensure database connection is available
echo "Checking database connection..."
npx knex migrate:status

# Run migrations
echo "Running migrations..."
npx knex migrate:latest

# # Run seeds based on environment
# if [ "$NODE_ENV" = "development" ]; then
#   echo "Running seeds in development mode..."
#   npx knex seed:run
# fi

# Start the application based on environment
if [ "$NODE_ENV" = "development" ]; then
  echo "Starting application in development mode..."
  exec npx nodemon index.js
else
  echo "Starting application in production mode..."
  exec node index.js
fi