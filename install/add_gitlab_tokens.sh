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

HOST="example.nfdi4plants.org"
TOKEN="Access Token"

#remove the secret if exists
echo "Removing any existing secrets by name ${HOST}"
sudo docker secret rm ${HOST}

echo "Creating Docker Swarm Secrets ${HOST}:*********"
RESPONSE=`echo -n ${TOKEN} | sudo docker secret create ${HOST} -`
echo "${RESPONSE}"

echo "Adding new secret to the swarm network..."
sudo docker service update --secret-add ${HOST} arc_intg_gitlab