package com.codestride.auth.controller;

import com.codestride.auth.dto.*;
import com.codestride.auth.service.AuthService;
import com.codestride.user.entity.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> register(@Valid @RequestBody RegisterRequest request) {

        User user = authService.register(
                request.getUsername(),
                request.getEmail(),
                request.getPassword()
        );

        return Map.of(
                "message", "Registration successful",
                "userId", user.getId() != null ? user.getId() : ""
        );
    }


    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return authService.login(
                request.getEmail(),
                request.getPassword()
        );
    }


    @GetMapping("/me")
    public Map<String, String> getCurrentUser(Authentication authentication) {
        return Map.of(
                "email", authentication != null ? authentication.getName() : "",
                "message", "JWT authentication successful"
        );
    }
    @PostMapping("/refresh")
    public RefreshTokenResponse refresh(
            @RequestBody RefreshTokenRequest request) {

        return authService.refreshAccessToken(
                request.getRefreshToken()
        );
    }

    @PostMapping("/logout")
    public Map<String, String> logout(
            @RequestBody LogoutRequest request) {

        authService.logout(request.getRefreshToken());

        return Map.of("message", "Logout successful");
    }

}
