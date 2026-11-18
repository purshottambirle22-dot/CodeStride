package com.codestride.catalog.dto;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class PatternResponse {

    private String id;
    private String topicId;
    private String name;
    private String slug;
    private String description;
    private String detailedExplanation;
    private String whenToUse;
    private String howToRecognize;
    private String basicApproach;
    private String timeComplexityOverview;
    private String spaceComplexityOverview;
    private List<String> relatedTopicIds = new ArrayList<>();
    private int displayOrder;
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;

    // Derived statistics and context
    private String topicName;
    private String topicSlug;
    private int questionCount;
    private int solvedCount;
    private int completionPercentage;
    private int easyCount;
    private int mediumCount;
    private int hardCount;

    public PatternResponse() {
    }

    public PatternResponse(
            String id,
            String topicId,
            String name,
            String slug,
            String description,
            boolean active,
            Instant createdAt
    ) {
        this.id = id;
        this.topicId = topicId;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = createdAt;
    }

    public PatternResponse(
            String id,
            String topicId,
            String name,
            String slug,
            String description,
            String detailedExplanation,
            String whenToUse,
            String howToRecognize,
            String basicApproach,
            String timeComplexityOverview,
            String spaceComplexityOverview,
            List<String> relatedTopicIds,
            int displayOrder,
            boolean active,
            Instant createdAt,
            Instant updatedAt,
            String topicName,
            String topicSlug,
            int questionCount,
            int solvedCount,
            int completionPercentage,
            int easyCount,
            int mediumCount,
            int hardCount
    ) {
        this.id = id;
        this.topicId = topicId;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.detailedExplanation = detailedExplanation;
        this.whenToUse = whenToUse;
        this.howToRecognize = howToRecognize;
        this.basicApproach = basicApproach;
        this.timeComplexityOverview = timeComplexityOverview;
        this.spaceComplexityOverview = spaceComplexityOverview;
        this.relatedTopicIds = relatedTopicIds != null ? relatedTopicIds : new ArrayList<>();
        this.displayOrder = displayOrder;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.topicName = topicName;
        this.topicSlug = topicSlug;
        this.questionCount = questionCount;
        this.solvedCount = solvedCount;
        this.completionPercentage = completionPercentage;
        this.easyCount = easyCount;
        this.mediumCount = mediumCount;
        this.hardCount = hardCount;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTopicId() {
        return topicId;
    }

    public void setTopicId(String topicId) {
        this.topicId = topicId;
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

    public String getDetailedExplanation() {
        return detailedExplanation;
    }

    public void setDetailedExplanation(String detailedExplanation) {
        this.detailedExplanation = detailedExplanation;
    }

    public String getWhenToUse() {
        return whenToUse;
    }

    public void setWhenToUse(String whenToUse) {
        this.whenToUse = whenToUse;
    }

    public String getHowToRecognize() {
        return howToRecognize;
    }

    public void setHowToRecognize(String howToRecognize) {
        this.howToRecognize = howToRecognize;
    }

    public String getBasicApproach() {
        return basicApproach;
    }

    public void setBasicApproach(String basicApproach) {
        this.basicApproach = basicApproach;
    }

    public String getTimeComplexityOverview() {
        return timeComplexityOverview;
    }

    public void setTimeComplexityOverview(String timeComplexityOverview) {
        this.timeComplexityOverview = timeComplexityOverview;
    }

    public String getSpaceComplexityOverview() {
        return spaceComplexityOverview;
    }

    public void setSpaceComplexityOverview(String spaceComplexityOverview) {
        this.spaceComplexityOverview = spaceComplexityOverview;
    }

    public List<String> getRelatedTopicIds() {
        return relatedTopicIds;
    }

    public void setRelatedTopicIds(List<String> relatedTopicIds) {
        this.relatedTopicIds = relatedTopicIds;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(int displayOrder) {
        this.displayOrder = displayOrder;
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

    public String getTopicName() {
        return topicName;
    }

    public void setTopicName(String topicName) {
        this.topicName = topicName;
    }

    public String getTopicSlug() {
        return topicSlug;
    }

    public void setTopicSlug(String topicSlug) {
        this.topicSlug = topicSlug;
    }

    public int getQuestionCount() {
        return questionCount;
    }

    public void setQuestionCount(int questionCount) {
        this.questionCount = questionCount;
    }

    public int getSolvedCount() {
        return solvedCount;
    }

    public void setSolvedCount(int solvedCount) {
        this.solvedCount = solvedCount;
    }

    public int getCompletionPercentage() {
        return completionPercentage;
    }

    public void setCompletionPercentage(int completionPercentage) {
        this.completionPercentage = completionPercentage;
    }

    public int getEasyCount() {
        return easyCount;
    }

    public void setEasyCount(int easyCount) {
        this.easyCount = easyCount;
    }

    public int getMediumCount() {
        return mediumCount;
    }

    public void setMediumCount(int mediumCount) {
        this.mediumCount = mediumCount;
    }

    public int getHardCount() {
        return hardCount;
    }

    public void setHardCount(int hardCount) {
        this.hardCount = hardCount;
    }
}
