import React, { useContext, createContext, useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate, Outlet } from 'react-router-dom';

let AuthContext = createContext(null);
export function useAuth() {
    return useContext(AuthContext);
}

export function RequireAuth({ children }) {
    let auth = useAuth();
    let location = useLocation();
    if (!auth.isAuthenticated) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to when they were redirected. This allows us to send them
        // along to that page after they login, which is a nicer user experience
        // than dropping them off on the home page.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}

export function RedirectLoged({ children }) {
    let auth = useAuth();
    let location = useLocation();
    if (auth.isAuthenticated) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to when they were redirected. This allows us to send them
        // along to that page after they login, which is a nicer user experience
        // than dropping them off on the home page.
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children;
}

export default function AuthProvider({ children }) {
    const user = localStorage.getItem('user');
    let [phoneNumber, setPhoneNumber] = React.useState(null);
    let [isAuthenticated, setIsAuthenticated] = React.useState(!!user);
    let sendCode = async (newPhoneNumber = phoneNumber) => {
        phoneNumber = newPhoneNumber;
        const response = await fetch('http://localhost:3000/users/get-code', {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json',
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            body: JSON.stringify({ phoneNumber: newPhoneNumber }), // body data type must match "Content-Type" header
        })  ;

        return response.json();
    };
    let checkCode = async (newCode, callback) => {
        const response = await fetch('http://localhost:3000/users/validate-code', {
            method: 'POST',
            mode: 'cors', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phoneNumber: phoneNumber, accessCode: newCode }), // body data type must match "Content-Type" header
        });
        const data = await response.json();
        if (data.success) {
            localStorage.setItem('user', data.user);
            setIsAuthenticated(true);
        }
        callback();
        return data;
    };

    let signout = (callback) => {
        console.log('signout');
        setPhoneNumber(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');

        callback();
    };

    let value = { phoneNumber, isAuthenticated, sendCode, checkCode, signout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
