package com.beanscore.resource;

import com.beanscore.dto.request.CreateCoffeePlaceRequest;
import com.beanscore.dto.request.UpdateCoffeePlaceRequest;
import com.beanscore.dto.response.CoffeePlaceResponse;
import com.beanscore.service.CoffeePlaceService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.UUID;

@Path("/coffee-places")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CoffeePlaceResource {

  @Inject CoffeePlaceService coffeePlaceService;

  @GET
  public Response getAllCoffeePlaces() {
    List<CoffeePlaceResponse> coffeePlaces = coffeePlaceService.getAll();
    return Response.ok(coffeePlaces).build();
  }

  @GET
  @Path("/{id}")
  public Response getCoffeePlaceById(@PathParam("id") UUID id) {
    CoffeePlaceResponse coffeePlace = coffeePlaceService.getById(id);
    return Response.ok(coffeePlace).build();
  }

  @POST
  public Response createCoffeePlace(@Valid CreateCoffeePlaceRequest request) {
    CoffeePlaceResponse coffeePlace = coffeePlaceService.create(request);
    return Response.status(Response.Status.CREATED).entity(coffeePlace).build();
  }

  @PUT
  @Path("/{id}")
  public Response updateCoffeePlace(
      @PathParam("id") UUID id, @Valid UpdateCoffeePlaceRequest request) {
    CoffeePlaceResponse coffeePlace = coffeePlaceService.update(id, request);
    return Response.ok(coffeePlace).build();
  }

  @DELETE
  @Path("/{id}")
  public Response deleteCoffeePlace(@PathParam("id") UUID id) {
    coffeePlaceService.delete(id);
    return Response.noContent().build();
  }
}
