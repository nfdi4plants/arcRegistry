#!/bin/sh

# builds the docker image and push to the repo

sudo docker build -t arcregistry/arc_intg_gitlab .
sudo docker push arcregistry/arc_intg_gitlab
