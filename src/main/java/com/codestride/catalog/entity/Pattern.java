package com.codestride.catalog.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "patterns")
public class Pattern {

    @Id
    private String id;

    private String topicId;

    private String name;

    @Indexed(unique = true)
    private String slug;

    private String description;

    private String detailedExplanation;

    private String whenToUse;

    private String howToRecognize;

    private String basicApproach;

    private String timeComplexityOverview;

    private String spaceComplexityOverview;

    private List<String> relatedTopicIds = new ArrayList<>();

    private int displayOrder = 0;

    private boolean active = true;

    private Instant createdAt = Instant.now();

    private Instant updatedAt = Instant.now();

    public Pattern() {
    }

    public Pattern(String topicId, String name, String slug, String description,
                   String detailedExplanation, String whenToUse, String howToRecognize,
                   String basicApproach, String timeComplexityOverview, String spaceComplexityOverview,
                   List<String> relatedTopicIds, int displayOrder) {
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
        if (relatedTopicIds != null) {
            this.relatedTopicIds = relatedTopicIds;
        }
        this.displayOrder = displayOrder;
        this.active = true;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
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
        this.relatedTopicIds = relatedTopicIds != null ? relatedTopicIds : new ArrayList<>();
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
}
