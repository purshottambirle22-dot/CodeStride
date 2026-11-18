package com.codestride.common.util;

import java.util.regex.Pattern;

public final class IdValidator {

    private static final Pattern VALID_ID_PATTERN = Pattern.compile("^[a-zA-Z0-9_-]{1,64}$");

    private IdValidator() {}

    public static void validateId(String id, String entityName) {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException(entityName + " ID cannot be null or blank");
        }
        String trimmed = id.trim();
        if (!VALID_ID_PATTERN.matcher(trimmed).matches()) {
            throw new IllegalArgumentException("Invalid " + entityName + " ID format: " + id);
        }
    }
}
