package com.codestride.admin.controller;

import com.codestride.catalog.dto.PatternRequest;
import com.codestride.catalog.dto.PatternResponse;
import com.codestride.catalog.dto.TopicRequest;
import com.codestride.catalog.dto.TopicResponse;
import com.codestride.catalog.service.PatternService;
import com.codestride.catalog.service.TopicService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCatalogController {

    private final TopicService topicService;
    private final PatternService patternService;

    public AdminCatalogController(TopicService topicService, PatternService patternService) {
        this.topicService = topicService;
        this.patternService = patternService;
    }

    // Topics Admin APIs
    @PostMapping("/topics")
    public TopicResponse createTopic(@Valid @RequestBody TopicRequest request) {
        return topicService.createTopic(request);
    }

    @PutMapping("/topics/{id}")
    public TopicResponse updateTopic(
            @PathVariable String id,
            @Valid @RequestBody TopicRequest request
    ) {
        return topicService.updateTopic(id, request);
    }

    @PatchMapping("/topics/{id}/toggle-active")
    public TopicResponse toggleTopicActive(@PathVariable String id) {
        return topicService.toggleTopicActive(id);
    }

    @DeleteMapping("/topics/{id}")
    public Map<String, String> deleteTopic(@PathVariable String id) {
        topicService.deleteTopic(id);
        return Map.of("message", "Topic deleted successfully");
    }

    // Patterns Admin APIs
    @PostMapping("/patterns")
    public PatternResponse createPattern(@Valid @RequestBody PatternRequest request) {
        return patternService.createPattern(request);
    }

    @PutMapping("/patterns/{id}")
    public PatternResponse updatePattern(
            @PathVariable String id,
            @Valid @RequestBody PatternRequest request
    ) {
        return patternService.updatePattern(id, request);
    }

    @PatchMapping("/patterns/{id}/toggle-active")
    public PatternResponse togglePatternActive(@PathVariable String id) {
        return patternService.togglePatternActive(id);
    }

    @DeleteMapping("/patterns/{id}")
    public Map<String, String> deletePattern(@PathVariable String id) {
        patternService.deletePattern(id);
        return Map.of("message", "Pattern deleted successfully");
    }
}
