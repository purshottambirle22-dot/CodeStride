package com.codestride.admin.dto;

import java.time.Instant;

public class AdminUserResponse {
    private String id;
    private String username;
    private String email;
    private String role;
    private String theme;
    private Instant createdAt;
    private int totalPoints;
    private long solvedQuestions;

    public AdminUserResponse(String id, String username, String email, String role,
                             String theme, Instant createdAt, int totalPoints, long solvedQuestions) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.theme = theme;
        this.createdAt = createdAt;
        this.totalPoints = totalPoints;
        this.solvedQuestions = solvedQuestions;
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

    public String getTheme() {
        return theme;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public int getTotalPoints() {
        return totalPoints;
    }

    public long getSolvedQuestions() {
        return solvedQuestions;
    }
}
