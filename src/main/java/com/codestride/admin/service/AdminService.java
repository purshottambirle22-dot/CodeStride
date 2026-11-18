package com.codestride.admin.service;

import com.codestride.admin.dto.AdminStatsResponse;
import com.codestride.admin.dto.AdminUserResponse;
import com.codestride.catalog.repository.PatternRepository;
import com.codestride.catalog.repository.QuestionRepository;
import com.codestride.catalog.repository.TopicRepository;
import com.codestride.catalog.seed.CatalogDatabaseInitializer;
import com.codestride.progress.repository.QuestionProgressRepository;
import com.codestride.scoring.entity.PointsLedger;
import com.codestride.scoring.repository.PointsLedgerRepository;
import com.codestride.user.entity.User;
import com.codestride.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;
    private final TopicRepository topicRepository;
    private final PatternRepository patternRepository;
    private final QuestionProgressRepository progressRepository;
    private final PointsLedgerRepository pointsLedgerRepository;
    private final CatalogDatabaseInitializer catalogInitializer;

    public AdminService(
            UserRepository userRepository,
            QuestionRepository questionRepository,
            TopicRepository topicRepository,
            PatternRepository patternRepository,
            QuestionProgressRepository progressRepository,
            PointsLedgerRepository pointsLedgerRepository,
            CatalogDatabaseInitializer catalogInitializer
    ) {
        this.userRepository = userRepository;
        this.questionRepository = questionRepository;
        this.topicRepository = topicRepository;
        this.patternRepository = patternRepository;
        this.progressRepository = progressRepository;
        this.pointsLedgerRepository = pointsLedgerRepository;
        this.catalogInitializer = catalogInitializer;
    }

    public AdminStatsResponse getStats() {
        long totalUsers = userRepository.count();
        long totalQuestions = questionRepository.count();
        long totalTopics = topicRepository.count();
        long totalPatterns = patternRepository.count();
        long totalSubmissions = progressRepository.count();

        long totalPoints = pointsLedgerRepository.findAll().stream()
                .mapToLong(PointsLedger::getPoints)
                .sum();

        return new AdminStatsResponse(
                totalUsers,
                totalQuestions,
                totalTopics,
                totalPatterns,
                totalSubmissions,
                totalPoints
        );
    }

    public List<AdminUserResponse> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<PointsLedger> pointsEntries = pointsLedgerRepository.findAll();

        Map<String, Integer> userPoints = pointsEntries.stream()
                .collect(Collectors.groupingBy(
                        PointsLedger::getUserId,
                        Collectors.summingInt(PointsLedger::getPoints)
                ));

        List<AdminUserResponse> result = new ArrayList<>();
        for (User u : users) {
            int points = userPoints.getOrDefault(u.getId(), 0);
            long solved = progressRepository.countByUserIdAndStatus(u.getId(), "SOLVED");

            result.add(new AdminUserResponse(
                    u.getId(),
                    u.getUsername(),
                    u.getEmail(),
                    u.getRole(),
                    u.getTheme(),
                    u.getCreatedAt(),
                    points,
                    solved
            ));
        }

        return result;
    }

    public AdminUserResponse updateUserRole(String userId, String newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        if (!"USER".equalsIgnoreCase(newRole) && !"ADMIN".equalsIgnoreCase(newRole)) {
            throw new IllegalArgumentException("Role must be USER or ADMIN");
        }

        user.setRole(newRole.toUpperCase());
        User saved = userRepository.save(user);

        int points = pointsLedgerRepository.findByUserId(saved.getId()).stream()
                .mapToInt(PointsLedger::getPoints)
                .sum();
        long solved = progressRepository.countByUserIdAndStatus(saved.getId(), "SOLVED");

        return new AdminUserResponse(
                saved.getId(),
                saved.getUsername(),
                saved.getEmail(),
                saved.getRole(),
                saved.getTheme(),
                saved.getCreatedAt(),
                points,
                solved
        );
    }

    public void deleteUser(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found with id: " + userId);
        }
        userRepository.deleteById(userId);
    }

    public Map<String, Object> seedCatalogIfEmpty() {
        return catalogInitializer.seedCatalog();
    }
}
