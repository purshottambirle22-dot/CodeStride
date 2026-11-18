
package com.codestride.progress.service;

import com.codestride.catalog.entity.Question;
import com.codestride.catalog.repository.QuestionRepository;
import com.codestride.progress.dto.QuestionProgressResponse;
import com.codestride.progress.dto.UpdateProgressRequest;
import com.codestride.progress.entity.QuestionProgress;
import com.codestride.progress.repository.QuestionProgressRepository;
import org.springframework.stereotype.Service;
import com.codestride.scoring.entity.PointsLedger;
import com.codestride.scoring.repository.PointsLedgerRepository;
import com.codestride.scoring.service.PointsService;


import java.time.Instant;
import java.util.List;

@Service
public class QuestionProgressService {

    private final QuestionProgressRepository progressRepository;
    private final QuestionRepository questionRepository;
    private final PointsService pointsService;
    private final PointsLedgerRepository pointsLedgerRepository;

    public QuestionProgressService(
            QuestionProgressRepository progressRepository,
            QuestionRepository questionRepository,
            PointsService pointsService,
            PointsLedgerRepository pointsLedgerRepository
    ) {
        this.progressRepository = progressRepository;
        this.questionRepository = questionRepository;
        this.pointsService = pointsService;
        this.pointsLedgerRepository = pointsLedgerRepository;
    }

    public QuestionProgressResponse updateProgress(
            String userId,
            String questionId,
            UpdateProgressRequest request
    ) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Question not found"));

        if (!question.isActive()) {
            throw new IllegalArgumentException("Question is inactive");
        }

        Instant now = Instant.now();

        QuestionProgress progress = progressRepository
                .findByUserIdAndQuestionId(userId, questionId)
                .orElseGet(() -> {
                    QuestionProgress newProgress = new QuestionProgress();
                    newProgress.setUserId(userId);
                    newProgress.setQuestionId(questionId);
                    newProgress.setFirstAttemptedAt(now);
                    return newProgress;
                });

        String newStatus = request.getStatus();

        String previousStatus = progress.getStatus();


        progress.setStatus(newStatus);

        if ("SOLVED".equals(newStatus)) {
            if (progress.getSolvedAt() == null) {
                progress.setSolvedAt(now);
            }

            boolean firstTimeSolved =
                    !"SOLVED".equals(previousStatus);

            boolean pointsAlreadyAwarded =
                    pointsLedgerRepository.existsByUserIdAndQuestionId(
                            userId, questionId);

            if (firstTimeSolved && !pointsAlreadyAwarded) {
                int points = pointsService.getPointsForDifficulty(
                        question.getDifficulty());

                PointsLedger ledger = new PointsLedger();
                ledger.setUserId(userId);
                ledger.setQuestionId(questionId);
                ledger.setDifficulty(question.getDifficulty());
                ledger.setPoints(points);
                ledger.setAwardedAt(now);

                pointsLedgerRepository.save(ledger);
            }
        }

        progress.setLastAttemptedAt(now);
        progress.setUpdatedAt(now);

        QuestionProgress saved = progressRepository.save(progress);

        return toResponse(saved);
    }

    public QuestionProgressResponse toggleBookmark(String userId, String questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));

        Instant now = Instant.now();
        QuestionProgress progress = progressRepository
                .findByUserIdAndQuestionId(userId, questionId)
                .orElseGet(() -> {
                    QuestionProgress p = new QuestionProgress();
                    p.setUserId(userId);
                    p.setQuestionId(questionId);
                    p.setFirstAttemptedAt(now);
                    return p;
                });

        progress.setBookmarked(!progress.isBookmarked());
        progress.setUpdatedAt(now);
        return toResponse(progressRepository.save(progress));
    }

    public QuestionProgressResponse toggleRevision(String userId, String questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));

        Instant now = Instant.now();
        QuestionProgress progress = progressRepository
                .findByUserIdAndQuestionId(userId, questionId)
                .orElseGet(() -> {
                    QuestionProgress p = new QuestionProgress();
                    p.setUserId(userId);
                    p.setQuestionId(questionId);
                    p.setFirstAttemptedAt(now);
                    return p;
                });

        progress.setRevisionNeeded(!progress.isRevisionNeeded());
        progress.setUpdatedAt(now);
        return toResponse(progressRepository.save(progress));
    }

    public QuestionProgressResponse updateNotes(String userId, String questionId, String notes) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));

        Instant now = Instant.now();
        QuestionProgress progress = progressRepository
                .findByUserIdAndQuestionId(userId, questionId)
                .orElseGet(() -> {
                    QuestionProgress p = new QuestionProgress();
                    p.setUserId(userId);
                    p.setQuestionId(questionId);
                    p.setFirstAttemptedAt(now);
                    return p;
                });

        progress.setNotes(notes);
        progress.setUpdatedAt(now);
        return toResponse(progressRepository.save(progress));
    }

    public QuestionProgressResponse resetProgress(String userId, String questionId) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));

        Instant now = Instant.now();
        QuestionProgress progress = progressRepository
                .findByUserIdAndQuestionId(userId, questionId)
                .orElseGet(() -> {
                    QuestionProgress p = new QuestionProgress();
                    p.setUserId(userId);
                    p.setQuestionId(questionId);
                    p.setFirstAttemptedAt(now);
                    return p;
                });

        progress.setStatus(null);
        progress.setUpdatedAt(now);
        return toResponse(progressRepository.save(progress));
    }

    public List<QuestionProgressResponse> getMyProgress(String userId) {
        return progressRepository.findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<QuestionProgressResponse> getBookmarks(String userId) {
        return progressRepository.findByUserIdAndBookmarkedTrue(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<QuestionProgressResponse> getRevisions(String userId) {
        return progressRepository.findByUserIdAndRevisionNeededTrue(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private QuestionProgressResponse toResponse(
            QuestionProgress progress
    ) {
        return new QuestionProgressResponse(
                progress.getId(),
                progress.getQuestionId(),
                progress.getStatus(),
                progress.getFirstAttemptedAt(),
                progress.getSolvedAt(),
                progress.getUpdatedAt(),
                progress.isBookmarked(),
                progress.isRevisionNeeded(),
                progress.getNotes(),
                progress.getLastAttemptedAt()
        );
    }
}
