
package com.codestride.auth.repository;

import com.codestride.auth.entity.RefreshToken;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface RefreshTokenRepository
        extends MongoRepository<RefreshToken, String> {

    Optional<RefreshToken> findByToken(String token);

    Optional<RefreshToken> findByTokenAndEmail(
            String token,
            String email
    );

    void deleteByToken(String token);
}

