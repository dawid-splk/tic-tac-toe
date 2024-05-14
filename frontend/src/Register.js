import React, { useState } from 'react';
import UserPool from "./UserPool";
import { CognitoUserAttribute } from 'amazon-cognito-identity-js';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignUp = async (e) => {
        e.preventDefault();

        const attributeList = [
            new CognitoUserAttribute({ Name: 'email', Value: email })
        ];

        UserPool.signUp(username, password, attributeList, null, (err, data) => {
            if (err) {
                console.error(err);
            }
            console.log(data);
        });
    };

    return (
        <div className="text-center" id="cognitoBox">
            {
                <form className="registerForm" onSubmit={handleSignUp}>
                    <input
                        className="loginInput"
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        className="loginInput"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        className="loginInput"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className="joinButton" type="submit">Register</button>
                </form>
            }
        </div>
    );
};

export default Register;