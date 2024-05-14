import React, { useState } from 'react';
import UserPool from "./UserPool";
import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import "./Cognito.css";

const Logout = () => {

    const handleLogout = async (e) => {
        e.preventDefault();

        const user = UserPool.getCurrentUser();

        if (user) {
            user.signOut();
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }
    };

    return (
        <div className="text-center" id="cognitoBox">
            {
                <button className="joinButton" onClick={handleLogout}>Logout</button>
            }
        </div>
    );
};

export default Logout;