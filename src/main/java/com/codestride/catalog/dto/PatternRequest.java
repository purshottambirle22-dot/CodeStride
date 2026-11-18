package com.codestride.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.ArrayList;
import java.util.List;

public class PatternRequest {

    @NotBlank(message = "Topic ID is required")
    private String topicId;

    @NotBlank(message = "Pattern name is required")
    @Size(max = 100, message = "Pattern name cannot exceed 100 characters")
    private String name;

    @NotBlank(message = "Pattern slug is required")
    @Size(max = 100, message = "Pattern slug cannot exceed 100 characters")
    private String slug;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    private String detailedExplanation;

    private String whenToUse;

    private String howToRecognize;

    private String basicApproach;

    private String timeComplexityOverview;

    private String spaceComplexityOverview;

    private List<String> relatedTopicIds = new ArrayList<>();

    private Integer displayOrder;

    private Boolean active;

    public PatternRequest() {
    }

    public PatternRequest(String topicId, String name, String slug, String description) {
        this.topicId = topicId;
        this.name = name;
        this.slug = slug;
        this.description = description;
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
        this.relatedTopicIds = relatedTopicIds != null ? relatedTopicIds : new ArrayList<>();
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
