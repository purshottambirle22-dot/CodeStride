
package com.codestride.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class QuestionRequest {

    @NotBlank(message = "Pattern ID is required")
    private String patternId;

    @NotBlank(message = "Question title is required")
    @Size(max = 200, message = "Title cannot exceed 200 characters")
    private String title;

    @NotBlank(message = "Difficulty is required")
    @Pattern(
            regexp = "EASY|MEDIUM|HARD",
            message = "Difficulty must be EASY, MEDIUM, or HARD"
    )
    private String difficulty;

    @NotBlank(message = "External URL is required")
    @Size(max = 500, message = "URL cannot exceed 500 characters")
    private String externalUrl;

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
    }

    public String getExternalUrl() {
        return externalUrl;
    }

    public void setExternalUrl(String externalUrl) {
        this.externalUrl = externalUrl;
    }
}

