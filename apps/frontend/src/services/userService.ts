import { supabase } from './authService';

// Function to get the user profile from the backend via API call
export async function getUserProfile() {
    // Get the current session, which contains the access token
    const { data: sessionData, error } = await supabase.auth.getSession();

    if (error || !sessionData.session) {
        throw new Error('Failed to retrieve session');
    }

    const token = sessionData.session.access_token; // Extract the access token

    // Fetch the user profile data from your backend API
    const backendUrl = import.meta.env.VITE_API_URL || 'https://laso.onrender.com';
    const response = await fetch(`${backendUrl}/api/user/profile`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`, // Include the token in headers
        },
    });

    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch user profile');
    }

    return result; // Return user profile data
}

// Function to update the user profile
export async function updateUserProfile(data: any) {
    // Get the current session, which contains the access token
    const { data: sessionData, error } = await supabase.auth.getSession();

    if (error || !sessionData.session) {
        throw new Error('Failed to retrieve session');
    }

    const token = sessionData.session.access_token; // Extract the access token

    // Send a PUT request to the backend to update user profile
    const backendUrl = import.meta.env.VITE_API_URL || 'https://laso.onrender.com';
    const response = await fetch(`${backendUrl}/api/user/profile`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // Include the token in headers
        },
        body: JSON.stringify(data),  // The profile data to be updated
    });

    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || 'Profile update failed');
    }

    return result; // Return the result of the profile update
}
