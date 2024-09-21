// src/hooks/useAuth.ts
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { login } from '../app/slices/authSlice'; // Redux login action
import { supabase } from '../services/authService';

export const useAuth = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const checkSession = async () => {
            const { data, error } = await supabase.auth.getSession();
            if (data?.session) {
                dispatch(login(data.session.user)); // Restore user session in Redux
            }
        };
        checkSession();
    }, [dispatch]);
};
