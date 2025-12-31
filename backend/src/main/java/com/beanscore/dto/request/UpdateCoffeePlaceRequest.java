package com.beanscore.dto.request;

import java.math.BigDecimal;

public record UpdateCoffeePlaceRequest(
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
