import React, { useState } from 'react';
import UserPool from "./UserPool";
import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import "./Cognito.css";

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSignUp = async (e) => {
        e.preventDefault();

        const user = new CognitoUser({
            Username: username,
            Pool: UserPool
        });

        const authDetails = new AuthenticationDetails({
            Username: username,
            Password: password
        });

        user.authenticateUser(authDetails, {
            onSuccess: data => {
                console.log('onSuccess:', data);
                localStorage.setItem('accessToken', data.getAccessToken().getJwtToken());
                localStorage.setItem('refreshToken', data.getRefreshToken().getToken());
            },
            onFailure: err => {
                console.error('onFailure:', err);
            },
            newPasswordRequired: data => {
                console.log('newPasswordRequired:', data);
            }
        });


    };

    return (
        <div className="text-center" id="cognitoBox">>
            {
                <form className="loginForm" onSubmit={handleSignUp}>
                    <input
                        className="loginInput"
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        className="loginInput"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className="joinButton" type="submit">Login</button>
                </form>
            }
        </div>
    );
};

export default Login;