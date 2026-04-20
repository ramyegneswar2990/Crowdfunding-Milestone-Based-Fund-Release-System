package com.example.CrowdFunding.dto.response;

import com.example.CrowdFunding.enums.UserRole;
import lombok.*;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private UserRole role;
    private Instant createdAt;
}

