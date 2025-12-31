package com.beanscore.resource;

import com.beanscore.dto.request.LoginRequest;
import com.beanscore.dto.request.RegisterRequest;
import com.beanscore.dto.response.AuthResponse;
import com.beanscore.dto.response.UserResponse;
import com.beanscore.service.AuthService;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {

  @Inject AuthService authService;

  @POST
  @Path("/register")
  @PermitAll
  public Response register(@Valid RegisterRequest request) {
    AuthResponse response = authService.register(request);
    return Response.status(Response.Status.CREATED).entity(response).build();
  }

  @POST
  @Path("/login")
  @PermitAll
  public Response login(@Valid LoginRequest request) {
    AuthResponse response = authService.login(request);
    return Response.ok(response).build();
  }

  @GET
  @Path("/me")
  @RolesAllowed("user")
  public Response getCurrentUser() {
    UserResponse response = authService.getCurrentUser();
    return Response.ok(response).build();
  }
}
