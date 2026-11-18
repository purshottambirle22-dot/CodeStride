
package com.codestride.progress.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class UpdateProgressRequest {

    @NotBlank(message = "Status is required")
    @Pattern(
            regexp = "ATTEMPTED|SOLVED",
            message = "Status must be ATTEMPTED or SOLVED"
    )
    private String status;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

