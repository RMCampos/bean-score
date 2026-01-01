package com.beanscore.dto.response;

import io.quarkus.runtime.annotations.RegisterForReflection;
import java.time.LocalDateTime;

@RegisterForReflection
public record ErrorResponse(int status, String error, String message, LocalDateTime timestamp) {}
