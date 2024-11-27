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

    const backendUrl = import.meta.env.VITE_API_URL || 'https://laso.onrender.com';
    const response = await fetch(`${backendUrl}/api/chat/start`, {
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
    const backendUrl = import.meta.env.VITE_API_URL || 'https://laso.onrender.com';
    const response = await fetch(`${backendUrl}/api/chat/contacts?userId=${supabaseUserId}`);

    if (!response.ok) {
        throw new Error('Failed to fetch contacts');
    }

    const contacts = await response.json();
    console.log(contacts,"contactscontacts");
    
    return contacts;
}


// This function marks all messages as read for a given chat ID
export async function markMessagesAsRead(chatId: number) {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
        throw new Error('User is not authenticated');
    }

    const userId = sessionData.session.user?.id;

    if (!userId) {
        throw new Error('User ID not found');
    }

    const backendUrl = import.meta.env.VITE_API_URL || 'https://laso.onrender.com';
    const response = await fetch(`${backendUrl}/api/chat/markMessagesAsRead`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({ chatId, userId }), // Send chatId and userId to mark messages as read
    });

    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || 'Failed to mark messages as read');
    }

    return result;
}







// This function fetches unread contacts and groups for the logged-in user with a maximum of 4 items for each
export async function getUnreadContactsAndGroupsForUser() {
    // Get the logged-in user's session
    const { data: sessionData, error } = await supabase.auth.getSession();

    if (error || !sessionData.session) {
        throw new Error('Failed to retrieve session');
    }

    // Retrieve the userId (UUID) from Supabase Auth
    const supabaseUserId = sessionData.session.user.id; // UUID from Supabase Auth
    const backendUrl = import.meta.env.VITE_API_URL || 'https://laso.onrender.com';

    // Fetch unread contacts (limiting to a max of 4, filtered by isRead: false)
    const contactsResponse = await fetch(`${backendUrl}/api/chat/contacts?userId=${supabaseUserId}&limit=4&isRead=false`);
    if (!contactsResponse.ok) {
        throw new Error('Failed to fetch unread contacts');
    }
    const contacts = await contactsResponse.json();

    // Fetch unread groups (limiting to a max of 4, filtered by isRead: false)
    const groupsResponse = await fetch(`${backendUrl}/api/groups/getGroups?userId=${supabaseUserId}&limit=4&isRead=false`, {
        headers: {
            'Authorization': `Bearer ${sessionData.session.access_token}`,
        },
    });

    if (!groupsResponse.ok) {
        throw new Error('Failed to fetch unread groups');
    }
    
    const groups = await groupsResponse.json();
    // console.log(groups,'+++++++++++++++++groups');

    // Filter unread contacts and groups (if the backend doesn't filter by isRead)
    // const unreadContacts = contacts.filter((contact: any) => contact.lastMessage?.isRead === false);
    // const unreadGroups = groups.filter((group: any) => group.lastMessage?.isRead === false);

    // Return both unread contacts and groups
    return {
        contacts: contacts,
        groups: groups
    };
}






export const deleteContact = async (contactId: number) => {
    try {
      // Get the current user's access token
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
        throw new Error('User is not authenticated');
    }

    const userId = sessionData.session.user?.id;

    if (!userId) {
        throw new Error('User ID not found');
    }
  
      const backendUrl = 
        import.meta.env.VITE_API_URL || "https://your-backend-url.com";
  
      const response = await fetch(`${backendUrl}/api/chat/delete/${contactId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session.access_token}`
        }
      });
  
      // Check if the response is not okay
      if (!response.ok) {
        // Try to parse error message from response
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || 
          `HTTP error! status: ${response.status}`
        );
      }
  
      // Parse and return response data
      return await response.json();
    } catch (error) {
      console.error('Failed to delete contact:', error);
      
      // Rethrow or handle specific error types
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('An unexpected error occurred while deleting contact');
    }
  };
