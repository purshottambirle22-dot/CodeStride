package com.codestride.catalog.repository;

import com.codestride.catalog.entity.Pattern;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface PatternRepository extends MongoRepository<Pattern, String> {

    Optional<Pattern> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<Pattern> findByTopicIdAndActiveTrue(String topicId);

    List<Pattern> findByTopicId(String topicId);

    List<Pattern> findByActiveTrue();

    List<Pattern> findByActiveTrueOrderByDisplayOrderAsc();

    List<Pattern> findAllByOrderByDisplayOrderAsc();

    long countByTopicId(String topicId);

    @Query("{ '$or': [ { 'topicId': ?0 }, { 'relatedTopicIds': ?0 } ], 'active': true }")
    List<Pattern> findByTopicAssociationActive(String topicId);

    List<Pattern> findByNameContainingIgnoreCase(String name);
}
