
package com.codestride.progress.controller;

import com.codestride.progress.dto.QuestionProgressResponse;
import com.codestride.progress.dto.UpdateProgressRequest;
import com.codestride.progress.service.QuestionProgressService;
import com.codestride.user.entity.User;
import com.codestride.user.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class QuestionProgressController {

    private final QuestionProgressService progressService;
    private final UserRepository userRepository;

    public QuestionProgressController(
            QuestionProgressService progressService,
            UserRepository userRepository
    ) {
        this.progressService = progressService;
        this.userRepository = userRepository;
    }

    @PutMapping("/questions/{questionId}/progress")
    public ResponseEntity<QuestionProgressResponse> updateProgress(
            @PathVariable String questionId,
            @Valid @RequestBody UpdateProgressRequest request,
            Authentication authentication
    ) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        QuestionProgressResponse response =
                progressService.updateProgress(
                        user.getId(), questionId, request);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/progress/me")
    public ResponseEntity<List<QuestionProgressResponse>> getMyProgress(
            Authentication authentication
    ) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        return ResponseEntity.ok(
                progressService.getMyProgress(user.getId()));
    }

    @PutMapping("/questions/{questionId}/bookmark")
    public ResponseEntity<QuestionProgressResponse> toggleBookmark(
            @PathVariable String questionId,
            Authentication authentication
    ) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return ResponseEntity.ok(progressService.toggleBookmark(user.getId(), questionId));
    }

    @PutMapping("/questions/{questionId}/revision")
    public ResponseEntity<QuestionProgressResponse> toggleRevision(
            @PathVariable String questionId,
            Authentication authentication
    ) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return ResponseEntity.ok(progressService.toggleRevision(user.getId(), questionId));
    }

    @PutMapping("/questions/{questionId}/notes")
    public ResponseEntity<QuestionProgressResponse> updateNotes(
            @PathVariable String questionId,
            @RequestBody java.util.Map<String, String> body,
            Authentication authentication
    ) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String notes = body != null ? body.get("notes") : "";
        return ResponseEntity.ok(progressService.updateNotes(user.getId(), questionId, notes));
    }

    @DeleteMapping("/questions/{questionId}/progress")
    public ResponseEntity<QuestionProgressResponse> resetProgress(
            @PathVariable String questionId,
            Authentication authentication
    ) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return ResponseEntity.ok(progressService.resetProgress(user.getId(), questionId));
    }

    @GetMapping("/progress/bookmarks")
    public ResponseEntity<List<QuestionProgressResponse>> getBookmarks(
            Authentication authentication
    ) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return ResponseEntity.ok(progressService.getBookmarks(user.getId()));
    }

    @GetMapping("/progress/revisions")
    public ResponseEntity<List<QuestionProgressResponse>> getRevisions(
            Authentication authentication
    ) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return ResponseEntity.ok(progressService.getRevisions(user.getId()));
    }
}

