package com.beanscore.dto.response;

import io.quarkus.runtime.annotations.RegisterForReflection;
import java.time.LocalDateTime;
import java.util.UUID;

@RegisterForReflection
public record UserResponse(
    UUID id, String email, String name, LocalDateTime createdAt, LocalDateTime updatedAt) {}
