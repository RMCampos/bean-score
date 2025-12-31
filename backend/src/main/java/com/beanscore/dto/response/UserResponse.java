package com.beanscore.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public class UserResponse {

  public UUID id;
  public String email;
  public String name;
  public LocalDateTime createdAt;
  public LocalDateTime updatedAt;
}
