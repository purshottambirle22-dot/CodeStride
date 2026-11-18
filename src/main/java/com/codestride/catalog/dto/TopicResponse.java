package com.codestride.catalog.dto;

import java.time.Instant;

public class TopicResponse {

    private String id;
    private String name;
    private String slug;
    private String description;
    private String detailedLearningDescription;
    private int displayOrder;
    private String icon;
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;

    // Derived statistics
    private int totalPatterns;
    private int totalQuestions;
    private int solvedQuestions;
    private int completionPercentage;

    public TopicResponse() {
    }

    public TopicResponse(
            String id,
            String name,
            String slug,
            String description,
            boolean active,
            Instant createdAt
    ) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = createdAt;
    }

    public TopicResponse(
            String id,
            String name,
            String slug,
            String description,
            String detailedLearningDescription,
            int displayOrder,
            String icon,
            boolean active,
            Instant createdAt,
            Instant updatedAt,
            int totalPatterns,
            int totalQuestions,
            int solvedQuestions,
            int completionPercentage
    ) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.detailedLearningDescription = detailedLearningDescription;
        this.displayOrder = displayOrder;
        this.icon = icon;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.totalPatterns = totalPatterns;
        this.totalQuestions = totalQuestions;
        this.solvedQuestions = solvedQuestions;
        this.completionPercentage = completionPercentage;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDetailedLearningDescription() {
        return detailedLearningDescription;
    }

    public void setDetailedLearningDescription(String detailedLearningDescription) {
        this.detailedLearningDescription = detailedLearningDescription;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(int displayOrder) {
        this.displayOrder = displayOrder;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
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

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public int getTotalPatterns() {
        return totalPatterns;
    }

    public void setTotalPatterns(int totalPatterns) {
        this.totalPatterns = totalPatterns;
    }

    public int getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(int totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public int getSolvedQuestions() {
        return solvedQuestions;
    }

    public void setSolvedQuestions(int solvedQuestions) {
        this.solvedQuestions = solvedQuestions;
    }

    public int getCompletionPercentage() {
        return completionPercentage;
    }

    public void setCompletionPercentage(int completionPercentage) {
        this.completionPercentage = completionPercentage;
    }
}
