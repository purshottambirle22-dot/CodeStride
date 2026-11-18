package com.codestride.config;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.bson.conversions.Bson;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.withSettings;

@TestConfiguration
public class TestMongoConfig {

    @Bean
    @Primary
    public MongoClient mongoClient() {
        MongoClient mongoClient = mock(MongoClient.class, withSettings().lenient());
        MongoDatabase mongoDatabase = mock(MongoDatabase.class, withSettings().lenient());
        MongoCollection<?> mongoCollection = mock(MongoCollection.class, withSettings().lenient());

        when(mongoClient.getDatabase(anyString())).thenReturn(mongoDatabase);
        when(mongoDatabase.getName()).thenReturn("codestride");
        when(mongoDatabase.runCommand(any(Bson.class))).thenReturn(new Document("ok", 1.0));
        when(mongoDatabase.getCollection(anyString())).thenReturn((MongoCollection) mongoCollection);
        when(mongoDatabase.getCollection(anyString(), any())).thenReturn((MongoCollection) mongoCollection);

        return mongoClient;
    }
}
