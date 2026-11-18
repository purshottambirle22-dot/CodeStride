package com.codestride.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import io.jsonwebtoken.Claims;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Service
public class JwtService {
    private final SecretKey secretKey;
    private final long expirationMs;
    private final long refreshExpirationMs;
    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms:3600000}") long expirationMs,
        @Value("${app.jwt.refresh-expiration-ms:604800000}") long refreshExpirationMs) {

    this.secretKey = Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
        this.refreshExpirationMs = refreshExpirationMs;
}

    public String generateToken(String email, String role) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(secretKey)
                .compact();
    }

    public String generateRefreshToken(String email, String role) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + refreshExpirationMs);

        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .claim("tokenType", "refresh")
                .issuedAt(now)
                .expiration(expiry)
                .signWith(secretKey)
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
    public boolean isRefreshToken(String token) {
        Claims claims = parseToken(token);

        String tokenType = claims.get("tokenType", String.class);

        return "refresh".equals(tokenType);
    }
    public Instant getRefreshTokenExpiry(String token) {
        Claims claims = parseToken(token);
        return claims.getExpiration().toInstant();
    }
}
