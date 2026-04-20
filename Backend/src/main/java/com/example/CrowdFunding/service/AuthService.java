package com.example.CrowdFunding.service;

import com.example.CrowdFunding.dto.request.LoginRequest;
import com.example.CrowdFunding.dto.response.AuthResponse;
import com.example.CrowdFunding.entity.User;
import com.example.CrowdFunding.exception.UnauthorizedActionException;
import com.example.CrowdFunding.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    public AuthService(AuthenticationManager authenticationManager, UserService userService, JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse login(LoginRequest req) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
            UserDetails principal = (UserDetails) auth.getPrincipal();
            User user = userService.getByEmail(principal.getUsername());
            String token = jwtUtil.generateToken(principal, Map.of("role", user.getRole().name(), "userId", user.getId()));
            return AuthResponse.builder()
                    .token(token)
                    .tokenType("Bearer")
                    .userId(user.getId())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .build();
        } catch (BadCredentialsException ex) {
            throw new UnauthorizedActionException("Invalid email or password");
        }
    }
}

