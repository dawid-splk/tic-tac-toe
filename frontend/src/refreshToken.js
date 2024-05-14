import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import UserPool from './UserPool';

export const refreshToken = async () => {
    try {
        const currentUser = UserPool.getCurrentUser();

        if (currentUser) {
            currentUser.getSession((err, session) => {
                if (err) {
                    console.error('Error getting user session:', err);
                    return;
                }

                const refreshToken = session.getRefreshToken();

                if (!refreshToken) {
                    console.error('No refresh token found');
                    return;
                }

                if (session.isValid()) {
                    console.log('Session is still valid');
                    return;
                }

                const cognitoUser = new CognitoUser({
                    Username: currentUser.getUsername(),
                    Pool: UserPool
                });

                cognitoUser.refreshSession(refreshToken, (refreshErr, newSession) => {
                    if (refreshErr) {
                        console.error('Error refreshing session:', refreshErr);
                        return;
                    }

                    const newAccessToken = newSession.getAccessToken().getJwtToken();
                    localStorage.setItem('accessToken', newAccessToken);
                    console.log('Successfully refreshed token');
                });
            });
        } else {
            console.error('No current user found');
        }
    } catch (error) {
        console.error('Unable to refresh token:', error);
    }
};