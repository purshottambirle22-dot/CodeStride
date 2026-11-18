package com.codestride.leaderboard.service;

import com.codestride.leaderboard.dto.LeaderboardResponse;
import com.codestride.scoring.entity.PointsLedger;
import com.codestride.scoring.repository.PointsLedgerRepository;
import com.codestride.user.entity.User;
import com.codestride.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import com.codestride.leaderboard.dto.LeaderboardPageResponse;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class LeaderboardService {
    private final PointsLedgerRepository pointsLedgerRepository;
    private final UserRepository userRepository;

    public LeaderboardService(
            PointsLedgerRepository pointsLedgerRepository,
            UserRepository userRepository
    ) {
        this.pointsLedgerRepository = pointsLedgerRepository;
        this.userRepository = userRepository;
    }

    public List<LeaderboardResponse> getLeaderboard() {

        List<PointsLedger> entries =
                pointsLedgerRepository.findAll();

        Map<String, Integer> pointsByUser = entries.stream()
                .collect(Collectors.groupingBy(
                        PointsLedger::getUserId,
                        Collectors.summingInt(PointsLedger::getPoints)
                ));

        List<User> users = userRepository.findAll();

        List<LeaderboardResponse> leaderboard = new ArrayList<>();

        for (User user : users) {
            int totalPoints = pointsByUser.getOrDefault(
                    user.getId(), 0);

            leaderboard.add(new LeaderboardResponse(
                    0,
                    user.getId(),
                    user.getUsername(),
                    totalPoints
            ));
        }

        leaderboard.sort(
                Comparator.comparingInt(
                                LeaderboardResponse::getTotalPoints
                        ).reversed()
                        .thenComparing(
                                LeaderboardResponse::getUsername,
                                String.CASE_INSENSITIVE_ORDER
                        )
        );

        List<LeaderboardResponse> rankedLeaderboard =
                new ArrayList<>();

        int rank = 1;
        int previousPoints = -1;

        for (int i = 0; i < leaderboard.size(); i++) {
            LeaderboardResponse entry = leaderboard.get(i);

            if (i > 0 &&
                    entry.getTotalPoints() != previousPoints) {
                rank = i + 1;
            }

            rankedLeaderboard.add(new LeaderboardResponse(
                    rank,
                    entry.getUserId(),
                    entry.getUsername(),
                    entry.getTotalPoints()
            ));

            previousPoints = entry.getTotalPoints();
        }

        return rankedLeaderboard;

    }

        public LeaderboardPageResponse getLeaderboardPage(int page, int size) {

        if (page < 0) {
            throw new IllegalArgumentException(
                    "Page must be zero or greater");
        }

        if (size < 1 || size > 100) {
            throw new IllegalArgumentException(
                    "Page size must be between 1 and 100");
        }

        List<LeaderboardResponse> allEntries = getLeaderboard();

        int totalElements = allEntries.size();

        int totalPages = (int) Math.ceil(
                (double) totalElements / size);

        int start = page * size;

        List<LeaderboardResponse> content;

        if (start >= totalElements) {
            content = List.of();
        } else {
            int end = Math.min(start + size, totalElements);
            content = allEntries.subList(start, end);
        }

        return new LeaderboardPageResponse(
                content,
                page,
                size,
                totalElements,
                totalPages
        );
    }
    public LeaderboardResponse getMyRank(String userId) {

        return getLeaderboard()
                .stream()
                .filter(entry -> entry.getUserId().equals(userId))
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException("User not found in leaderboard"));
    }
}
