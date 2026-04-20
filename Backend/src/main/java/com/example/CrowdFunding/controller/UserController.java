package com.example.CrowdFunding.controller;

import com.example.CrowdFunding.dto.response.ApiResponse;
import com.example.CrowdFunding.dto.response.UserResponse;
import com.example.CrowdFunding.enums.UserRole;
import com.example.CrowdFunding.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<UserResponse>> listUsers(@RequestParam(name = "role", required = false) UserRole role) {
        if (role == null) {
            return ApiResponse.ok("Users fetched", userService.listAll());
        }
        return ApiResponse.ok("Users fetched", userService.listByRole(role));
    }
}

