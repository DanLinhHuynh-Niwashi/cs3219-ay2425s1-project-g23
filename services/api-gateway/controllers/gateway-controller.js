export const handleHttpUploadFile = async (req, res, base_url, port, endpoint) => {
  try {
    
    const formData = new FormData(); 
    if (req.files && req.files.questionsFile) {
      const fileBlob = new Blob([req.files.questionsFile.data], { type: req.files.questionsFile.mimetype });
      formData.append("questionsFile", fileBlob, req.files.questionsFile.name);
      console.log (formData)
    } else {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const url = `${base_url}:${port}${endpoint}`;
    console.log(`Routing request to ${url}.`);

    // Make a POST request to the target service with the FormData
    const response = await fetch(url, {
      method: req.method,
      body: formData,
    });

    const data = await response.json();
    // Send the rest of the response to the client
    res.status(response.status).json(data);

  } catch (error) {
    console.log(error)
    res.status(500).json(error.message);
  }
};

export const handleHttpRequest = async (req, res, base_url, port, endpoint) => {
  try {
    console.log(req.body)
    const url = `${base_url}:${port}${endpoint}`;
    console.log(`Routing request to ${url}.`);

    const response = await fetch(url, {
      method: req.method,
      headers: req.headers,
      body: req.method !== 'GET' ? JSON.stringify(req.body) : null,
    });
    const data = await response.json();
    // Send the rest of the response to the client
    res.status(response.status).json(data);

  } catch (error) {
    console.log(error)
    res.status(500).json(error.message);
  }
};

export const handleHttpCredentialRequest = async (req, res, base_url, port, endpoint) => {
  try {
    const url = `${base_url}:${port}${endpoint}`;
    console.log(req.body)
    console.log(`Routing request to ${url}.`);
    const response = await fetch(url, {
      method: req.method,
      headers: req.headers,
      body: req.method !== 'GET' ? JSON.stringify(req.body) : null,
      credentials: 'include',
    });
    const data = await response.json();
    // Send the rest of the response to the client
    res.status(response.status).json(data);

  } catch (error) {
    console.log(error)
    res.status(500).json(error.message);
  }
};

export const handleLoginRequest = async (req, res, base_url, port, endpoint) => {
  try {
    const url = `${base_url}:${port}${endpoint}`;
    console.log(req.body)
    console.log(`Routing request to ${url}.`);

    const response = await fetch(url, {
      method: req.method,
      headers: req.headers,
      body: JSON.stringify(req.body),
      credentials: 'include',
    });

    const data = await response.json();
    console.log(data);
    if(response.ok) {
      res.cookie('token', data.data.accessToken);
      res.cookie('user_id', data.data.id.toString());
    }

    // Send the rest of the response to the client
    res.status(response.status).json(data);

  } catch (error) {
    console.log(error)
    res.status(500).json(error.message);
  }
};