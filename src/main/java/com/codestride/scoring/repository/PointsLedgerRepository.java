package com.codestride.scoring.repository;

import com.codestride.scoring.entity.PointsLedger;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PointsLedgerRepository extends MongoRepository<PointsLedger, String> {

    boolean existsByUserIdAndQuestionId(
            String userId,
            String questionId
    );

    List<PointsLedger> findByUserId(String userId);

    int countByUserId(String userId);
}
