package com.beanscore.service;

import com.beanscore.entity.User;
import io.smallrye.jwt.build.Jwt;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.UUID;
import org.eclipse.microprofile.jwt.JsonWebToken;

@ApplicationScoped
public class JwtService {

  @Inject JsonWebToken jwt;

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
    return UUID.fromString(jwt.getSubject());
  }
}
