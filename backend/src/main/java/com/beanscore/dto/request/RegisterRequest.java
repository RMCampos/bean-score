package com.beanscore.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotNull String name, @NotNull @Email String email, @NotNull @Size(min = 6) String password) {}
