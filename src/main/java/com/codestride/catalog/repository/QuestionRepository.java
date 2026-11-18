package com.codestride.catalog.repository;

import com.codestride.catalog.entity.Question;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface QuestionRepository extends MongoRepository<Question, String> {

    List<Question> findByPatternIdAndActiveTrue(String patternId);

    List<Question> findByActiveTrue();

    List<Question> findByPatternId(String patternId);

    List<Question> findByDifficultyAndActiveTrue(String difficulty);

    List<Question> findByPatternIdInAndActiveTrue(List<String> patternIds);

    long countByPatternId(String patternId);
}
