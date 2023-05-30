
#!/bin/sh

# builds the docker image and push to the repo

sudo docker build -t arcregistry/arc_gateway .
sudo docker push arcregistry/arc_gateway