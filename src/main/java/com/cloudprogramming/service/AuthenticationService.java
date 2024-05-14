package com.cloudprogramming.service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.RSAKeyProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {
    @Value("${aws.cognito.region}")
    private String aws_cognito_region;
    @Value("${aws.user.pools.id}")
    private String aws_user_pools_id;

    public Boolean validateToken(String token) {

        RSAKeyProvider keyProvider = new CognitoKeyProvider(aws_cognito_region, aws_user_pools_id);
        Algorithm algorithm = Algorithm.RSA256(keyProvider);
        JWTVerifier jwtVerifier = JWT.require(algorithm).build();

        jwtVerifier.verify(token);
        return true;
    }
}