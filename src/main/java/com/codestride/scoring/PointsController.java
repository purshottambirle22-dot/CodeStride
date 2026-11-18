package com.codestride.scoring;

import com.codestride.scoring.dto.PointsSummaryResponse;
import com.codestride.scoring.service.PointsService;
import com.codestride.user.entity.User;
import com.codestride.user.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;



@RestController
@RequestMapping("/api/v1/points")
public class PointsController {
    private final PointsService pointsService;
    private final UserRepository userRepository;

    public PointsController(
            PointsService pointsService,
            UserRepository userRepository
    ) {
        this.pointsService = pointsService;
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<Integer> getMyPoints(
            Authentication authentication
    ) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        int totalPoints = pointsService.getTotalPoints(user.getId());

        return ResponseEntity.ok(totalPoints);
    }
    @GetMapping("/summary")
    public PointsSummaryResponse getMySummary(Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return pointsService.getMySummary(user.getId());
    }
}
