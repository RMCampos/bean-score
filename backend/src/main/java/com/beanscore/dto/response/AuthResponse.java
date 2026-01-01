package com.beanscore.dto.response;

import io.quarkus.runtime.annotations.RegisterForReflection;

@RegisterForReflection
public record AuthResponse(String token, UserResponse user) {}
