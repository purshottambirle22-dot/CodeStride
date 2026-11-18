package com.codestride.catalog.service;

import com.codestride.catalog.dto.PatternResponse;
import com.codestride.catalog.dto.TopicRequest;
import com.codestride.catalog.dto.TopicResponse;
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
public class TopicService {

    private final TopicRepository topicRepository;
    private final PatternRepository patternRepository;
    private final QuestionRepository questionRepository;
    private final QuestionProgressRepository progressRepository;

    public TopicService(
            TopicRepository topicRepository,
            PatternRepository patternRepository,
            QuestionRepository questionRepository,
            QuestionProgressRepository progressRepository
    ) {
        this.topicRepository = topicRepository;
        this.patternRepository = patternRepository;
        this.questionRepository = questionRepository;
        this.progressRepository = progressRepository;
    }

    public TopicResponse createTopic(TopicRequest request) {
        String name = request.getName().trim();
        String slug = request.getSlug().trim().toLowerCase();

        if (topicRepository.existsBySlug(slug)) {
            throw new IllegalArgumentException("Topic slug already exists: " + slug);
        }

        Topic topic = new Topic();
        topic.setName(name);
        topic.setSlug(slug);
        topic.setDescription(request.getDescription() != null ? request.getDescription().trim() : "");
        topic.setDetailedLearningDescription(
                request.getDetailedLearningDescription() != null
                        ? request.getDetailedLearningDescription().trim()
                        : ""
        );
        topic.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0);
        topic.setIcon(request.getIcon() != null && !request.getIcon().isBlank() ? request.getIcon().trim() : "layers");
        topic.setActive(request.getActive() != null ? request.getActive() : true);
        topic.setCreatedAt(Instant.now());
        topic.setUpdatedAt(Instant.now());

