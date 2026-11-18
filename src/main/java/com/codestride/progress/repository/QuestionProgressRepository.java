
package com.codestride.progress.repository;

import com.codestride.progress.entity.QuestionProgress;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface QuestionProgressRepository
        extends MongoRepository<QuestionProgress, String> {

    Optional<QuestionProgress> findByUserIdAndQuestionId(
            String userId,
            String questionId
    );

    List<QuestionProgress> findByUserId(String userId);


    long countByUserIdAndStatus(
            String userId,
            String status
    );

    long countByUserId(String userId);

    List<QuestionProgress> findByUserIdAndBookmarkedTrue(String userId);

    List<QuestionProgress> findByUserIdAndRevisionNeededTrue(String userId);
}
