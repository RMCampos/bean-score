package com.beanscore.service;

import com.beanscore.dto.request.LoginRequest;
import com.beanscore.dto.request.RegisterRequest;
import com.beanscore.dto.response.AuthResponse;
import com.beanscore.dto.response.UserResponse;
import com.beanscore.entity.User;
import com.beanscore.repository.UserRepository;
import com.beanscore.security.PasswordEncoder;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotAuthorizedException;
import jakarta.ws.rs.NotFoundException;
import java.util.UUID;

@ApplicationScoped
public class AuthService {

  @Inject UserRepository userRepository;

  @Inject PasswordEncoder passwordEncoder;

  @Inject JwtService jwtService;

  @Transactional
  public AuthResponse register(RegisterRequest request) {
    String plainEmail = getPlainEmail(request.email());
    if (userRepository.existsByEmail(plainEmail)) {
      throw new BadRequestException("User with this email already exists");
    }

    User user = new User();
    user.email = plainEmail;
    user.name = request.name();
    user.password = passwordEncoder.encode(request.password());

    userRepository.persist(user);

    String token = jwtService.generateToken(user);

    UserResponse userResponse = mapToUserResponse(user);
    AuthResponse authResponse = new AuthResponse(token, userResponse);

    return authResponse;
  }

  public AuthResponse login(LoginRequest request) {
    String plainEmail = getPlainEmail(request.email());

    User user =
        userRepository
            .findByEmail(plainEmail)
            .orElseThrow(() -> new NotAuthorizedException("Invalid email or password"));

    if (!passwordEncoder.matches(request.password(), user.password)) {
      throw new NotAuthorizedException("Invalid email or password");
    }

    String token = jwtService.generateToken(user);

    // Build response
    UserResponse userResponse = mapToUserResponse(user);
    AuthResponse authResponse = new AuthResponse(token, userResponse);

    return authResponse;
  }

  public UserResponse getCurrentUser() {
    UUID currentUserId = jwtService.getCurrentUserId();

    User user =
        userRepository
            .findByIdOptional(currentUserId)
            .orElseThrow(() -> new NotFoundException("User not found"));

    return mapToUserResponse(user);
  }

  private UserResponse mapToUserResponse(User user) {
    UserResponse response = new UserResponse();
    response.id = user.id;
    response.email = user.email;
    response.name = user.name;
    response.createdAt = user.createdAt;
    response.updatedAt = user.updatedAt;
    return response;
  }

  private String getPlainEmail(String email) {
    return email.toLowerCase().trim();
  }
}
