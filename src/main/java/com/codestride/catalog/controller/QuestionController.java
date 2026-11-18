
package com.codestride.catalog.controller;

import com.codestride.catalog.dto.QuestionRequest;
import com.codestride.catalog.dto.QuestionResponse;
import com.codestride.catalog.service.QuestionService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @PostMapping("/questions")
    @PreAuthorize("hasRole('ADMIN')")
    public QuestionResponse createQuestion(
            @Valid @RequestBody QuestionRequest request) {
        return questionService.createQuestion(request);
    }

    @GetMapping("/questions")
    public List<QuestionResponse> getAllQuestions(
            @RequestParam(required = false) String patternId,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String search) {
        return questionService.getAllQuestions(patternId, difficulty, search);
    }

    @GetMapping("/questions/{id}")
    public QuestionResponse getQuestionById(@PathVariable String id) {
        return questionService.getQuestionById(id);
    }

    @PutMapping("/questions/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public QuestionResponse updateQuestion(
            @PathVariable String id,
            @Valid @RequestBody QuestionRequest request) {
        return questionService.updateQuestion(id, request);
    }

    @DeleteMapping("/questions/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteQuestion(@PathVariable String id) {
        questionService.deleteQuestion(id);
    }

    @PatchMapping("/questions/{id}/toggle-active")
    @PreAuthorize("hasRole('ADMIN')")
    public QuestionResponse toggleQuestionActive(@PathVariable String id) {
        return questionService.toggleQuestionActive(id);
    }
}
