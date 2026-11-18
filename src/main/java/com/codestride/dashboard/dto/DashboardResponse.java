
package com.codestride.dashboard.dto;

import com.codestride.user.dto.UserResponse;
import com.codestride.scoring.dto.PointsSummaryResponse;
import com.codestride.leaderboard.dto.LeaderboardResponse;

public class DashboardResponse {

    private UserResponse profile;
    private PointsSummaryResponse points;
    private LeaderboardResponse leaderboard;
    private int currentStreak;
    private int todaySolved;
    private long easySolved;
    private long mediumSolved;
    private long hardSolved;
    private java.util.Map<String, Integer> weeklyActivity;

    public DashboardResponse(
            UserResponse profile,
            PointsSummaryResponse points,
            LeaderboardResponse leaderboard
    ) {
        this(profile, points, leaderboard, 0, 0, 0, 0, 0, java.util.Collections.emptyMap());
    }

    public DashboardResponse(
            UserResponse profile,
            PointsSummaryResponse points,
            LeaderboardResponse leaderboard,
            int currentStreak,
            int todaySolved,
            long easySolved,
            long mediumSolved,
            long hardSolved,
            java.util.Map<String, Integer> weeklyActivity
    ) {
        this.profile = profile;
        this.points = points;
        this.leaderboard = leaderboard;
        this.currentStreak = currentStreak;
        this.todaySolved = todaySolved;
        this.easySolved = easySolved;
        this.mediumSolved = mediumSolved;
        this.hardSolved = hardSolved;
        this.weeklyActivity = weeklyActivity != null ? weeklyActivity : java.util.Collections.emptyMap();
    }

    public UserResponse getProfile() {
        return profile;
    }

    public PointsSummaryResponse getPoints() {
        return points;
    }

    public LeaderboardResponse getLeaderboard() {
        return leaderboard;
    }

    public int getTotalPoints() {
        return points != null ? points.getTotalPoints() : 0;
    }

    public long getSolvedQuestions() {
        return points != null ? points.getSolvedQuestions() : 0;
    }

    public long getAttemptedQuestions() {
        return points != null ? points.getAttemptedQuestions() : 0;
    }

    public Integer getLeaderboardRank() {
        return leaderboard != null ? leaderboard.getRank() : null;
    }

    public int getCurrentStreak() {
        return currentStreak;
    }

    public int getTodaySolved() {
        return todaySolved;
    }

    public long getEasySolved() {
        return easySolved;
    }

    public long getMediumSolved() {
        return mediumSolved;
    }

    public long getHardSolved() {
        return hardSolved;
    }

    public java.util.Map<String, Integer> getWeeklyActivity() {
        return weeklyActivity;
    }
}

