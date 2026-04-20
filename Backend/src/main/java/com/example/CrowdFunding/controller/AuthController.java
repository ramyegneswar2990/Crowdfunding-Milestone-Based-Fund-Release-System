package com.example.CrowdFunding.controller;

import com.example.CrowdFunding.dto.request.CreateUserRequest;
import com.example.CrowdFunding.dto.request.LoginRequest;
import com.example.CrowdFunding.dto.response.ApiResponse;
import com.example.CrowdFunding.dto.response.AuthResponse;
import com.example.CrowdFunding.dto.response.UserResponse;
import com.example.CrowdFunding.service.AuthService;
import com.example.CrowdFunding.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final AuthService authService;

    public AuthController(UserService userService, AuthService authService) {
        this.userService = userService;
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody CreateUserRequest req) {
        UserResponse created = userService.register(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("User registered", created));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest req) {
        AuthResponse auth = authService.login(req);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", auth));
    }
}