        Topic saved = topicRepository.save(topic);
        return toResponse(saved, null);
    }

    public List<TopicResponse> getAllTopics() {
        return getAllTopics(null, true, null);
    }

    public List<TopicResponse> getAllTopics(String search, Boolean activeOnly, String userId) {
        List<Topic> topics = topicRepository.findAllByOrderByDisplayOrderAsc();

        if (Boolean.TRUE.equals(activeOnly)) {
            topics = topics.stream().filter(Topic::isActive).toList();
        }

        if (search != null && !search.isBlank()) {
            String q = search.trim().toLowerCase();
            topics = topics.stream()
                    .filter(t -> (t.getName() != null && t.getName().toLowerCase().contains(q))
                            || (t.getDescription() != null && t.getDescription().toLowerCase().contains(q)))
                    .toList();
        }

        // Cache user solved question IDs for fast in-memory derivation
        Set<String> solvedQuestionIds = getSolvedQuestionIds(userId);

        // Preload all active questions and patterns for fast grouped calculations
        List<Pattern> allPatterns = patternRepository.findAll();
        List<Question> allQuestions = questionRepository.findAll();

        Map<String, List<Pattern>> patternsByTopic = new HashMap<>();
        for (Pattern p : allPatterns) {
            patternsByTopic.computeIfAbsent(p.getTopicId(), k -> new ArrayList<>()).add(p);
            if (p.getRelatedTopicIds() != null) {
                for (String relId : p.getRelatedTopicIds()) {
                    if (!relId.equals(p.getTopicId())) {
                        patternsByTopic.computeIfAbsent(relId, k -> new ArrayList<>()).add(p);
                    }
                }
            }
        }

        Map<String, List<Question>> questionsByPattern = allQuestions.stream()
                .filter(Question::isActive)
                .collect(Collectors.groupingBy(Question::getPatternId));

        return topics.stream()
                .map(t -> buildTopicResponse(t, patternsByTopic.getOrDefault(t.getId(), Collections.emptyList()), questionsByPattern, solvedQuestionIds))
                .toList();
    }

    public TopicResponse getTopicById(String id) {
        return getTopicById(id, null);
    }

    public TopicResponse getTopicById(String id, String userId) {
        com.codestride.common.util.IdValidator.validateId(id, "Topic");
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new com.codestride.common.exception.ResourceNotFoundException("Topic not found with id: " + id));
        return toResponseWithStats(topic, userId);
    }

    public TopicResponse getTopicBySlug(String slug, String userId) {
        Topic topic = topicRepository.findBySlug(slug.trim().toLowerCase())
                .orElseThrow(() -> new com.codestride.common.exception.ResourceNotFoundException("Topic not found with slug: " + slug));
        return toResponseWithStats(topic, userId);
    }

    public List<PatternResponse> getPatternsByTopicId(String topicId, String userId) {
        com.codestride.common.util.IdValidator.validateId(topicId, "Topic");
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new com.codestride.common.exception.ResourceNotFoundException("Topic not found with id: " + topicId));

        List<Pattern> patterns = patternRepository.findByTopicAssociationActive(topic.getId());
        Set<String> solvedQuestionIds = getSolvedQuestionIds(userId);

        Map<String, List<Question>> questionsByPattern = questionRepository.findByActiveTrue().stream()
                .collect(Collectors.groupingBy(Question::getPatternId));

        return patterns.stream()
                .map(p -> {
                    List<Question> pQuestions = questionsByPattern.getOrDefault(p.getId(), Collections.emptyList());
                    int totalQ = pQuestions.size();
                    int solvedQ = (int) pQuestions.stream().filter(q -> solvedQuestionIds.contains(q.getId())).count();
                    int easy = (int) pQuestions.stream().filter(q -> "EASY".equalsIgnoreCase(q.getDifficulty())).count();
                    int med = (int) pQuestions.stream().filter(q -> "MEDIUM".equalsIgnoreCase(q.getDifficulty())).count();
                    int hard = (int) pQuestions.stream().filter(q -> "HARD".equalsIgnoreCase(q.getDifficulty())).count();
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
                            p.getUpdatedAt(),
                            topic.getName(),
                            topic.getSlug(),
                            totalQ,
                            solvedQ,
                            pct,
                            easy,
                            med,
                            hard
                    );
                })
                .sorted(Comparator.comparingInt(PatternResponse::getDisplayOrder))
                .toList();
    }

    public TopicResponse updateTopic(String id, TopicRequest request) {
        com.codestride.common.util.IdValidator.validateId(id, "Topic");
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new com.codestride.common.exception.ResourceNotFoundException("Topic not found with id: " + id));

        if (request.getName() != null && !request.getName().isBlank()) {
            topic.setName(request.getName().trim());
        }
        if (request.getSlug() != null && !request.getSlug().isBlank()) {
            String newSlug = request.getSlug().trim().toLowerCase();
            if (!newSlug.equals(topic.getSlug()) && topicRepository.existsBySlug(newSlug)) {
                throw new IllegalArgumentException("Topic slug already exists: " + newSlug);
            }
            topic.setSlug(newSlug);
        }
        if (request.getDescription() != null) {
            topic.setDescription(request.getDescription().trim());
        }
        if (request.getDetailedLearningDescription() != null) {
            topic.setDetailedLearningDescription(request.getDetailedLearningDescription().trim());
        }
        if (request.getDisplayOrder() != null) {
            topic.setDisplayOrder(request.getDisplayOrder());
        }
        if (request.getIcon() != null && !request.getIcon().isBlank()) {
            topic.setIcon(request.getIcon().trim());
        }
        if (request.getActive() != null) {
            topic.setActive(request.getActive());
        }
        topic.setUpdatedAt(Instant.now());

        Topic saved = topicRepository.save(topic);
        return toResponseWithStats(saved, null);
    }

    public TopicResponse toggleTopicActive(String id) {
        com.codestride.common.util.IdValidator.validateId(id, "Topic");
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new com.codestride.common.exception.ResourceNotFoundException("Topic not found with id: " + id));
        topic.setActive(!topic.isActive());
        topic.setUpdatedAt(Instant.now());
        return toResponseWithStats(topicRepository.save(topic), null);
    }

    public void deleteTopic(String id) {
        com.codestride.common.util.IdValidator.validateId(id, "Topic");
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new com.codestride.common.exception.ResourceNotFoundException("Topic not found with id: " + id));

        long patternCount = patternRepository.countByTopicId(id);
        if (patternCount > 0) {
            throw new IllegalStateException(
                    "Cannot delete topic '" + topic.getName() + "': "
                            + patternCount + " pattern(s) are associated with this topic. Please reassign or delete associated patterns first, or deactivate the topic."
            );
        }

        topicRepository.deleteById(id);
    }

    // Helper: calculate single topic response with derived statistics
    private TopicResponse toResponseWithStats(Topic topic, String userId) {
        List<Pattern> associatedPatterns = patternRepository.findByTopicAssociationActive(topic.getId());
        List<String> patternIds = associatedPatterns.stream().map(Pattern::getId).toList();

        List<Question> questions = questionRepository.findByPatternIdInAndActiveTrue(patternIds);
        int totalQuestions = questions.size();

        Set<String> solvedQuestionIds = getSolvedQuestionIds(userId);
        int solved = 0;
        if (!solvedQuestionIds.isEmpty() && totalQuestions > 0) {
            solved = (int) questions.stream().filter(q -> solvedQuestionIds.contains(q.getId())).count();
        }

        int percentage = totalQuestions == 0 ? 0 : (int) Math.round(((double) solved / totalQuestions) * 100);

        return new TopicResponse(
                topic.getId(),
                topic.getName(),
                topic.getSlug(),
                topic.getDescription(),
                topic.getDetailedLearningDescription(),
                topic.getDisplayOrder(),
                topic.getIcon(),
                topic.isActive(),
                topic.getCreatedAt(),
                topic.getUpdatedAt() != null ? topic.getUpdatedAt() : topic.getCreatedAt(),
                associatedPatterns.size(),
                totalQuestions,
                solved,
                percentage
        );
    }

    private TopicResponse buildTopicResponse(Topic topic, List<Pattern> patterns, Map<String, List<Question>> questionsByPattern, Set<String> solvedQuestionIds) {
        Set<String> uniqueQuestionIds = new HashSet<>();
        List<Question> topicQuestions = new ArrayList<>();

        for (Pattern p : patterns) {
            List<Question> qList = questionsByPattern.getOrDefault(p.getId(), Collections.emptyList());
            for (Question q : qList) {
                if (uniqueQuestionIds.add(q.getId())) {
                    topicQuestions.add(q);
                }
            }
        }

        int totalQ = topicQuestions.size();
        int solvedQ = 0;
        if (!solvedQuestionIds.isEmpty()) {
            solvedQ = (int) topicQuestions.stream().filter(q -> solvedQuestionIds.contains(q.getId())).count();
        }
        int pct = totalQ == 0 ? 0 : (int) Math.round(((double) solvedQ / totalQ) * 100);

        return new TopicResponse(
                topic.getId(),
                topic.getName(),
                topic.getSlug(),
                topic.getDescription(),
                topic.getDetailedLearningDescription(),
                topic.getDisplayOrder(),
                topic.getIcon(),
                topic.isActive(),
                topic.getCreatedAt(),
                topic.getUpdatedAt() != null ? topic.getUpdatedAt() : topic.getCreatedAt(),
                patterns.size(),
                totalQ,
                solvedQ,
                pct
        );
    }

    private TopicResponse toResponse(Topic topic, String userId) {
        return toResponseWithStats(topic, userId);
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
