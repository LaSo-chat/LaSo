// src/services/authService.ts
import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';

const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export const signUp = async (email: string, password: string): Promise<{ user: User | null, session: Session | null }> => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });
    if (error) throw error;
    return data;
};

export const signIn = async (email: string, password: string): Promise<{ user: User | null, session: Session | null }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) throw error;
    return data;
};

export const getCurrentUser = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
        console.error('Error retrieving session:', error);
        return null;
    }
    return data.session?.user || null;
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

export async function getUserFromSession() {
    const { data, error } = await supabase.auth.getSession();
    
    if (error || !data.session) {
        throw new Error('Unable to get session');
    }
    
    const user = data.session.user;
    
    if (!user) {
        throw new Error('No user associated with this session');
    }

    console.log(user.id,'user.id');
    

    return user.id; // This will be the `supabaseId` in your database
}