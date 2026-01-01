package com.beanscore.dto.request;

import io.quarkus.runtime.annotations.RegisterForReflection;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@RegisterForReflection
public record LoginRequest(@NotNull @Email String email, @NotNull @Size(min = 8) String password) {}
