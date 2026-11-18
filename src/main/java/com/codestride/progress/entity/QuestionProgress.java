
package com.codestride.progress.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "question_progress")
@CompoundIndexes({
        @CompoundIndex(
                name = "user_question_unique",
                def = "{'userId': 1, 'questionId': 1}",
                unique = true
        )
})
public class QuestionProgress {

    @Id
    private String id;

    private String userId;

    private String questionId;

    private String status;

    private Instant firstAttemptedAt;

    private Instant solvedAt;

    private Instant updatedAt = Instant.now();
    private boolean bookmarked = false;
    private boolean revisionNeeded = false;
    private String notes;
    private Instant lastAttemptedAt;

    public QuestionProgress() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getQuestionId() {
        return questionId;
    }

    public void setQuestionId(String questionId) {
        this.questionId = questionId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getFirstAttemptedAt() {
        return firstAttemptedAt;
    }

    public void setFirstAttemptedAt(Instant firstAttemptedAt) {
        this.firstAttemptedAt = firstAttemptedAt;
    }

    public Instant getSolvedAt() {
        return solvedAt;
    }

    public void setSolvedAt(Instant solvedAt) {
        this.solvedAt = solvedAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public boolean isBookmarked() {
        return bookmarked;
    }

    public void setBookmarked(boolean bookmarked) {
        this.bookmarked = bookmarked;
    }

    public boolean isRevisionNeeded() {
        return revisionNeeded;
    }

    public void setRevisionNeeded(boolean revisionNeeded) {
        this.revisionNeeded = revisionNeeded;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Instant getLastAttemptedAt() {
        return lastAttemptedAt;
    }

    public void setLastAttemptedAt(Instant lastAttemptedAt) {
        this.lastAttemptedAt = lastAttemptedAt;
    }
}

