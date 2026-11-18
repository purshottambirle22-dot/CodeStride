package com.codestride.scoring.service;

import com.codestride.scoring.entity.PointsLedger;
import com.codestride.scoring.repository.PointsLedgerRepository;
import org.springframework.stereotype.Service;
import com.codestride.progress.repository.QuestionProgressRepository;
import com.codestride.scoring.dto.PointsSummaryResponse;

import java.util.List;

@Service
public class PointsService {
    private final PointsLedgerRepository pointsLedgerRepository;
    private final QuestionProgressRepository questionProgressRepository;

    public PointsService(
            PointsLedgerRepository pointsLedgerRepository,
            QuestionProgressRepository questionProgressRepository
    ) {
        this.pointsLedgerRepository = pointsLedgerRepository;
        this.questionProgressRepository = questionProgressRepository;
    }

    public int getPointsForDifficulty(String difficulty) {
        return switch (difficulty) {
            case "EASY" -> 10;
            case "MEDIUM" -> 20;
            case "HARD" -> 30;
            default -> throw new IllegalArgumentException(
                    "Invalid difficulty: " + difficulty);
        };
    }

    public int getTotalPoints(String userId) {
        List<PointsLedger> entries =
                pointsLedgerRepository.findByUserId(userId);

        return entries.stream()
                .mapToInt(PointsLedger::getPoints)
                .sum();
    }
    public PointsSummaryResponse getMySummary(String userId) {

        int totalPoints = getTotalPoints(userId);

        long solvedQuestions =
                questionProgressRepository.countByUserIdAndStatus(
                        userId, "SOLVED");

        long attemptedQuestions =
                questionProgressRepository.countByUserId(userId);

        return new PointsSummaryResponse(
                totalPoints,
                solvedQuestions,
                attemptedQuestions
        );
    }
}
