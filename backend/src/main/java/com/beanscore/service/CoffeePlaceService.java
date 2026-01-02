package com.beanscore.service;

import com.beanscore.dto.request.CreateCoffeePlaceRequest;
import com.beanscore.dto.request.UpdateCoffeePlaceRequest;
import com.beanscore.dto.response.CoffeePlaceResponse;
import com.beanscore.entity.CoffeePlace;
import com.beanscore.repository.CoffeePlaceRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;
import java.util.List;
import java.util.UUID;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@ApplicationScoped
public class CoffeePlaceService {

  private static final Logger logger = Logger.getLogger(CoffeePlaceService.class.getName());

  @Inject CoffeePlaceRepository coffeePlaceRepository;

  @Inject JwtService jwtService;

  @Transactional
  public CoffeePlaceResponse create(CreateCoffeePlaceRequest request) {
    UUID currentUserId = jwtService.getCurrentUserId();

    CoffeePlace coffeePlace = new CoffeePlace();
    coffeePlace.userId = currentUserId;
    coffeePlace.name = request.name();
    coffeePlace.address = request.address();
    coffeePlace.instagramHandle = request.instagramHandle();
    coffeePlace.coffeeQuality = request.coffeeQuality();
    coffeePlace.ambient = request.ambient();
    coffeePlace.hasGlutenFree = request.hasGlutenFree();
    coffeePlace.hasVegMilk = request.hasVegMilk();
    coffeePlace.hasVeganFood = request.hasVeganFood();
    coffeePlace.hasSugarFree = request.hasSugarFree();
    coffeePlace.latitude = request.latitude();
    coffeePlace.longitude = request.longitude();

    coffeePlaceRepository.persist(coffeePlace);

    return mapToCoffeePlaceResponse(coffeePlace);
  }

  public List<CoffeePlaceResponse> getAll() {
    UUID currentUserId = jwtService.getCurrentUserId();

    logger.fine("Getting all coffee places for user id: " + currentUserId);

    List<CoffeePlace> coffeePlaces = coffeePlaceRepository.findByUserId(currentUserId);

    logger.fine("Found " + coffeePlaces.size() + " coffee places for user id: " + currentUserId);

    return coffeePlaces.stream().map(this::mapToCoffeePlaceResponse).collect(Collectors.toList());
  }

  public CoffeePlaceResponse getById(UUID id) {
    UUID currentUserId = jwtService.getCurrentUserId();

    logger.fine("Getting coffee place by id: " + id + " for user id: " + currentUserId);

    CoffeePlace coffeePlace =
        coffeePlaceRepository
            .findByIdAndUserId(id, currentUserId)
            .orElseThrow(() -> new NotFoundException("Coffee place not found"));

    logger.fine("Found coffee place with id: " + id + " for user id: " + currentUserId);

    return mapToCoffeePlaceResponse(coffeePlace);
  }

  @Transactional
  public CoffeePlaceResponse update(UUID id, UpdateCoffeePlaceRequest request) {
    UUID currentUserId = jwtService.getCurrentUserId();

    logger.fine("Updating coffee place with id: " + id + " for user id: " + currentUserId);

    CoffeePlace coffeePlace =
        coffeePlaceRepository
            .findByIdAndUserId(id, currentUserId)
            .orElseThrow(() -> new NotFoundException("Coffee place not found"));

    logger.fine("Found coffee place with id: " + id + " for update");

    coffeePlace.name = request.name();
    coffeePlace.address = request.address();
    coffeePlace.instagramHandle = request.instagramHandle();
    coffeePlace.coffeeQuality = request.coffeeQuality();
    coffeePlace.ambient = request.ambient();
    coffeePlace.hasGlutenFree = request.hasGlutenFree();
    coffeePlace.hasVegMilk = request.hasVegMilk();
    coffeePlace.hasVeganFood = request.hasVeganFood();
    coffeePlace.hasSugarFree = request.hasSugarFree();
    coffeePlace.latitude = request.latitude();
    coffeePlace.longitude = request.longitude();

    coffeePlaceRepository.persist(coffeePlace);

    logger.fine("Updated coffee place with id: " + coffeePlace.id + " for user id: " + currentUserId);

    return mapToCoffeePlaceResponse(coffeePlace);
  }

  @Transactional
  public void delete(UUID id) {
    UUID currentUserId = jwtService.getCurrentUserId();

    logger.fine("Deleting coffee place with id: " + id + " for user id: " + currentUserId);

    long deletedCount = coffeePlaceRepository.deleteByIdAndUserId(id, currentUserId);

    if (deletedCount == 0) {
      logger.warning("Coffee place with id: " + id + " not found for deletion");
      throw new NotFoundException("Coffee place not found");
    }
    logger.fine("Deleted coffee place with id: " + id + " for user id: " + currentUserId);
  }

  private CoffeePlaceResponse mapToCoffeePlaceResponse(CoffeePlace coffeePlace) {
    CoffeePlaceResponse response =
        new CoffeePlaceResponse(
            coffeePlace.id.toString(),
            coffeePlace.name,
            coffeePlace.address,
            coffeePlace.instagramHandle,
            coffeePlace.coffeeQuality,
            coffeePlace.ambient,
            coffeePlace.hasGlutenFree,
            coffeePlace.hasVegMilk,
            coffeePlace.hasVeganFood,
            coffeePlace.hasSugarFree,
            coffeePlace.latitude,
            coffeePlace.longitude);
    return response;
  }
}
