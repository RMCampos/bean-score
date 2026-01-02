package com.beanscore.repository;

import com.beanscore.entity.CoffeePlace;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class CoffeePlaceRepository implements PanacheRepositoryBase<CoffeePlace, UUID> {

  public List<CoffeePlace> findByUserId(UUID userId) {
    return list("userId", userId);
  }

  public Optional<CoffeePlace> findByIdAndUserId(UUID id, UUID userId) {
    return find("id = ?1 and userId = ?2", id, userId).firstResultOptional();
  }

  public long deleteByIdAndUserId(UUID id, UUID userId) {
    return delete("id = ?1 and userId = ?2", id, userId);
  }

  public long deleteByUserId(UUID userId) {
    return delete("userId", userId);
  }
}
