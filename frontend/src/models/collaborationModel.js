const baseUrl = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:4000/api';

export const fetchSessionSummary = async (sessionId) => {
    const response = await fetch(`${baseUrl}/collab/session-summary/${sessionId}`);
    return response;
}