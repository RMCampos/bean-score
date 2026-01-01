package com.beanscore.filter;

import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.ext.Provider;
import java.io.IOException;

@Provider
public class CorsFilter implements ContainerResponseFilter {

  @Override
  public void filter(
      ContainerRequestContext requestContext, ContainerResponseContext responseContext)
      throws IOException {
    responseContext.getHeaders().add("Access-Control-Allow-Origin", "http://localhost:5173");
    responseContext.getHeaders().add("Access-Control-Allow-Credentials", "true");
    responseContext
        .getHeaders()
        .add("Access-Control-Allow-Headers", "origin, content-type, accept, authorization");
    responseContext
        .getHeaders()
        .add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
    responseContext.getHeaders().add("Access-Control-Max-Age", "86400");
  }
}
