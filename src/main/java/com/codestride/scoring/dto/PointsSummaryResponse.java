package com.codestride.scoring.dto;

public class PointsSummaryResponse {

    private int totalPoints;
    private long solvedQuestions;
    private long attemptedQuestions;

    public PointsSummaryResponse(
            int totalPoints,
            long solvedQuestions,
            long attemptedQuestions
    ) {
        this.totalPoints = totalPoints;
        this.solvedQuestions = solvedQuestions;
        this.attemptedQuestions = attemptedQuestions;
    }

    public int getTotalPoints() {
        return totalPoints;
    }

    public long getSolvedQuestions() {
        return solvedQuestions;
    }
    public long getAttemptedQuestions() {
        return attemptedQuestions;
    }
}
