# Deploying pattern extractor component

1. Save `.env.example` file as `pattern.env` and configure the variables appropriately
2. Build docker images
   ```bash
   docker-compose build
   ```
3. Create docker containers
   ```bash
   docker-compose up --no-start
   ```
4. Start Mongo DB
   ```bash
   docker-compose start mongo
   ```
5. Login into mongo container and configure authentication
  (execute command from `mongodb/scripts/mongo.js` in the mongo shell)
  ```bash
  docker exec -it pattern-mongo mongo
  ```
6. Start Pattern Extractor service
    ```bash
    docker-compose start patternExtractor
    ```
