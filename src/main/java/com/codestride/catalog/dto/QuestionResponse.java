package com.codestride.catalog.dto;

import java.time.Instant;

public class QuestionResponse {

    private String id;
    private String patternId;
    private String title;
    private String difficulty;
    private String externalUrl;
    private boolean active;
    private Instant createdAt;

    // Optional user-specific & contextual metadata
    private String status; // "NOT_STARTED", "ATTEMPTED", "SOLVED"
    private boolean bookmarked;
    private String notes;
    private String patternName;
    private String topicName;
    private int points;

    public QuestionResponse() {
    }

    public QuestionResponse(
            String id,
            String patternId,
            String title,
            String difficulty,
            String externalUrl,
            boolean active,
            Instant createdAt
    ) {
        this.id = id;
        this.patternId = patternId;
        this.title = title;
        this.difficulty = difficulty;
        this.externalUrl = externalUrl;
        this.active = active;
        this.createdAt = createdAt;
        this.points = calculatePoints(difficulty);
    }

    public QuestionResponse(
            String id,
            String patternId,
            String title,
            String difficulty,
            String externalUrl,
            boolean active,
            Instant createdAt,
            String status,
            boolean bookmarked,
            String notes,
            String patternName,
            String topicName
    ) {
        this.id = id;
        this.patternId = patternId;
        this.title = title;
        this.difficulty = difficulty;
        this.externalUrl = externalUrl;
        this.active = active;
        this.createdAt = createdAt;
        this.status = status;
        this.bookmarked = bookmarked;
        this.notes = notes;
        this.patternName = patternName;
        this.topicName = topicName;
        this.points = calculatePoints(difficulty);
    }

    private static int calculatePoints(String difficulty) {
        if (difficulty == null) return 10;
        return switch (difficulty.toUpperCase()) {
            case "HARD" -> 30;
            case "MEDIUM" -> 20;
            default -> 10;
        };
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPatternId() {
        return patternId;
    }

    public void setPatternId(String patternId) {
        this.patternId = patternId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
        this.points = calculatePoints(difficulty);
    }

    public String getExternalUrl() {
        return externalUrl;
    }

    public void setExternalUrl(String externalUrl) {
        this.externalUrl = externalUrl;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean isBookmarked() {
        return bookmarked;
    }

    public void setBookmarked(boolean bookmarked) {
        this.bookmarked = bookmarked;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getPatternName() {
        return patternName;
    }

    public void setPatternName(String patternName) {
        this.patternName = patternName;
    }

    public String getTopicName() {
        return topicName;
    }

    public void setTopicName(String topicName) {
        this.topicName = topicName;
    }

    public int getPoints() {
        return points;
    }

    public void setPoints(int points) {
        this.points = points;
    }
}
