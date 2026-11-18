package com.codestride.catalog;

import com.codestride.catalog.dto.PatternRequest;
import com.codestride.catalog.dto.PatternResponse;
import com.codestride.catalog.dto.QuestionResponse;
import com.codestride.catalog.dto.TopicRequest;
import com.codestride.catalog.dto.TopicResponse;
import com.codestride.catalog.entity.Pattern;
import com.codestride.catalog.entity.Question;
import com.codestride.catalog.entity.Topic;
import com.codestride.catalog.repository.PatternRepository;
import com.codestride.catalog.repository.QuestionRepository;
import com.codestride.catalog.repository.TopicRepository;
import com.codestride.catalog.service.PatternService;
import com.codestride.catalog.service.TopicService;
import com.codestride.progress.entity.QuestionProgress;
import com.codestride.progress.repository.QuestionProgressRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TopicPatternServiceTest {

    @Mock
    private TopicRepository topicRepository;

    @Mock
    private PatternRepository patternRepository;

    @Mock
    private QuestionRepository questionRepository;

    @Mock
    private QuestionProgressRepository progressRepository;

    private TopicService topicService;
    private PatternService patternService;

    @BeforeEach
    void setUp() {
        topicService = new TopicService(topicRepository, patternRepository, questionRepository, progressRepository);
        patternService = new PatternService(patternRepository, topicRepository, questionRepository, progressRepository);
    }

    @Test
    void testCreateTopic_Success() {
        TopicRequest req = new TopicRequest();
        req.setName("Dynamic Programming");
        req.setSlug("dynamic-programming");
        req.setDescription("Subproblem optimization");
        req.setDisplayOrder(18);
        req.setIcon("cpu");

        when(topicRepository.existsBySlug("dynamic-programming")).thenReturn(false);
        when(topicRepository.save(any(Topic.class))).thenAnswer(inv -> {
            Topic t = inv.getArgument(0);
            t.setId("topic-1");
            return t;
        });

        TopicResponse response = topicService.createTopic(req);

        assertNotNull(response);
        assertEquals("topic-1", response.getId());
        assertEquals("Dynamic Programming", response.getName());
        assertEquals("dynamic-programming", response.getSlug());
        assertEquals(18, response.getDisplayOrder());
    }

    @Test
    void testCreateTopic_DuplicateSlugThrowsException() {
        TopicRequest req = new TopicRequest();
        req.setName("Arrays");
        req.setSlug("arrays");

        when(topicRepository.existsBySlug("arrays")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> topicService.createTopic(req));
        verify(topicRepository, never()).save(any());
    }

    @Test
    void testDeleteTopic_SafeDeletionBlocksIfPatternsExist() {
        Topic topic = new Topic();
        topic.setId("t1");
        topic.setName("Graphs");

        when(topicRepository.findById("t1")).thenReturn(Optional.of(topic));
        when(patternRepository.countByTopicId("t1")).thenReturn(5L);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> topicService.deleteTopic("t1"));
        assertTrue(ex.getMessage().contains("5 pattern(s) are associated"));
        verify(topicRepository, never()).deleteById(anyString());
    }

    @Test
    void testDeleteTopic_SuccessWhenNoPatternsExist() {
        Topic topic = new Topic();
        topic.setId("t1");
        topic.setName("Unused Topic");

        when(topicRepository.findById("t1")).thenReturn(Optional.of(topic));
        when(patternRepository.countByTopicId("t1")).thenReturn(0L);

        topicService.deleteTopic("t1");
        verify(topicRepository, times(1)).deleteById("t1");
    }

    @Test
    void testCreatePattern_Success() {
        Topic topic = new Topic();
        topic.setId("top-1");
        topic.setName("Sliding Window");
        topic.setActive(true);

        when(topicRepository.findById("top-1")).thenReturn(Optional.of(topic));
        when(patternRepository.existsBySlug("variable-window")).thenReturn(false);
        when(patternRepository.save(any(Pattern.class))).thenAnswer(inv -> {
            Pattern p = inv.getArgument(0);
            p.setId("pat-1");
            return p;
        });

        PatternRequest req = new PatternRequest();
        req.setTopicId("top-1");
        req.setName("Variable Window");
        req.setSlug("variable-window");
        req.setWhenToUse("When window bounds change dynamically");

        PatternResponse response = patternService.createPattern(req);

        assertNotNull(response);
        assertEquals("pat-1", response.getId());
        assertEquals("Variable Window", response.getName());
        assertEquals("Sliding Window", response.getTopicName());
    }

    @Test
    void testDeletePattern_SafeDeletionBlocksIfQuestionsExist() {
        Pattern pattern = new Pattern();
        pattern.setId("pat-1");
        pattern.setName("Kadane");

        when(patternRepository.findById("pat-1")).thenReturn(Optional.of(pattern));
        when(questionRepository.countByPatternId("pat-1")).thenReturn(3L);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> patternService.deletePattern("pat-1"));
        assertTrue(ex.getMessage().contains("3 question(s) are associated"));
        verify(patternRepository, never()).deleteById(anyString());
    }

    @Test
    void testGetQuestionsByPattern_AttachesUserProgress() {
        Pattern pattern = new Pattern();
        pattern.setId("pat-1");
        pattern.setTopicId("top-1");
        pattern.setName("Two Pointers");

        Topic topic = new Topic();
        topic.setId("top-1");
        topic.setName("Two Pointers");

        Question q1 = new Question();
        q1.setId("q1");
        q1.setPatternId("pat-1");
        q1.setTitle("Valid Palindrome");
        q1.setDifficulty("EASY");
        q1.setActive(true);

        QuestionProgress prog = new QuestionProgress();
        prog.setQuestionId("q1");
        prog.setUserId("user-1");
        prog.setStatus("SOLVED");
        prog.setBookmarked(true);

        when(patternRepository.findById("pat-1")).thenReturn(Optional.of(pattern));
        when(topicRepository.findById("top-1")).thenReturn(Optional.of(topic));
        when(questionRepository.findByPatternIdAndActiveTrue("pat-1")).thenReturn(List.of(q1));
        when(progressRepository.findByUserId("user-1")).thenReturn(List.of(prog));

        List<QuestionResponse> questions = patternService.getQuestionsByPattern("pat-1", "user-1");

        assertEquals(1, questions.size());
        QuestionResponse qr = questions.get(0);
        assertEquals("q1", qr.getId());
        assertEquals("SOLVED", qr.getStatus());
        assertTrue(qr.isBookmarked());
        assertEquals("Two Pointers", qr.getPatternName());
        assertEquals(10, qr.getPoints());
    }
}
