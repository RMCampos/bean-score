package com.beanscore.security;

import io.quarkus.elytron.security.common.BcryptUtil;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class PasswordEncoder {

  public String encode(String rawPassword) {
    return BcryptUtil.bcryptHash(rawPassword);
  }

  public boolean matches(String rawPassword, String encodedPassword) {
    return BcryptUtil.matches(rawPassword, encodedPassword);
  }
}
