package com.beanscore.dto.request;

import io.quarkus.runtime.annotations.RegisterForReflection;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

@RegisterForReflection
public record CreateCoffeePlaceRequest(
    @NotNull @NotBlank String name,
    @NotNull @NotBlank String address,
    String instagramHandle,
    @NotNull Integer coffeeQuality,
    @NotNull Integer ambient,
    boolean hasGlutenFree,
    boolean hasVegMilk,
    boolean hasVeganFood,
    boolean hasSugarFree,
    BigDecimal latitude,
    BigDecimal longitude) {}
