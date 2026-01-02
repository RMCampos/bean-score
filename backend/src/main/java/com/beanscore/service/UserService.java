package com.beanscore.service;

import com.beanscore.entity.CoffeePlace;
import com.beanscore.entity.User;
import com.beanscore.repository.CoffeePlaceRepository;
import com.beanscore.repository.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;
import java.util.List;
import java.util.UUID;
import java.util.logging.Logger;

@ApplicationScoped
public class UserService {

  private static final Logger logger = Logger.getLogger(UserService.class.getName());

  @Inject JwtService jwtService;

  @Inject UserRepository userRepository;

  @Inject CoffeePlaceRepository coffeePlaceRepository;

  @Transactional
  public void deleteUserAccount() {
    logger.info("Starting user account deletion process");
    UUID currentUserId = jwtService.getCurrentUserId();

    User user =
        userRepository
            .findByIdOptional(currentUserId)
            .orElseThrow(() -> new NotFoundException("User not found"));

    logger.info("Deleting user with ID: " + currentUserId);

    List<CoffeePlace> coffeePlaces = coffeePlaceRepository.findByUserId(currentUserId);
    logger.info("Found " + coffeePlaces.size() + " coffee places associated with user");

    if (!coffeePlaces.isEmpty()) {
      long deletedCount = coffeePlaceRepository.deleteByUserId(currentUserId);
      logger.info("Deleted " + deletedCount + " coffee places associated with user");
    }

    userRepository.delete(user);
    logger.info("Deleted user with ID: " + currentUserId);
  }
}
