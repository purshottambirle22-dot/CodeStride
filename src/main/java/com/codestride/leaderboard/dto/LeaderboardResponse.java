package com.codestride.leaderboard.dto;

public class LeaderboardResponse {
    private int rank;
    private String userId;
    private String username;
    private int totalPoints;

    public LeaderboardResponse(
            int rank,
            String userId,
            String username,
            int totalPoints
    ) {
        this.rank = rank;
        this.userId = userId;
        this.username = username;
        this.totalPoints = totalPoints;
    }

    public int getRank() {
        return rank;
    }

    public String getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public int getTotalPoints() {
        return totalPoints;
    }
}
