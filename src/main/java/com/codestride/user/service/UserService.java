
package com.codestride.user.service;

import com.codestride.user.dto.UserResponse;
import com.codestride.user.entity.User;
import com.codestride.user.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import com.codestride.user.dto.UpdateProfileRequest;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponse getProfile(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found"));

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getTheme(),
                user.getCreatedAt()
        );
    }

    @Transactional
    public UserResponse updateProfile(
            String email,
            UpdateProfileRequest request
    ) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found"));

        user.setUsername(request.getUsername().trim());
        user.setTheme(request.getTheme());

        User savedUser = userRepository.save(user);

        return new UserResponse(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getRole(),
                savedUser.getTheme(),
                savedUser.getCreatedAt()
        );
    }

}

