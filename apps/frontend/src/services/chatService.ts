import { supabase } from './authService';

// This function will create a new contact or chat relation between users
export async function startNewChat(contactId: string) {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
        throw new Error('User is not authenticated');
    }

    const userId = sessionData.session.user?.id;

    if (!userId) {
        throw new Error('User ID not found');
    }

    const response = await fetch('/api/chat/start', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({ userId, contactId }),  // Send the userId and contactId to create the chat relation
    });

    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || 'Failed to start new chat');
    }

    return result;
}

export async function getContactsForUser() {
    // Get the logged-in user's session
    const { data: sessionData, error } = await supabase.auth.getSession();

    if (error || !sessionData.session) {
        throw new Error('Failed to retrieve session');
    }

    // Retrieve the userId (UUID) from Supabase Auth
    const supabaseUserId = sessionData.session.user.id; // UUID from Supabase Auth

    // Make an API call to fetch contacts for the logged-in user using their Supabase ID
    const response = await fetch(`/api/chat/contacts?userId=${supabaseUserId}`);

    if (!response.ok) {
        throw new Error('Failed to fetch contacts');
    }

    const contacts = await response.json();
    console.log(contacts,"contactscontacts");
    
    return contacts;
}