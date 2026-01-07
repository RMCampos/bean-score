package com.beanscore.filter;

import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.ext.Provider;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Provider
public class CorsFilter implements ContainerResponseFilter {

  private static final List<String> ALLOWED_ORIGINS = Arrays.asList(
    "http://localhost:5173",
    "http://localhost:80",
    "https://beanscore.darkroasted.vps-kinghost.net"
  );

  @Override
  public void filter(
      ContainerRequestContext requestContext, ContainerResponseContext responseContext)
      throws IOException {

    String origin = requestContext.getHeaderString("Origin");

    if (origin != null && ALLOWED_ORIGINS.contains(origin)) {
      responseContext.getHeaders().add("Access-Control-Allow-Origin", origin);
      responseContext.getHeaders().add("Access-Control-Allow-Credentials", "true");
    }

    responseContext
        .getHeaders()
        .add("Access-Control-Allow-Headers", "origin, content-type, accept, authorization");
    responseContext
        .getHeaders()
        .add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
    responseContext.getHeaders().add("Access-Control-Max-Age", "86400");
  }
}
