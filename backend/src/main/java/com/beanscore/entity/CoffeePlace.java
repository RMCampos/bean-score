package com.beanscore.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "coffee_places")
public class CoffeePlace extends PanacheEntityBase {

  @Id @GeneratedValue public UUID id;

  @Column(name = "user_id", nullable = false)
  public UUID userId;

  @Column(nullable = false)
  public String name;

  @Column(nullable = false, length = 500)
  public String address;

  @Column(name = "instagram_handle")
  public String instagramHandle;

  @Min(1)
  @Max(5)
  @Column(name = "coffee_quality", nullable = false)
  public Integer coffeeQuality;

  @Min(1)
  @Max(5)
  @Column(nullable = false)
  public Integer ambient;

  @Column(name = "has_gluten_free")
  public Boolean hasGlutenFree = false;

  @Column(name = "has_veg_milk")
  public Boolean hasVegMilk = false;

  @Column(name = "has_vegan_food")
  public Boolean hasVeganFood = false;

  @Column(name = "has_sugar_free")
  public Boolean hasSugarFree = false;

  @Column(precision = 11, scale = 8)
  public BigDecimal latitude;

  @Column(precision = 11, scale = 8)
  public BigDecimal longitude;

  @Column(name = "created_at", nullable = false, updatable = false)
  public LocalDateTime createdAt;

  @Column(name = "updated_at", nullable = false)
  public LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
