import { CognitoUserPool } from 'amazon-cognito-identity-js';

const poolData = {
    UserPoolId: 'us-east-1_BcnAqftuf',
    ClientId: '4kn32tn9oc3p3lr7bbmbetue0h'
}

export default new CognitoUserPool(poolData);