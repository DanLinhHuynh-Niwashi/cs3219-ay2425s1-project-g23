const baseUrl = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:4000/api';

export const updateUserProfile = async (profileExists, id, profile) => {
    const method = profileExists ? 'PATCH' : 'POST'
    const path = profileExists ? `${baseUrl}/users/${id}/user-profile` : `${baseUrl}/users/${id}`
    const response = await fetch(path, {
        method: method,
        headers: {
                'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
    });
    return response;
}

export const fetchUserProfile = async (id, token) => {
    const response = await fetch(`${baseUrl}/users/${id}/user-profile`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    return response;
}

export const fetchResetPassword = async (email) => {
    const response = await fetch(`${baseUrl}/users/reset-password/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }), 
    });
    return response;
}
export const fetchUpdatePassword = async (password, token) => {
    const response = await fetch(`${baseUrl}/users/update-password/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({password, token}),
    });
    return response;
}
export const fetchLogin = async (login) => {
    const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(login),
        credentials: 'include',
    });
    return response;
}

export const fetchUserNameById = async (id) => {
    const response = await fetch(`${baseUrl}/users/${id}/get-username/`);
    return response;
}

export const signupUser = async (details) => {
    const response = await fetch(`${baseUrl}/users/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details),
    });
    return response;
}