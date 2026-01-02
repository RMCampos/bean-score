package com.beanscore.service;

import com.beanscore.entity.User;
import com.beanscore.repository.UserRepository;
import io.smallrye.jwt.build.Jwt;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotAuthorizedException;
import java.util.UUID;
import org.eclipse.microprofile.jwt.JsonWebToken;

@ApplicationScoped
public class JwtService {

  @Inject JsonWebToken jwt;

  @Inject UserRepository userRepository;

  public String generateToken(User user) {
    return Jwt.issuer("https://beanscore.com")
        .subject(user.id.toString())
        .claim("email", user.email)
        .claim("name", user.name)
        .groups("user")
        .expiresIn(604800) // 7 days
        .sign();
  }

  public UUID getCurrentUserId() {
    UUID userId = UUID.fromString(jwt.getSubject());

    // Verify user still exists (prevents deleted users from using old tokens)
    if (userRepository.findByIdOptional(userId).isEmpty()) {
      throw new NotAuthorizedException("User account no longer exists");
    }

    return userId;
  }
}
