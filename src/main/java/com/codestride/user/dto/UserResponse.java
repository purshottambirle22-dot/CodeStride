
package com.codestride.user.dto;

import java.time.Instant;

public class UserResponse {

    private String id;
    private String username;
    private String email;
    private String role;
    private Instant createdAt;
    private String theme;
    public UserResponse(
            String id,
            String username,
            String email,
            String role,
            String theme,
            Instant createdAt
    ) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.theme = theme;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
    public String getTheme() {
        return theme;
    }
}

