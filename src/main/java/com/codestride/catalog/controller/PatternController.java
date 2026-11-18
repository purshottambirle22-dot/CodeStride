package com.codestride.catalog.controller;

import com.codestride.catalog.dto.PatternRequest;
import com.codestride.catalog.dto.PatternResponse;
import com.codestride.catalog.dto.QuestionResponse;
import com.codestride.catalog.service.PatternService;
import com.codestride.user.entity.User;
import com.codestride.user.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class PatternController {

    private final PatternService patternService;
    private final UserRepository userRepository;

    public PatternController(PatternService patternService, UserRepository userRepository) {
        this.patternService = patternService;
        this.userRepository = userRepository;
    }

    @PostMapping("/patterns")
    @PreAuthorize("hasRole('ADMIN')")
    public PatternResponse createPattern(@Valid @RequestBody PatternRequest request) {
        return patternService.createPattern(request);
    }

    @GetMapping("/patterns")
    public List<PatternResponse> getAllPatterns(
            @RequestParam(required = false) String topicId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false, defaultValue = "true") Boolean activeOnly,
            Authentication authentication
    ) {
        String userId = extractUserId(authentication);
        return patternService.getPatterns(topicId, search, difficulty, activeOnly, userId);
    }

    @GetMapping("/patterns/{id}")
    public PatternResponse getPatternById(@PathVariable String id, Authentication authentication) {
        String userId = extractUserId(authentication);
        return patternService.getPatternById(id, userId);
    }

    @GetMapping("/patterns/slug/{slug}")
    public PatternResponse getPatternBySlug(@PathVariable String slug, Authentication authentication) {
        String userId = extractUserId(authentication);
        return patternService.getPatternBySlug(slug, userId);
    }

    @GetMapping("/patterns/{id}/questions")
    public List<QuestionResponse> getQuestionsByPattern(@PathVariable String id, Authentication authentication) {
        String userId = extractUserId(authentication);
        return patternService.getQuestionsByPattern(id, userId);
    }

    @GetMapping("/topics/{topicId}/patterns/{patternId}")
    public PatternResponse getPatternUnderTopic(
            @PathVariable String topicId,
            @PathVariable String patternId,
            Authentication authentication
    ) {
        String userId = extractUserId(authentication);
        PatternResponse pattern = patternService.getPatternById(patternId, userId);
        if (!topicId.equals(pattern.getTopicId())
                && (pattern.getRelatedTopicIds() == null || !pattern.getRelatedTopicIds().contains(topicId))) {
            throw new IllegalArgumentException("Pattern does not belong to specified topic");
        }
        return pattern;
    }

    @PutMapping("/patterns/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public PatternResponse updatePattern(
            @PathVariable String id,
            @Valid @RequestBody PatternRequest request
    ) {
        return patternService.updatePattern(id, request);
    }

    @PatchMapping("/patterns/{id}/toggle-active")
    @PreAuthorize("hasRole('ADMIN')")
    public PatternResponse togglePatternActive(@PathVariable String id) {
        return patternService.togglePatternActive(id);
    }

    @DeleteMapping("/patterns/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deletePattern(@PathVariable String id) {
        patternService.deletePattern(id);
    }

    private String extractUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName() == null) {
            return null;
        }
        try {
            return userRepository.findByEmail(authentication.getName())
                    .map(User::getId)
                    .orElse(null);
        } catch (Exception ex) {
            return null;
        }
    }
}
