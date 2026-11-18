package com.codestride.config;

import com.mongodb.ReadPreference;
import org.springframework.boot.mongodb.autoconfigure.MongoClientSettingsBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
public class MongoConfig {

    @Bean
    public MongoClientSettingsBuilderCustomizer mongoClientSettingsCustomizer() {
        return builder -> {
            builder.applyToConnectionPoolSettings(pool -> pool
                    .minSize(5)
                    .maxSize(50)
                    .maxWaitTime(5, TimeUnit.SECONDS)
                    .maxConnectionIdleTime(60, TimeUnit.SECONDS)
                    .maxConnectionLifeTime(5, TimeUnit.MINUTES))
            .applyToSocketSettings(socket -> socket
                    .connectTimeout(10, TimeUnit.SECONDS)
                    .readTimeout(30, TimeUnit.SECONDS))
            .applyToClusterSettings(cluster -> cluster
                    .serverSelectionTimeout(10, TimeUnit.SECONDS))
            .readPreference(ReadPreference.primary());
        };
    }
}
