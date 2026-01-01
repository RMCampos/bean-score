package com.beanscore.dto.response;

import io.quarkus.runtime.annotations.RegisterForReflection;
import java.math.BigDecimal;

@RegisterForReflection
public record CoffeePlaceResponse(
    String id,
    String name,
    String address,
    String instagramHandle,
    Integer coffeeQuality,
    Integer ambient,
    Boolean hasGlutenFree,
    Boolean hasVegMilk,
    Boolean hasVeganFood,
    Boolean hasSugarFree,
    BigDecimal latitude,
    BigDecimal longitude) {}
