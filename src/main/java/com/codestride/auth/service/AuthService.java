package com.codestride.auth.service;

import com.codestride.auth.dto.LoginResponse;
import com.codestride.auth.entity.RefreshToken;
import com.codestride.security.JwtService;
import com.codestride.user.entity.User;
import com.codestride.user.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.codestride.auth.dto.RefreshTokenResponse;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import java.time.Instant;
import com.codestride.auth.repository.RefreshTokenRepository;

import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenRepository refreshTokenRepository;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       RefreshTokenRepository refreshTokenRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    public User register(String username, String email, String rawPassword) {
        String normalizedEmail = normalizeEmail(email);

        if (normalizedEmail == null || normalizedEmail.isEmpty()) {
            throw new IllegalArgumentException("Email must not be empty");
        }
        if (rawPassword == null || rawPassword.isEmpty()) {
            throw new IllegalArgumentException("Password must not be empty");
        }

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = new User();
        user.setUsername(username != null ? username.trim() : null);
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setRole("USER");

        return userRepository.save(user);
    }


    public LoginResponse login(String email, String rawPassword) {
        if (email == null || email.isBlank() || rawPassword == null || rawPassword.isEmpty()) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String normalizedEmail = normalizeEmail(email);
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String accessToken = jwtService.generateToken(
                user.getEmail(),
                user.getRole()
        );

        String refreshToken = jwtService.generateRefreshToken(
                user.getEmail(),
                user.getRole()
        );
        RefreshToken savedToken = new RefreshToken(
                refreshToken,
                user.getEmail(),
                jwtService.getRefreshTokenExpiry(refreshToken)
        );

        refreshTokenRepository.save(savedToken);
        return new LoginResponse(
                accessToken,
                refreshToken,
                "Bearer"
        );
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }


    public RefreshTokenResponse refreshAccessToken(String refreshToken) {
        try {
            if (!jwtService.isRefreshToken(refreshToken)) {
                throw new BadCredentialsException("Invalid refresh token");
            }

            Claims claims = jwtService.parseToken(refreshToken);
            String email = claims.getSubject();

            RefreshToken storedToken = refreshTokenRepository
                    .findByTokenAndEmail(refreshToken, email)
                    .orElseThrow(() ->
                            new BadCredentialsException(
                                    "Refresh token not found or revoked"
                            ));

            if (!storedToken.getExpiresAt().isAfter(Instant.now())) {
                refreshTokenRepository.deleteByToken(refreshToken);
                throw new BadCredentialsException("Refresh token expired");
            }

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() ->
                            new BadCredentialsException("User not found"));

            // Generate a new pair of tokens
            String newAccessToken = jwtService.generateToken(
                    user.getEmail(),
                    user.getRole()
            );

            String newRefreshToken = jwtService.generateRefreshToken(
                    user.getEmail(),
                    user.getRole()
            );

            // Save the new refresh token
            RefreshToken newStoredToken = new RefreshToken(
                    newRefreshToken,
                    user.getEmail(),
                    jwtService.getRefreshTokenExpiry(newRefreshToken)
            );

            refreshTokenRepository.save(newStoredToken);

            // Revoke the old refresh token
            refreshTokenRepository.deleteByToken(refreshToken);

            return new RefreshTokenResponse(
                    newAccessToken,
                    newRefreshToken,
                    "Bearer"
            );

        } catch (JwtException | IllegalArgumentException e) {
            throw new BadCredentialsException(
                    "Invalid or expired refresh token"
            );
        }
    }
    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new BadCredentialsException("Refresh token is required");
        }

        refreshTokenRepository.deleteByToken(refreshToken);
    }
}
