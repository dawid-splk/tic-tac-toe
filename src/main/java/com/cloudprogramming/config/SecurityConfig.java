package com.cloudprogramming.config;


import com.cloudprogramming.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@RequiredArgsConstructor
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final AuthenticationService authenticationService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf().disable()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                .authorizeHttpRequests()
                .requestMatchers("/game/hello").permitAll()
                .requestMatchers("/upload").permitAll()
                .requestMatchers("/gameplay/**").permitAll()      // public because of cors issue, acceptable solution coz websocket
                .anyRequest().authenticated()                       // requires app and topic prefix (like a token) and is after login anyway
                .and()
                .addFilterBefore(new JwtAuthenticationFilter(authenticationService),
                UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(new CorsFilter(), UsernamePasswordAuthenticationFilter.class);
                // pretty sure that addFilterAfter and CorsFilter are not needed, but once it's working then it's not
                // leaving it for now

        return http.build();
    }
}


