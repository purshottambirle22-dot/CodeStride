package com.codestride.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class TopicRequest {

    @NotBlank(message = "Topic name is required")
    @Size(max = 100, message = "Topic name cannot exceed 100 characters")
    private String name;

    @NotBlank(message = "Topic slug is required")
    @Size(max = 100, message = "Topic slug cannot exceed 100 characters")
    private String slug;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    private String detailedLearningDescription;

    private Integer displayOrder;

    private String icon;

    private Boolean active;

    public TopicRequest() {
    }

    public TopicRequest(String name, String slug, String description) {
        this.name = name;
        this.slug = slug;
        this.description = description;
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

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
