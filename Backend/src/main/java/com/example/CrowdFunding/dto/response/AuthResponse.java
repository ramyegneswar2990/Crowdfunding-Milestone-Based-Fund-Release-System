package com.example.CrowdFunding.dto.response;

import com.example.CrowdFunding.enums.UserRole;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private String tokenType;
    private Long userId;
    private String email;
    private UserRole role;
}

