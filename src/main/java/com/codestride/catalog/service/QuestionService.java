
package com.codestride.catalog.service;

import com.codestride.catalog.dto.QuestionRequest;
import com.codestride.catalog.dto.QuestionResponse;
import com.codestride.catalog.entity.Pattern;
import com.codestride.catalog.entity.Question;
import com.codestride.catalog.repository.PatternRepository;
import com.codestride.catalog.repository.QuestionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final PatternRepository patternRepository;

    public QuestionService(
            QuestionRepository questionRepository,
            PatternRepository patternRepository
    ) {
        this.questionRepository = questionRepository;
        this.patternRepository = patternRepository;
    }

    public QuestionResponse createQuestion(QuestionRequest request) {
        String patternId = request.getPatternId().trim();
        com.codestride.common.util.IdValidator.validateId(patternId, "Pattern");

        Pattern pattern = patternRepository.findById(patternId)
                .orElseThrow(() ->
                        new com.codestride.common.exception.ResourceNotFoundException("Pattern not found with id: " + patternId));

        if (!pattern.isActive()) {
            throw new IllegalArgumentException("Pattern is inactive");
        }

        Question question = new Question();
        question.setPatternId(patternId);
        question.setTitle(request.getTitle().trim());
        question.setDifficulty(request.getDifficulty());
        question.setExternalUrl(request.getExternalUrl().trim());

        Question savedQuestion = questionRepository.save(question);

        return toResponse(savedQuestion);
    }

    public List<QuestionResponse> getQuestionsByPattern(String patternId) {
        com.codestride.common.util.IdValidator.validateId(patternId, "Pattern");
        Pattern pattern = patternRepository.findById(patternId)
                .orElseThrow(() ->
                        new com.codestride.common.exception.ResourceNotFoundException("Pattern not found with id: " + patternId));

        if (!pattern.isActive()) {
            throw new IllegalArgumentException("Pattern is inactive");
        }

        return questionRepository
                .findByPatternIdAndActiveTrue(patternId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<QuestionResponse> getAllQuestions(String patternId, String difficulty, String search) {
        List<Question> list;
        if (patternId != null && !patternId.isBlank()) {
            list = questionRepository.findByPatternIdAndActiveTrue(patternId);
        } else if (difficulty != null && !difficulty.isBlank()) {
            list = questionRepository.findByDifficultyAndActiveTrue(difficulty.toUpperCase());
        } else {
            list = questionRepository.findByActiveTrue();
        }

        if (search != null && !search.isBlank()) {
            String lowerSearch = search.toLowerCase().trim();
            list = list.stream()
                    .filter(q -> q.getTitle().toLowerCase().contains(lowerSearch))
                    .toList();
        }

        return list.stream().map(this::toResponse).toList();
    }

    public List<QuestionResponse> getAdminAllQuestions() {
        return questionRepository.findAll().stream().map(this::toResponse).toList();
    }

    public QuestionResponse getQuestionById(String id) {
        com.codestride.common.util.IdValidator.validateId(id, "Question");
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new com.codestride.common.exception.ResourceNotFoundException("Question not found with id: " + id));
        return toResponse(question);
    }

    public QuestionResponse updateQuestion(String id, QuestionRequest request) {
        com.codestride.common.util.IdValidator.validateId(id, "Question");
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new com.codestride.common.exception.ResourceNotFoundException("Question not found with id: " + id));

        if (request.getPatternId() != null && !request.getPatternId().isBlank()) {
            String pId = request.getPatternId().trim();
            com.codestride.common.util.IdValidator.validateId(pId, "Pattern");
            Pattern pattern = patternRepository.findById(pId)
                    .orElseThrow(() -> new com.codestride.common.exception.ResourceNotFoundException("Pattern not found with id: " + pId));
            question.setPatternId(pattern.getId());
        }
        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            question.setTitle(request.getTitle().trim());
        }
        if (request.getDifficulty() != null && !request.getDifficulty().isBlank()) {
            question.setDifficulty(request.getDifficulty().toUpperCase());
        }
        if (request.getExternalUrl() != null && !request.getExternalUrl().isBlank()) {
            question.setExternalUrl(request.getExternalUrl().trim());
        }

        return toResponse(questionRepository.save(question));
    }

    public void deleteQuestion(String id) {
        com.codestride.common.util.IdValidator.validateId(id, "Question");
        if (!questionRepository.existsById(id)) {
            throw new com.codestride.common.exception.ResourceNotFoundException("Question not found with id: " + id);
        }
        questionRepository.deleteById(id);
    }

    public QuestionResponse toggleQuestionActive(String id) {
        com.codestride.common.util.IdValidator.validateId(id, "Question");
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new com.codestride.common.exception.ResourceNotFoundException("Question not found with id: " + id));
        question.setActive(!question.isActive());
        return toResponse(questionRepository.save(question));
    }

    private QuestionResponse toResponse(Question question) {
        return new QuestionResponse(
                question.getId(),
                question.getPatternId(),
                question.getTitle(),
                question.getDifficulty(),
                question.getExternalUrl(),
                question.isActive(),
                question.getCreatedAt()
        );
    }
}

