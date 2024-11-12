const baseUrl = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:4000/api';

export const fetchQuestionById = async (id) => {
    console.log(id);
    const response = await fetch(`${baseUrl}/questions/${id}`);
    return response;
};

export const fetchRandomQuestion = async (filters) => {
    const response = await fetch(`${baseUrl}/questions/random/${filters[0]}/${filters[1]}`);
    return response;
};
export const deleteQuestionById = async (id) => {
    const response = await fetch(`${baseUrl}/questions/${id}`, {
        method: 'DELETE',
    });
    return response;
};
export const fetchQuestions = async () => {
    const response = await fetch(`${baseUrl}/questions`);
    return response;
};

export const uploadQuestionsOverride = async (formData) => {
  const response = await fetch(`${baseUrl}/questions/file/upload-questions`, {
    method: 'PATCH',
    body: formData,
  });
  return response; // Return parsed JSON data
};

export const uploadQuestions = async (formData) => {
  const response = await fetch(`${baseUrl}/questions/file/upload-questions`, {
    method: 'POST',
    body: formData,
  });
  return response; // Return parsed JSON data
}
  
export const fetchCategories = async () => {
    const response = await fetch(`${baseUrl}/categories`);
    return response;
};

export const addQuestion = async (newQuestion) => {
    const response = await fetch(`${baseUrl}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestion),
    });
    return response;
}

export const editQuestion = async (id, updatedQuestion) => {
    const response = await fetch(`${baseUrl}/questions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedQuestion),
    });
    return response;
}
