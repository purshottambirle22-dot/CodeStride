package com.codestride.scoring.service;

import com.codestride.progress.repository.QuestionProgressRepository;
import com.codestride.scoring.repository.PointsLedgerRepository;
import org.junit.jupiter.api.Test;
import com.codestride.scoring.dto.PointsSummaryResponse;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;

public class PointsServiceTest {
    private final PointsLedgerRepository pointsLedgerRepository =
            mock(PointsLedgerRepository.class);

    private final QuestionProgressRepository questionProgressRepository =
            mock(QuestionProgressRepository.class);

    private final PointsService pointsService =
            new PointsService(
                    pointsLedgerRepository,
                    questionProgressRepository
            );

    @Test
    void easyQuestionShouldGive10Points() {
        int points = pointsService.getPointsForDifficulty("EASY");

        assertEquals(10, points);
    }

    @Test
    void mediumQuestionShouldGive20Points() {
        int points = pointsService.getPointsForDifficulty("MEDIUM");

        assertEquals(20, points);
    }

    @Test
    void hardQuestionShouldGive30Points() {
        int points = pointsService.getPointsForDifficulty("HARD");

        assertEquals(30, points);
    }

    @Test
    void invalidDifficultyShouldThrowException() {
        assertThrows(
                IllegalArgumentException.class,
                () -> pointsService.getPointsForDifficulty("INVALID")
        );
    }

    @Test
    void getMySummaryShouldReturnCorrectCountsAndPoints() {

        String userId = "user123";

        when(pointsLedgerRepository.findByUserId(userId))
                .thenReturn(List.of());

        when(questionProgressRepository.countByUserIdAndStatus(
                userId, "SOLVED"))
                .thenReturn(2L);

        when(questionProgressRepository.countByUserId(userId))
                .thenReturn(3L);

        PointsSummaryResponse summary =
                pointsService.getMySummary(userId);

        assertEquals(0, summary.getTotalPoints());
        assertEquals(2L, summary.getSolvedQuestions());
        assertEquals(3L, summary.getAttemptedQuestions());
    }

}
