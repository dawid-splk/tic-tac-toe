import React, { useState } from 'react';
import UserPool from "./UserPool";
import { CognitoUserAttribute } from 'amazon-cognito-identity-js';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [image, setImage] = useState(null);

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSignUp = async (e) => {
        e.preventDefault();

        const attributeList = [
            new CognitoUserAttribute({ Name: 'email', Value: email })
        ];

        UserPool.signUp(username, password, attributeList, null, async (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log(data);

            if (image) {
                const formData = new FormData();
                formData.append('file', image);
                formData.append('username', username);

                try {
                    const response = await fetch('http://localhost:8080/upload', {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'Accept': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        throw new Error(`Error: ${response.statusText}`);
                    }

                    const result = await response.text();
                    console.log('Image uploaded successfully:', result);
                } catch (error) {
                    console.error('Error uploading image:', error);
                }
            }
        });
    };

    return (
        <div className="text-center" id="cognitoBox">
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
                <input
                    className="loginInput"
                    type="file"
                    onChange={handleImageChange}
                />
                <button className="joinButton" type="submit">Register</button>
            </form>
        </div>
    );
};

export default Register;
