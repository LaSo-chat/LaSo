import { supabase } from './authService';

// This function will create a new group with selected members
export async function createGroup(groupName: string, groupDescription: string, memberIds: string[]) {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
        throw new Error('User is not authenticated');
    }

    const userId = sessionData.session.user?.id;

    if (!userId) {
        throw new Error('User ID not found');
    }

    const backendUrl = import.meta.env.VITE_API_URL || 'https://laso.onrender.com';
    const response = await fetch(`${backendUrl}/api/groups`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({
            name: groupName,
            description: groupDescription,
            members: memberIds,
        }),
    });

    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || 'Failed to create group');
    }

    return result;
}

// This function fetches all groups for the logged-in user
export async function getGroupsForUser() {
    const { data: sessionData, error } = await supabase.auth.getSession();

    if (error || !sessionData.session) {
        throw new Error('Failed to retrieve session');
    }

    const backendUrl = import.meta.env.VITE_API_URL || 'https://laso.onrender.com';
    const response = await fetch(`${backendUrl}/api/groups/getGroups`, {
        headers: {
            'Authorization': `Bearer ${sessionData.session.access_token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch groups');
    }

    return await response.json();
}

// This function fetches available members for creating a new group
export async function getAvailableMembers() {
    const { data: sessionData, error } = await supabase.auth.getSession();

    if (error || !sessionData.session) {
        throw new Error('Failed to retrieve session');
    }

    const backendUrl = import.meta.env.VITE_API_URL || 'https://laso.onrender.com';
    const response = await fetch(`${backendUrl}/api/users`, {
        headers: {
            'Authorization': `Bearer ${sessionData.session.access_token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch members');
    }

    return await response.json();
}

// This function marks all messages as read for a given group ID
export async function markGroupMessagesAsRead(groupId: string) {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
        throw new Error('User is not authenticated');
    }

    const backendUrl = import.meta.env.VITE_API_URL || 'https://laso.onrender.com';
    const response = await fetch(`${backendUrl}/api/groups/${groupId}/read`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${sessionData.session.access_token}`,
        },
    });

    if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to mark messages as read');
    }

    return true;
}
