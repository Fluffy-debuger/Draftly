import docker
from fastapi import Depends

docker_client = docker.from_env()

def get_docker_client():
    return docker_client