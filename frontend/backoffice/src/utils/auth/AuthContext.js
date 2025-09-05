"use client";

import {createContext, useContext, useState} from "react";

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const loginSuccess = () => {
        setIsLoggedIn(true);
        // Plus de gestion de token - tout est géré par les cookies HTTPOnly côté backend
    };

    const logout = () => {
        setIsLoggedIn(false);
        // Plus de suppression de localStorage - le cookie sera supprimé par l'appel API logout
    };

    return (
        <AuthContext.Provider value={{isLoggedIn, loginSuccess, logout}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
