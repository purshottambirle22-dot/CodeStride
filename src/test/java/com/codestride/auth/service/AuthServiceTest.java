package com.codestride.auth.service;

import com.codestride.auth.dto.LoginResponse;
import com.codestride.auth.entity.RefreshToken;
import com.codestride.auth.repository.RefreshTokenRepository;
import com.codestride.security.JwtService;
import com.codestride.user.entity.User;
import com.codestride.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, passwordEncoder, jwtService, refreshTokenRepository);
    }

    @Test
    void testLogin_Success() {
        User user = new User();
        user.setEmail("user@example.com");
        user.setPasswordHash("hashedPassword");
        user.setRole("USER");

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("rawSecret", "hashedPassword")).thenReturn(true);
        when(jwtService.generateToken("user@example.com", "USER")).thenReturn("mocked.jwt.token");
        when(jwtService.generateRefreshToken("user@example.com", "USER")).thenReturn("mocked.refresh.token");
        when(jwtService.getRefreshTokenExpiry("mocked.refresh.token")).thenReturn(Instant.now().plusSeconds(604800));

        LoginResponse response = authService.login("user@example.com", "rawSecret");

        assertEquals("mocked.jwt.token", response.getAccessToken());
        assertEquals("mocked.refresh.token", response.getRefreshToken());
        assertEquals("Bearer", response.getTokenType());
        verify(userRepository).findByEmail("user@example.com");
        verify(passwordEncoder).matches("rawSecret", "hashedPassword");
        verify(jwtService).generateToken("user@example.com", "USER");
        verify(jwtService).generateRefreshToken("user@example.com", "USER");
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    void testLogin_EmailNormalization() {
        User user = new User();
        user.setEmail("user@example.com");
        user.setPasswordHash("hashedPassword");
        user.setRole("USER");

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("rawSecret", "hashedPassword")).thenReturn(true);
        when(jwtService.generateToken("user@example.com", "USER")).thenReturn("mocked.jwt.token");
        when(jwtService.generateRefreshToken("user@example.com", "USER")).thenReturn("mocked.refresh.token");
        when(jwtService.getRefreshTokenExpiry("mocked.refresh.token")).thenReturn(Instant.now().plusSeconds(604800));

        LoginResponse response = authService.login("  User@Example.COM  ", "rawSecret");

        assertEquals("mocked.jwt.token", response.getAccessToken());
        verify(userRepository).findByEmail("user@example.com");
    }

    @Test
    void testLogin_UnknownEmail_ThrowsBadCredentialsException() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        BadCredentialsException ex = assertThrows(BadCredentialsException.class, () ->
                authService.login("unknown@example.com", "secret")
        );

        assertEquals("Invalid email or password", ex.getMessage());
        verify(passwordEncoder, never()).matches(any(), any());
        verify(jwtService, never()).generateToken(any(), any());
    }

    @Test
    void testLogin_IncorrectPassword_ThrowsBadCredentialsException() {
        User user = new User();
        user.setEmail("user@example.com");
        user.setPasswordHash("hashedPassword");

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPassword", "hashedPassword")).thenReturn(false);

        BadCredentialsException ex = assertThrows(BadCredentialsException.class, () ->
                authService.login("user@example.com", "wrongPassword")
        );

        assertEquals("Invalid email or password", ex.getMessage());
        verify(jwtService, never()).generateToken(any(), any());
    }

    @Test
    void testLogin_NullOrEmptyCredentials_ThrowsBadCredentialsException() {
        assertThrows(BadCredentialsException.class, () -> authService.login(null, "secret"));
        assertThrows(BadCredentialsException.class, () -> authService.login("user@example.com", null));
        assertThrows(BadCredentialsException.class, () -> authService.login("   ", "secret"));
        assertThrows(BadCredentialsException.class, () -> authService.login("user@example.com", ""));
    }

    @Test
    void testRegister_Success() {
        when(userRepository.existsByEmail("alice@example.com")).thenReturn(false);
        when(passwordEncoder.encode("secretPass")).thenReturn("encodedHash");

        User savedUser = new User();
        savedUser.setId("generated-id");
        savedUser.setEmail("alice@example.com");
        savedUser.setUsername("alice");
        savedUser.setPasswordHash("encodedHash");
        savedUser.setRole("USER");

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        User result = authService.register("alice", "  Alice@Example.COM ", "secretPass");

        assertNotNull(result);
        assertEquals("alice@example.com", result.getEmail());

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User toSave = captor.getValue();
        assertEquals("alice@example.com", toSave.getEmail());
        assertEquals("alice", toSave.getUsername());
        assertEquals("encodedHash", toSave.getPasswordHash());
        assertEquals("USER", toSave.getRole());
    }

    @Test
    void testRegister_DuplicateEmail_ThrowsIllegalArgumentException() {
        when(userRepository.existsByEmail("bob@example.com")).thenReturn(true);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                authService.register("bob", "bob@example.com", "secret")
        );

        assertEquals("Email already registered", ex.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void testRegister_EmptyEmailOrPassword_ThrowsIllegalArgumentException() {
        assertThrows(IllegalArgumentException.class, () -> authService.register("user", null, "pass"));
        assertThrows(IllegalArgumentException.class, () -> authService.register("user", "user@test.com", null));
    }
}
