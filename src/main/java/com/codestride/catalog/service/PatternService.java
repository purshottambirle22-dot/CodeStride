package com.codestride.catalog.service;

import com.codestride.catalog.dto.PatternRequest;
import com.codestride.catalog.dto.PatternResponse;
import com.codestride.catalog.dto.QuestionResponse;
import com.codestride.catalog.entity.Pattern;
import com.codestride.catalog.entity.Question;
import com.codestride.catalog.entity.Topic;
import com.codestride.catalog.repository.PatternRepository;
import com.codestride.catalog.repository.QuestionRepository;
import com.codestride.catalog.repository.TopicRepository;
import com.codestride.progress.entity.QuestionProgress;
import com.codestride.progress.repository.QuestionProgressRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PatternService {

    private final PatternRepository patternRepository;
    private final TopicRepository topicRepository;
    private final QuestionRepository questionRepository;
    private final QuestionProgressRepository progressRepository;

    public PatternService(
            PatternRepository patternRepository,
            TopicRepository topicRepository,
            QuestionRepository questionRepository,
            QuestionProgressRepository progressRepository
    ) {
        this.patternRepository = patternRepository;
        this.topicRepository = topicRepository;
        this.questionRepository = questionRepository;
        this.progressRepository = progressRepository;
    }

    public PatternResponse createPattern(PatternRequest request) {
        String topicId = request.getTopicId().trim();

        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new com.codestride.common.exception.ResourceNotFoundException("Primary topic not found with id: " + topicId));

        if (!topic.isActive()) {
            throw new IllegalArgumentException("Cannot assign pattern to an inactive topic");
        }

        String name = request.getName().trim();
        String slug = request.getSlug().trim().toLowerCase();

        if (patternRepository.existsBySlug(slug)) {
            throw new IllegalArgumentException("Pattern slug already exists: " + slug);
        }

        Pattern pattern = new Pattern();
        pattern.setTopicId(topicId);
        pattern.setName(name);
        pattern.setSlug(slug);
        pattern.setDescription(request.getDescription() != null ? request.getDescription().trim() : "");
        pattern.setDetailedExplanation(request.getDetailedExplanation() != null ? request.getDetailedExplanation().trim() : "");
        pattern.setWhenToUse(request.getWhenToUse() != null ? request.getWhenToUse().trim() : "");
        pattern.setHowToRecognize(request.getHowToRecognize() != null ? request.getHowToRecognize().trim() : "");
        pattern.setBasicApproach(request.getBasicApproach() != null ? request.getBasicApproach().trim() : "");
        pattern.setTimeComplexityOverview(request.getTimeComplexityOverview() != null ? request.getTimeComplexityOverview().trim() : "O(N)");
        pattern.setSpaceComplexityOverview(request.getSpaceComplexityOverview() != null ? request.getSpaceComplexityOverview().trim() : "O(1)");
        pattern.setRelatedTopicIds(request.getRelatedTopicIds() != null ? request.getRelatedTopicIds() : new ArrayList<>());
        pattern.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0);
        pattern.setActive(request.getActive() != null ? request.getActive() : true);
        pattern.setCreatedAt(Instant.now());
        pattern.setUpdatedAt(Instant.now());

        Pattern saved = patternRepository.save(pattern);
        return toResponseWithStats(saved, topic, null);
    }

    public List<PatternResponse> getAllPatterns() {
        return getPatterns(null, null, null, true, null);
    }

    public List<PatternResponse> getPatterns(String topicId, String search, String difficulty, Boolean activeOnly, String userId) {
        List<Pattern> patterns = patternRepository.findAllByOrderByDisplayOrderAsc();

        if (Boolean.TRUE.equals(activeOnly)) {
            patterns = patterns.stream().filter(Pattern::isActive).toList();
        }

        if (topicId != null && !topicId.isBlank() && !"ALL".equalsIgnoreCase(topicId)) {
            String tid = topicId.trim();
            patterns = patterns.stream()
                    .filter(p -> tid.equals(p.getTopicId()) || (p.getRelatedTopicIds() != null && p.getRelatedTopicIds().contains(tid)))
                    .toList();
        }

        if (search != null && !search.isBlank()) {
            String q = search.trim().toLowerCase();
            patterns = patterns.stream()
                    .filter(p -> (p.getName() != null && p.getName().toLowerCase().contains(q))
                            || (p.getDescription() != null && p.getDescription().toLowerCase().contains(q)))
                    .toList();
        }

        Map<String, Topic> topicsMap = topicRepository.findAll().stream()
                .collect(Collectors.toMap(Topic::getId, t -> t, (t1, t2) -> t1));

        Map<String, List<Question>> questionsByPattern = questionRepository.findAll().stream()
                .filter(Question::isActive)
                .collect(Collectors.groupingBy(Question::getPatternId));

        Set<String> solvedQuestionIds = getSolvedQuestionIds(userId);

        List<PatternResponse> responseList = patterns.stream()
                .map(p -> {
                    Topic topic = topicsMap.get(p.getTopicId());
                    List<Question> qList = questionsByPattern.getOrDefault(p.getId(), Collections.emptyList());

                    int totalQ = qList.size();
                    int solvedQ = (int) qList.stream().filter(q -> solvedQuestionIds.contains(q.getId())).count();
                    int easy = (int) qList.stream().filter(q -> "EASY".equalsIgnoreCase(q.getDifficulty())).count();
                    int med = (int) qList.stream().filter(q -> "MEDIUM".equalsIgnoreCase(q.getDifficulty())).count();
                    int hard = (int) qList.stream().filter(q -> "HARD".equalsIgnoreCase(q.getDifficulty())).count();
                    int pct = totalQ == 0 ? 0 : (int) Math.round(((double) solvedQ / totalQ) * 100);

                    return new PatternResponse(
                            p.getId(),
                            p.getTopicId(),
                            p.getName(),
                            p.getSlug(),
                            p.getDescription(),
                            p.getDetailedExplanation(),
                            p.getWhenToUse(),
                            p.getHowToRecognize(),
                            p.getBasicApproach(),
                            p.getTimeComplexityOverview(),
                            p.getSpaceComplexityOverview(),
                            p.getRelatedTopicIds(),
                            p.getDisplayOrder(),
                            p.isActive(),
                            p.getCreatedAt(),
                            p.getUpdatedAt() != null ? p.getUpdatedAt() : p.getCreatedAt(),
                            topic != null ? topic.getName() : "General",
                            topic != null ? topic.getSlug() : "general",
                            totalQ,
                            solvedQ,
                            pct,
                            easy,
                            med,
                            hard
                    );
                })
                .toList();

        if (difficulty != null && !difficulty.isBlank() && !"ALL".equalsIgnoreCase(difficulty)) {
            String diffUpper = difficulty.trim().toUpperCase();
            responseList = responseList.stream().filter(p -> switch (diffUpper) {
                case "EASY" -> p.getEasyCount() > 0;
                case "MEDIUM" -> p.getMediumCount() > 0;
                case "HARD" -> p.getHardCount() > 0;
                default -> true;
            }).toList();
        }

        return responseList;
    }

    public List<PatternResponse> getPatternsByTopic(String topicId) {
        return getPatterns(topicId, null, null, true, null);
    }

    public PatternResponse getPatternById(String id) {
        return getPatternById(id, null);
    }

    public PatternResponse getPatternById(String id, String userId) {
        com.codestride.common.util.IdValidator.validateId(id, "Pattern");
        Pattern pattern = patternRepository.findById(id)
                .orElseThrow(() -> new com.codestride.common.exception.ResourceNotFoundException("Pattern not found with id: " + id));
        Topic topic = topicRepository.findById(pattern.getTopicId()).orElse(null);
        return toResponseWithStats(pattern, topic, userId);
    }

    public PatternResponse getPatternBySlug(String slug, String userId) {
        Pattern pattern = patternRepository.findBySlug(slug.trim().toLowerCase())
                .orElseThrow(() -> new com.codestride.common.exception.ResourceNotFoundException("Pattern not found with slug: " + slug));
        Topic topic = topicRepository.findById(pattern.getTopicId()).orElse(null);
        return toResponseWithStats(pattern, topic, userId);
    }

    public List<QuestionResponse> getQuestionsByPattern(String patternId, String userId) {
        com.codestride.common.util.IdValidator.validateId(patternId, "Pattern");
        Pattern pattern = patternRepository.findById(patternId)
                .orElseThrow(() -> new com.codestride.common.exception.ResourceNotFoundException("Pattern not found with id: " + patternId));

        Topic topic = topicRepository.findById(pattern.getTopicId()).orElse(null);
        String topicName = topic != null ? topic.getName() : "General";

        List<Question> questions = questionRepository.findByPatternIdAndActiveTrue(patternId);

        Map<String, QuestionProgress> userProgressMap = new HashMap<>();
        if (userId != null && !userId.isBlank()) {
            progressRepository.findByUserId(userId)
                    .forEach(prog -> userProgressMap.put(prog.getQuestionId(), prog));
        }

        return questions.stream()
                .map(q -> {
                    QuestionProgress p = userProgressMap.get(q.getId());
                    String status = p != null && p.getStatus() != null ? p.getStatus() : "NOT_STARTED";
                    boolean bookmarked = p != null && p.isBookmarked();
                    String notes = p != null ? p.getNotes() : null;

                    return new QuestionResponse(
                            q.getId(),
                            q.getPatternId(),
                            q.getTitle(),
                            q.getDifficulty(),
                            q.getExternalUrl(),
                            q.isActive(),
                            q.getCreatedAt(),
                            status,
                            bookmarked,
                            notes,
                            pattern.getName(),
                            topicName
                    );
                })
                .toList();
    }

    public PatternResponse updatePattern(String id, PatternRequest request) {
        com.codestride.common.util.IdValidator.validateId(id, "Pattern");
        Pattern pattern = patternRepository.findById(id)
                .orElseThrow(() -> new com.codestride.common.exception.ResourceNotFoundException("Pattern not found with id: " + id));

        if (request.getTopicId() != null && !request.getTopicId().isBlank()) {
            Topic topic = topicRepository.findById(request.getTopicId().trim())
                    .orElseThrow(() -> new com.codestride.common.exception.ResourceNotFoundException("Topic not found"));
            pattern.setTopicId(topic.getId());
        }
        if (request.getName() != null && !request.getName().isBlank()) {
            pattern.setName(request.getName().trim());
        }
        if (request.getSlug() != null && !request.getSlug().isBlank()) {
            String newSlug = request.getSlug().trim().toLowerCase();
            if (!newSlug.equals(pattern.getSlug()) && patternRepository.existsBySlug(newSlug)) {
                throw new IllegalArgumentException("Pattern slug already exists: " + newSlug);
            }
            pattern.setSlug(newSlug);
        }
        if (request.getDescription() != null) {
            pattern.setDescription(request.getDescription().trim());
        }
        if (request.getDetailedExplanation() != null) {
            pattern.setDetailedExplanation(request.getDetailedExplanation().trim());
        }
        if (request.getWhenToUse() != null) {
            pattern.setWhenToUse(request.getWhenToUse().trim());
        }
        if (request.getHowToRecognize() != null) {
            pattern.setHowToRecognize(request.getHowToRecognize().trim());
        }
        if (request.getBasicApproach() != null) {
            pattern.setBasicApproach(request.getBasicApproach().trim());
        }
        if (request.getTimeComplexityOverview() != null) {
            pattern.setTimeComplexityOverview(request.getTimeComplexityOverview().trim());
        }
        if (request.getSpaceComplexityOverview() != null) {
            pattern.setSpaceComplexityOverview(request.getSpaceComplexityOverview().trim());
        }
        if (request.getRelatedTopicIds() != null) {
            pattern.setRelatedTopicIds(request.getRelatedTopicIds());
        }
        if (request.getDisplayOrder() != null) {
            pattern.setDisplayOrder(request.getDisplayOrder());
        }
        if (request.getActive() != null) {
            pattern.setActive(request.getActive());
        }
        pattern.setUpdatedAt(Instant.now());

        Pattern saved = patternRepository.save(pattern);
        Topic topic = topicRepository.findById(saved.getTopicId()).orElse(null);
        return toResponseWithStats(saved, topic, null);
    }

    public PatternResponse togglePatternActive(String id) {
        com.codestride.common.util.IdValidator.validateId(id, "Pattern");
        Pattern pattern = patternRepository.findById(id)
                .orElseThrow(() -> new com.codestride.common.exception.ResourceNotFoundException("Pattern not found with id: " + id));
        pattern.setActive(!pattern.isActive());
        pattern.setUpdatedAt(Instant.now());
        Topic topic = topicRepository.findById(pattern.getTopicId()).orElse(null);
        return toResponseWithStats(patternRepository.save(pattern), topic, null);
    }

    public void deletePattern(String id) {
        com.codestride.common.util.IdValidator.validateId(id, "Pattern");
        Pattern pattern = patternRepository.findById(id)
                .orElseThrow(() -> new com.codestride.common.exception.ResourceNotFoundException("Pattern not found with id: " + id));

        long questionCount = questionRepository.countByPatternId(id);
        if (questionCount > 0) {
            throw new IllegalStateException(
                    "Cannot delete pattern '" + pattern.getName() + "': "
                            + questionCount + " question(s) are associated with this pattern. Please reassign or delete associated questions first, or deactivate the pattern."
            );
        }

        patternRepository.deleteById(id);
    }

    private PatternResponse toResponseWithStats(Pattern pattern, Topic topic, String userId) {
        List<Question> questions = questionRepository.findByPatternIdAndActiveTrue(pattern.getId());
        int totalQuestions = questions.size();

        Set<String> solvedQuestionIds = getSolvedQuestionIds(userId);
        int solved = (int) questions.stream().filter(q -> solvedQuestionIds.contains(q.getId())).count();
        int easy = (int) questions.stream().filter(q -> "EASY".equalsIgnoreCase(q.getDifficulty())).count();
        int med = (int) questions.stream().filter(q -> "MEDIUM".equalsIgnoreCase(q.getDifficulty())).count();
        int hard = (int) questions.stream().filter(q -> "HARD".equalsIgnoreCase(q.getDifficulty())).count();
        int pct = totalQuestions == 0 ? 0 : (int) Math.round(((double) solved / totalQuestions) * 100);

        return new PatternResponse(
                pattern.getId(),
                pattern.getTopicId(),
                pattern.getName(),
                pattern.getSlug(),
                pattern.getDescription(),
                pattern.getDetailedExplanation(),
                pattern.getWhenToUse(),
                pattern.getHowToRecognize(),
                pattern.getBasicApproach(),
                pattern.getTimeComplexityOverview(),
                pattern.getSpaceComplexityOverview(),
                pattern.getRelatedTopicIds(),
                pattern.getDisplayOrder(),
                pattern.isActive(),
                pattern.getCreatedAt(),
                pattern.getUpdatedAt() != null ? pattern.getUpdatedAt() : pattern.getCreatedAt(),
                topic != null ? topic.getName() : "General",
                topic != null ? topic.getSlug() : "general",
                totalQuestions,
                solved,
                pct,
                easy,
                med,
                hard
        );
    }

    private Set<String> getSolvedQuestionIds(String userId) {
        if (userId == null || userId.isBlank()) {
            return Collections.emptySet();
        }
        return progressRepository.findByUserId(userId).stream()
                .filter(p -> "SOLVED".equalsIgnoreCase(p.getStatus()))
                .map(QuestionProgress::getQuestionId)
                .collect(Collectors.toSet());
    }
}
