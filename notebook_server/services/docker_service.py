import docker
from pathlib import Path

from docker.errors import NotFound

container_map = {}
docker_client=docker.from_env()
def ensure_container():
    container_name = "MS"

    try:
        container = docker_client.containers.get(container_name)
        container.reload()   

        if container.status == "running":
            print("Container already running.")
            return container

        else:
            print("Container exists but not running. Starting...")
            container.start()
            return container

    except NotFound:
        print("Container not found. Creating new one...")

        container = docker_client.containers.run(
            "executionserver:latest",
            detach=True,
            name=container_name,
            ports={"8080/tcp": 8080},
            network="notebook-container-network"
        )
        return container


container = ensure_container()
print("Final status:", container.status)

def start_notebook_container(
    docker_client: docker.DockerClient,
    notebook_id: str,
    user_id: str,
    notebook_folder: Path
):
    host_path = notebook_folder.absolute()
    container_path = "/app/uploads"

    try:
        container = docker_client.containers.get(notebook_id)
        if container.status != "running":
            container.start()
        return container
    except docker.errors.NotFound:
        pass

    container = docker_client.containers.run(
        "executionserver",
        detach=True,
        name=notebook_id,
        network="notebook-container-network",
        volumes={str(host_path): {"bind": container_path, "mode": "rw"}}
    )

    container_map[notebook_id] = {"container": container}
    return container