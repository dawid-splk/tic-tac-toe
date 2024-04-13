package com.cloudprogramming.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${HOST_IP:localhost}")
    private String hostIp;

    private static final Logger logger = LoggerFactory.getLogger(WebConfig.class);


    @Override
    public void addCorsMappings(CorsRegistry registry) {
        logger.info("Adding CORS mappings.. hostIp: {}", hostIp);
        registry.addMapping("/**")
                .allowedOrigins(
                        "http://localhost:3000",
                        "http://localhost",
                        "http://" + hostIp
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}