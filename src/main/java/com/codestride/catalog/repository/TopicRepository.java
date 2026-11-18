package com.codestride.catalog.repository;

import com.codestride.catalog.entity.Topic;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface TopicRepository extends MongoRepository<Topic, String> {

    Optional<Topic> findBySlug(String slug);

    boolean existsBySlug(String slug);

    List<Topic> findAllByOrderByDisplayOrderAsc();

    List<Topic> findByActiveTrueOrderByDisplayOrderAsc();

    List<Topic> findByNameContainingIgnoreCase(String name);
}
