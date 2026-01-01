package com.beanscore.dto.response;

import io.quarkus.runtime.annotations.RegisterForReflection;
import java.time.LocalDateTime;
import java.util.UUID;

@RegisterForReflection
public class UserResponse {

  public UUID id;
  public String email;
  public String name;
  public LocalDateTime createdAt;
  public LocalDateTime updatedAt;
}
