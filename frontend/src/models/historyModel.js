const baseUrl = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:4000/api';

export const fetchAttemptDetails = async(id) => {
    const response = await fetch(`${baseUrl}/history/attempts/${id}`);
    return response;
}

export const fetchAttemptsById = async(userId) => {
    const response = await fetch(`${baseUrl}/history/user/${userId}`);
    return response;
}

