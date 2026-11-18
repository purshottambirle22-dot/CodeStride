package com.codestride.catalog.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "topics")
public class Topic {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String slug;

    private String description;

    private String detailedLearningDescription;

    private int displayOrder = 0;

    private String icon = "layers";

    private boolean active = true;

    private Instant createdAt = Instant.now();

    private Instant updatedAt = Instant.now();

    public Topic() {
    }

    public Topic(String name, String slug, String description, String detailedLearningDescription, int displayOrder, String icon) {
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.detailedLearningDescription = detailedLearningDescription;
        this.displayOrder = displayOrder;
        this.icon = icon;
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
}
