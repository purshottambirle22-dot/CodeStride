package com.codestride.user.controller;

import com.codestride.user.dto.UserResponse;
import com.codestride.user.service.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.codestride.user.dto.UpdateProfileRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public UserResponse getMyProfile(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equalsIgnoreCase(authentication.getName())) {
            throw new org.springframework.security.authentication.BadCredentialsException("Full authentication is required to access this resource");
        }
        String email = authentication.getName();
        return userService.getProfile(email);
    }

    @PutMapping("/me")
    public UserResponse updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equalsIgnoreCase(authentication.getName())) {
            throw new org.springframework.security.authentication.BadCredentialsException("Full authentication is required to access this resource");
        }
        String email = authentication.getName();
        return userService.updateProfile(email, request);
    }

}
