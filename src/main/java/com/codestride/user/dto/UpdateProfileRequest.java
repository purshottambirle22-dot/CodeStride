
package com.codestride.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class UpdateProfileRequest {

    @NotBlank(message = "Username cannot be empty")
    @Size(min = 3, max = 30, message = "Username must be 3 to 30 characters")
    private String username;

    @NotBlank(message = "Theme cannot be empty")
    @Pattern(
            regexp = "LIGHT|DARK",
            message = "Theme must be LIGHT or DARK"
    )
    private String theme;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
    }
}

