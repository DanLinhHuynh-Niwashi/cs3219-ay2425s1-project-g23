N8: Scalability
## Kubernetes and Horizontal Pod Auto-scaler (HPA)
The application uses Horizontal Pod Autoscalers (HPAs) to manage scalability based on CPU utilization. The HPAs automatically adjust the number of pods for each service based on the load.

### Configuration Infomation
Each microservice has its own HPA configuration file located in the `./k8` directory. 
- The HPA settings by default are:
    - Min Replicas: The minimum number of pod replicas (e.g., 1).
    - Max Replicas: The maximum number of pod replicas (e.g., 10).
    - Target CPU Utilization: The desired average CPU utilization (e.g., 50%).
- The HPA configuration files for each service are:
    - Frontend: `k8/hpas/frontend-hpa.yaml`
	- Collaboration Service: `k8/hpas/collaboration-service-hpa.yaml`
	- Matching Service: `k8/hpas/matching-service-hpa.yaml`
	- Question Service: `k8/hpas/question-service-hpa.yaml`
	- User Service: `k8/hpas/user-service-hpa.yaml`
    - History Service: `k8/hpas/history-service-hpa.yaml`

### Setup Instructions
- **Step 1: Setting up Docker Images.**
Ensure repository is cloned, and `.env` file is added. **Note:** `./k8/app-config.yaml` should hold the same ports and urls variables as the .env file. If there are discrepencies, update them to match. If you would like to change the ports for the services, you need to update ports in the app-config, and the relevant deployment and service `.yaml` files. 
    - If you want to use your own Docker Hub repository (where you will need to then push to), specify your Docker Hub ID in the .env **and** change image names in `.yaml`s in `./k8/deployments` for the microservices (so excluding redis and metrics-server deployments) to replace `wuemily` with your docker hub ID. 
	    - After building the Docker images (steps 3 and 4 in `README.md`), push them with:
`docker push dockerhubid/question-service:latest`
`docker push dockerhubid/user-service:latest`
`docker push dockerhubid/matching-service:latest`
`docker push dockerhubid/collaboration-service:latest`
`docker push dockerhubid/frontend:latest`
`docker push dockerhubid/api-gateway:latest`
`docker push dockerhubid/history-service:latest`
    - Alternatively, you can also use existing public reposity by setting the Docker Hub ID to wuemily; no need to push images or make changes in `.yaml` files. 
- **Step 2: Setting up Minikube and Kubernetes.**
This assumes some basic understanding of Minikube and Kubernetes and they are both installed.
    - Start Minikube with: ``minikube start --driver=docker``
    - To apply the HPA configurations to your Kubernetes cluster, use the following commands (from root folder):
        `kubectl apply -f ./k8`
        `kubectl apply -f ./k8/deployments`
        `kubectl apply -f ./k8/services`
        `kubectl apply -f ./k8/statefulsets`
        `kubectl apply -f ./k8/hpas`
    - If load balancers appear to be not working, it may be because of the local hosting. Make sure `minikube tunnel` is running.
- **Step 3: Monitoring**
You can monitor the scaling behavior using `kubectl` commands. 
- `kubectl get hpa`displays the current status of all HPAs in the cluster, including the current and desired number of replicas based on CPU usage.
    - If CPU usage is `unknown`, check if Minikube metrics server addon is enabled with `minikube adddons list`, if it isn't, enable with `minikube addons enable metrics-server`. 
- Can also observe pods and their status with `kubectl get pods` and `minikube dashboard`, depending on your preference. 