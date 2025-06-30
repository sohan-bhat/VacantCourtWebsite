import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthUserChanged, AppUser, logoutUser as serviceLogout } from '../../services/authService';
import { Unsubscribe } from 'firebase/auth';

interface AuthContextType {
    currentUser: AppUser | null;
    isLoading: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe: Unsubscribe = onAuthUserChanged((user) => {
            setCurrentUser(user);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        await serviceLogout();
    };

    const value = {
        currentUser,
        isLoading,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};