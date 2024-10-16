## .env file instruction

Make sure that your .env file is in the **same level** with package.json.

Sample .env
```
DB_CLOUD_URI=mongodb+srv://path.to.your.cluster/
DB_LOCAL_URI=mongodb://path.to.your.local.database/
PORT={port}

# Will use cloud MongoDB Atlas database
ENV=PROD
```
Replace {port} with the port on which your question service would run. **Avoid port 3000** as our frontend will run there.
