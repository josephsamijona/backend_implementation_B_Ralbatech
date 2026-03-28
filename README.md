# To RUN In Local Development PC

## Build docker image

* docker build -f Dockerfile.dev -t ecomm3d:latest --no-cache .

## Stop and remove old container 

 * a. docker stop ECOMMAPI-DEV
 * b. docker rm ECOMMAPI-DEV
 * c. docker rmi $(docker images -q)

## Run the container from latest image

* docker run -p 0.0.0.0:5000:5000/tcp -d --name ECOMMAPI-DEV munnafredapple/ralbatech:latest
