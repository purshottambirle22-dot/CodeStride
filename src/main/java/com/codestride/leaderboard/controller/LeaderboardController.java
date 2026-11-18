package com.codestride.leaderboard.controller;

import com.codestride.leaderboard.dto.LeaderboardResponse;
import com.codestride.leaderboard.service.LeaderboardService;
import com.codestride.user.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.codestride.user.entity.User;

import org.springframework.security.core.Authentication;

import com.codestride.leaderboard.dto.LeaderboardPageResponse;
import org.springframework.web.bind.annotation.RequestParam;


import java.util.List;

@RestController
@RequestMapping("/api/v1/leaderboard")
public class LeaderboardController {
    private final LeaderboardService leaderboardService;
    private final UserRepository userRepository;
    public LeaderboardController(
            LeaderboardService leaderboardService,
            UserRepository userRepository
    ) {
        this.leaderboardService = leaderboardService;
        this.userRepository = userRepository;
    }


    @GetMapping
    public ResponseEntity<LeaderboardPageResponse> getLeaderboard(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(
                leaderboardService.getLeaderboardPage(page, size));
    }
    @GetMapping("/me")
    public LeaderboardResponse getMyRank(Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return leaderboardService.getMyRank(user.getId());
    }
}
