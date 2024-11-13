[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/bzPrOe11)
# CS3219 Project (PeerPrep) - AY2425S1
## Group: G23

### Note: 
- You can choose to develop individual microservices within separate folders within this repository **OR** use individual repositories (all public) for each microservice. 
- In the latter scenario, you should enable sub-modules on this GitHub classroom repository to manage the development/deployment **AND** add your mentor to the individual repositories as a collaborator. 
- The teaching team should be given access to the repositories as we may require viewing the history of the repository in case of any disputes or disagreements. 

### Run
- **Step 1:** Clone the repository.
- **Step 2:** Setup the necessary .env files in the /frontend and root folder using the .env.sample templates in both folders. 
    - Fill in the necessary information enclosed by curly brackets {}. 
    - The default ports are given by defefault as:
        - GATEWAY_PORT=4000 
        - QUESTION_PORT=3001 
        - USER_PORT=3002 
        - MATCHING_PORT=8080 
        - COLLAB_PORT=8081 
        - HISTORY_PORT=8082 
        - If setting custom ports:
            - Avoid using port 3000, as the React app runs on that port.
            - For instructions on using Kubernetes, refer to the `HPA-SETUP.md` file. You may have to edit additional files for custom ports to work.
- **Step 3:** Run `docker --version` to check if docker is correctly installed. If not, ensure it is. 
- **Step 4:** Run `docker-compose up --build -d ` command in terminal to build and run the app. 
- **Step 5:** Go to http://localhost:3000 to see the application and services running. 
- **Step 6:** Run `docker compose down` to stop running Docker containers. 
    - You can also run `docker compose down`, then `docker compose up -d` again to restart backend services. 
- If using Kubernetes, please refer to `HPA-SETUP.md`. 