#!/bin/sh

# -------------------------------------------------------------------------------
# Information
# -------------------------------------------------------------------------------

# Installation script to automatically setup the ARC Metadata Registry on a single server.
# Author: DataPLANT
# Documentation: https://arc-metadata-registry.readthedocs.io/en/latest/
# Version: 1.0
# -----------------------------------------------------------------------------
# Script
# -----------------------------------------------------------------------------

# Mandatory: API-Key with full access to GitLab Repository
GITLAB_API_KEY="defaultKey"
# Mandatory: Password of user "elastic" - make sure this is same in the docker compose file
ELATICSEARCH_PASSWORD="2TrVTlijYsBR3W6Y5aPNgB"
# If empty, self-signed certificate (OpenSSL) will be created
PATH_TO_CERT_KEY=""
PATH_TO_CERT_CRT=""
# Default data storage for volumes. If empty, "/var/lib/docker" (standard) will be used
DOCKER_STORAGE=""
# DOCKER_STORAGE="/dbvol/docker"


if [ -z "$1" ] 
 then
    echo "No argument supplied. Valid arguments are install, start, shutdown, uninstall"
	exit 1
fi

case $1 in
	install) 
		#install docker and docker swarm
		echo "Installation script started..."
		echo "Uninstaling older Docker version..."
		sudo apt-get remove docker docker-engine docker.io containerd runc
		echo "Update the apt package index for latest Docker version"
		sudo apt-get update
		sudo apt-get --assume-yes install apt-transport-https ca-certificates curl gnupg lsb-release
		curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --batch --yes --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
		echo \
		"deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
		$(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
		sudo apt-get update
		echo "Installing Docker..."
		sudo apt-get --assume-yes install docker-ce docker-ce-cli containerd.io
		echo "Successfully installed latest version of Docker"
		echo "Setup Docker Swarm..."
		MANAGER_IP=$(ip route get 8.8.8.8 | sed -n '/src/{s/.*src *\([^ ]*\).*/\1/p;q}')
		sudo docker swarm init --advertise-addr $MANAGER_IP
		echo "Successfully setup Docker Swarm"
		# (Optional) Create self-signed certificate (OpenSSL)
		if [ -z "$PATH_TO_CERT_KEY" ] || [ -z "$PATH_TO_CERT_CRT" ]
		then
			echo "Certificate parameters are empty. Creating self-signed certificates..."
			
			sudo apt-get --assume-yes install libssl-dev
			sudo openssl req -x509 -newkey rsa:4096 -keyout cert.key -out cert.crt -days 365 -nodes -subj "/CN=localhost"
				
			PATH_TO_CERT_KEY="cert.key"
			PATH_TO_CERT_CRT="cert.crt"	
				
			echo "Successfully created self-signed certificates"
		fi
		# Create Docker Secrets
		echo "Creating Docker Secrets..."
		echo -n $GITLAB_API_KEY | sudo docker secret create apiKey -
		echo -n $ELATICSEARCH_PASSWORD | sudo docker secret create elasticPassword -
		sudo docker secret create cert.key $PATH_TO_CERT_KEY
		sudo docker secret create cert.crt $PATH_TO_CERT_CRT
		echo "Successfully created Docker Secrets."
		# (Optional) Change Docker's default storage directory
		if [ ! -z "$DOCKER_STORAGE" ]
		then
			echo "Default data storage variable is not empty. Changing default directory..."
			echo '{"data-root": "'$DOCKER_STORAGE'"}' > /etc/docker/daemon.json
			echo "Successfully changed Default data storage directory."
		fi
		# Create Docker Volumes
		echo "Creating Docker Volumes..."
		sudo docker volume create gateway
		sudo docker volume create users
		sudo docker volume create es
		sudo docker volume create es1
		echo "Successfully created Docker Volumes."

		echo "Updating OS params for Elasticsearch"
		VMAX=`grep vm.max_map_count /etc/sysctl.conf`
		if [ -z "$VMAX" ]
		then
			echo "vm.max_map_count is empty. Setting it to 262144"
			sudo sysctl -w vm.max_map_count=262144
		fi

		echo "Deploying ARC Metadata Registry..."
		sudo docker stack deploy --compose-file docker-compose.yml arc
		echo "ARC Metadata Registry successfully deployed."
    echo "Waiting for the containers to start..."
    #sleep 30s
		#echo "Creating admin users in the gateway server..."
		#./create_gateway_admin.sh
		#echo "Adding gitlab tokens..."
    #./add_gitlab_tokens.sh
	;;
	start)
	
		echo "Starting ARC Metadata Registry..."
		sudo docker stack deploy --compose-file docker-compose.yml arc
		echo "ARC Metadata Registry application started successfully."
		echo "Adding gitlab tokens for Freiburg Node1..."
		./add_gitlab_tokens.sh
		echo "Adding gitlab tokens for Freiburg Node2..."
		./add_gitlab_tokens_freiburg2.sh
	;;
	shutdown)
	
		#Bring down the stack if running
		echo "Shutting down the ARC Metadata Registry..."
		sudo docker stack rm arc
		echo "Waiting for the application to shutdown..."
		sleep 15s
		echo "Shutdown complete."
	;;
	uninstall)
		#Bring down the stack if running
		echo "Cleaning up docker services and volumes..."
		sudo docker stack rm arc
		
		# sleep for a minute for containers to shutdown
		sleep 1m
		# clean up the volumes
		echo "Deleting the docker volumes. This will delete the data..."
		sudo docker volume rm es
		sudo docker volume rm es1
		sudo docker volume rm gateway
		sudo docker volume rm users
		#clean up the docker swarm secrets
		echo "Deleting the docker secrets..."
		sudo docker secret rm apiKey
		sudo docker secret rm cert.crt
		sudo docker secret rm cert.key
		sudo docker secret rm elasticPassword

		echo "remove the gitlab tokens using ** sudo docker secret rm ** command"
		echo "Uninstalled ARC Metadata Registry application"
	;;
esac