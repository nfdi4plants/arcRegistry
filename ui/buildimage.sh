#!/bin/sh

# builds the docker image and push to the repo

sudo docker build -t arcregistry/arc_ui .
sudo docker push arcregistry/arc_ui
