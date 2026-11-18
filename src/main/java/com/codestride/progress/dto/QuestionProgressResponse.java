
package com.codestride.progress.dto;

import java.time.Instant;

public class QuestionProgressResponse {

    private String id;
    private String questionId;
    private String status;
    private Instant firstAttemptedAt;
    private Instant solvedAt;
    private Instant updatedAt;
    private boolean bookmarked;
    private boolean revisionNeeded;
    private String notes;
    private Instant lastAttemptedAt;

    public QuestionProgressResponse(
            String id,
            String questionId,
            String status,
            Instant firstAttemptedAt,
            Instant solvedAt,
            Instant updatedAt
    ) {
        this(id, questionId, status, firstAttemptedAt, solvedAt, updatedAt, false, false, null, null);
    }

    public QuestionProgressResponse(
            String id,
            String questionId,
            String status,
            Instant firstAttemptedAt,
            Instant solvedAt,
            Instant updatedAt,
            boolean bookmarked,
            boolean revisionNeeded,
            String notes,
            Instant lastAttemptedAt
    ) {
        this.id = id;
        this.questionId = questionId;
        this.status = status;
        this.firstAttemptedAt = firstAttemptedAt;
        this.solvedAt = solvedAt;
        this.updatedAt = updatedAt;
        this.bookmarked = bookmarked;
        this.revisionNeeded = revisionNeeded;
        this.notes = notes;
        this.lastAttemptedAt = lastAttemptedAt;
    }

    public String getId() {
        return id;
    }

    public String getQuestionId() {
        return questionId;
    }

    public String getStatus() {
        return status;
    }

    public Instant getFirstAttemptedAt() {
        return firstAttemptedAt;
    }

    public Instant getSolvedAt() {
        return solvedAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public boolean isBookmarked() {
        return bookmarked;
    }

    public boolean isRevisionNeeded() {
        return revisionNeeded;
    }

    public String getNotes() {
        return notes;
    }

    public Instant getLastAttemptedAt() {
        return lastAttemptedAt;
    }
}

