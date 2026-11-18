package com.codestride;

import org.bson.Document;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.convert.MappingMongoConverter;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.codestride.config.TestMongoConfig;
import org.springframework.context.annotation.Import;

@SpringBootTest
@Import(TestMongoConfig.class)
class CodestrideBackendApplicationTests {

	@Autowired
	private MongoTemplate mongoTemplate;

	@Autowired
	private MongoDatabaseFactory mongoDatabaseFactory;

	@Autowired
	private MappingMongoConverter mappingMongoConverter;

	@Test
	void contextLoads() {
		assertNotNull(mongoDatabaseFactory, "MongoDatabaseFactory bean should be loaded");
		assertNotNull(mappingMongoConverter, "MappingMongoConverter bean should be loaded");
		assertNotNull(mongoTemplate, "MongoTemplate bean should be loaded");

		String databaseName = mongoDatabaseFactory.getMongoDatabase().getName();
		assertNotNull(databaseName, "Database name must not be null");
		assertFalse(databaseName.trim().isEmpty(), "Database name must not be empty");
		assertEquals("codestride", databaseName, "Database name should match configured database");

		Document pingResult = mongoTemplate.getDb().runCommand(new Document("ping", 1));
		assertNotNull(pingResult, "Ping result should not be null");
		assertTrue(pingResult.containsKey("ok"), "MongoDB should respond with ok: 1");
	}

}
