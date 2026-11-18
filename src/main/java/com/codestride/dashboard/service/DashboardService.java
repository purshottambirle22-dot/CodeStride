package com.codestride.dashboard.service;

import com.codestride.dashboard.dto.DashboardResponse;
import com.codestride.leaderboard.dto.LeaderboardResponse;
import com.codestride.leaderboard.service.LeaderboardService;
import com.codestride.scoring.dto.PointsSummaryResponse;
import com.codestride.scoring.service.PointsService;
import com.codestride.user.dto.UserResponse;
import com.codestride.user.entity.User;
import com.codestride.user.repository.UserRepository;
import com.codestride.user.service.UserService;
import com.codestride.scoring.entity.PointsLedger;
import com.codestride.scoring.repository.PointsLedgerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final UserService userService;
    private final PointsService pointsService;
    private final LeaderboardService leaderboardService;
    private final PointsLedgerRepository pointsLedgerRepository;

    public DashboardService(
            UserRepository userRepository,
            UserService userService,
            PointsService pointsService,
            LeaderboardService leaderboardService
    ) {
        this(userRepository, userService, pointsService, leaderboardService, null);
    }

    @Autowired
    public DashboardService(
            UserRepository userRepository,
            UserService userService,
            PointsService pointsService,
            LeaderboardService leaderboardService,
            @Autowired(required = false) PointsLedgerRepository pointsLedgerRepository
    ) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.pointsService = pointsService;
        this.leaderboardService = leaderboardService;
        this.pointsLedgerRepository = pointsLedgerRepository;
    }

    public DashboardResponse getDashboard(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserResponse profile = userService.getProfile(email);
        PointsSummaryResponse points =
                pointsService.getMySummary(user.getId());
        LeaderboardResponse leaderboard =
                leaderboardService.getMyRank(user.getId());

        List<PointsLedger> entries = pointsLedgerRepository != null
                ? pointsLedgerRepository.findByUserId(user.getId())
                : List.of();

        long easyCount = entries.stream().filter(e -> "EASY".equalsIgnoreCase(e.getDifficulty())).count();
        long medCount = entries.stream().filter(e -> "MEDIUM".equalsIgnoreCase(e.getDifficulty())).count();
        long hardCount = entries.stream().filter(e -> "HARD".equalsIgnoreCase(e.getDifficulty())).count();

        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        int todayCount = (int) entries.stream()
                .filter(e -> e.getAwardedAt() != null && e.getAwardedAt().atZone(ZoneOffset.UTC).toLocalDate().equals(today))
                .count();

        Set<LocalDate> activeDates = entries.stream()
                .filter(e -> e.getAwardedAt() != null)
                .map(e -> e.getAwardedAt().atZone(ZoneOffset.UTC).toLocalDate())
                .collect(Collectors.toSet());

        int streak = 0;
        LocalDate checkDate = today;
        if (!activeDates.contains(checkDate)) {
            checkDate = today.minusDays(1);
        }
        while (activeDates.contains(checkDate)) {
            streak++;
            checkDate = checkDate.minusDays(1);
        }

        Map<String, Integer> weeklyActivity = new LinkedHashMap<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            int countOnDate = (int) entries.stream()
                    .filter(e -> e.getAwardedAt() != null && e.getAwardedAt().atZone(ZoneOffset.UTC).toLocalDate().equals(d))
                    .count();
            weeklyActivity.put(d.toString(), countOnDate);
        }

        return new DashboardResponse(
                profile,
                points,
                leaderboard,
                streak,
                todayCount,
                easyCount,
                medCount,
                hardCount,
                weeklyActivity
        );
    }
}
