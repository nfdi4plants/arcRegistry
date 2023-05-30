#!/bin/sh

# -------------------------------------------------------------------------------
# Information
# -------------------------------------------------------------------------------

# This script invokes a seqence of APIs to create the user ids required for setup 
# application use.

# Author: DataPLANT
# Documentation: https://arc-metadata-registry.readthedocs.io/en/latest/
# Version: 1.0
# -----------------------------------------------------------------------------
# Script
# -----------------------------------------------------------------------------

#default keys
ADMIN_KEY_ID="2TrVTlijYsBR3W6Y5aPNgB"
ADMIN_KEY_SECRET="6uR1TIHhGbrCRI602Mbuqg"

echo "Creating admin user profile for ARC Registry..."
GATEWAY=`sudo docker ps -f name=arc_gateway --quiet`

echo "Gateway server id is ${GATEWAY}"
echo "Creating admin user... \n"
sudo docker exec -it ${GATEWAY} /bin/sh -c 'eg scopes create read write admin webhook'
sudo docker exec -it ${GATEWAY} /bin/sh -c 'eg users create -p 'username=admin' -p 'firstname=ARC' -p 'lastname=ADMIN''
sudo docker exec -it ${GATEWAY} /bin/sh -c 'eg credentials create -t key-auth -c admin -p 'keyId=${ADMIN_KEY_ID}' -p 'keySecret=${ADMIN_KEY_SECRET}''
sudo docker exec -it ${GATEWAY} /bin/sh -c 'eg credential:scopes add -t key-auth --id '${ADMIN_KEY_ID}' admin read write webhook'
echo "Successfully created webhook user. Use the keyID: ${ADMIN_KEY_ID} and keySecret: ${ADMIN_KEY_SECRET} to setup Gitlab Webhooks..."