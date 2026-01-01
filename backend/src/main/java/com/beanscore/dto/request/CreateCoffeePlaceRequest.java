package com.beanscore.dto.request;

import io.quarkus.runtime.annotations.RegisterForReflection;
import java.math.BigDecimal;

@RegisterForReflection
public record CreateCoffeePlaceRequest(
    String name,
    String address,
    String instagramHandle,
    int coffeeQuality,
    int ambient,
    boolean hasGlutenFree,
    boolean hasVegMilk,
    boolean hasVeganFood,
    boolean hasSugarFree,
    BigDecimal latitude,
    BigDecimal longitude) {}
