// src/hooks/useAuth.ts
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../app/slices/authSlice'; // Redux login action
import { supabase } from '../services/authService';

export const useAuth = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const checkSession = async () => {
            try {
                const { data, error } = await supabase.auth.getSession();
                if (error) throw error; // Throw error if exists
                if (data?.session) {
                    dispatch(login(data.session.user)); // Restore user session in Redux
                }
            } catch (err) {
                console.error('Error checking session:', err);
            }
        };

        checkSession();
    }, [dispatch]);
};
