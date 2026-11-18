package com.codestride.admin.dto;

public class AdminStatsResponse {
    private long totalUsers;
    private long totalQuestions;
    private long totalTopics;
    private long totalPatterns;
    private long totalSubmissions;
    private long totalPointsAwarded;

    public AdminStatsResponse(long totalUsers, long totalQuestions, long totalTopics,
                              long totalPatterns, long totalSubmissions, long totalPointsAwarded) {
        this.totalUsers = totalUsers;
        this.totalQuestions = totalQuestions;
        this.totalTopics = totalTopics;
        this.totalPatterns = totalPatterns;
        this.totalSubmissions = totalSubmissions;
        this.totalPointsAwarded = totalPointsAwarded;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public long getTotalQuestions() {
        return totalQuestions;
    }

    public long getTotalTopics() {
        return totalTopics;
    }

    public long getTotalPatterns() {
        return totalPatterns;
    }

    public long getTotalSubmissions() {
        return totalSubmissions;
    }

    public long getTotalPointsAwarded() {
        return totalPointsAwarded;
    }
}
