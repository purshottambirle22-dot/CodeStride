package com.codestride.catalog.controller;

import com.codestride.catalog.dto.PatternResponse;
import com.codestride.catalog.dto.TopicRequest;
import com.codestride.catalog.dto.TopicResponse;
import com.codestride.catalog.service.TopicService;
import com.codestride.user.entity.User;
import com.codestride.user.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/topics")
public class TopicController {

    private final TopicService topicService;
    private final UserRepository userRepository;

    public TopicController(TopicService topicService, UserRepository userRepository) {
        this.topicService = topicService;
        this.userRepository = userRepository;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public TopicResponse createTopic(@Valid @RequestBody TopicRequest request) {
        return topicService.createTopic(request);
    }

    @GetMapping
    public List<TopicResponse> getAllTopics(
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "true") Boolean activeOnly,
            Authentication authentication
    ) {
        String userId = extractUserId(authentication);
        return topicService.getAllTopics(search, activeOnly, userId);
    }

    @GetMapping("/{id}")
    public TopicResponse getTopicById(@PathVariable String id, Authentication authentication) {
        String userId = extractUserId(authentication);
        return topicService.getTopicById(id, userId);
    }

    @GetMapping("/slug/{slug}")
    public TopicResponse getTopicBySlug(@PathVariable String slug, Authentication authentication) {
        String userId = extractUserId(authentication);
        return topicService.getTopicBySlug(slug, userId);
    }

    @GetMapping("/{id}/patterns")
    public List<PatternResponse> getPatternsByTopicId(@PathVariable String id, Authentication authentication) {
        String userId = extractUserId(authentication);
        return topicService.getPatternsByTopicId(id, userId);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public TopicResponse updateTopic(
            @PathVariable String id,
            @Valid @RequestBody TopicRequest request) {
        return topicService.updateTopic(id, request);
    }

    @PatchMapping("/{id}/toggle-active")
    @PreAuthorize("hasRole('ADMIN')")
    public TopicResponse toggleTopicActive(@PathVariable String id) {
        return topicService.toggleTopicActive(id);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteTopic(@PathVariable String id) {
        topicService.deleteTopic(id);
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
