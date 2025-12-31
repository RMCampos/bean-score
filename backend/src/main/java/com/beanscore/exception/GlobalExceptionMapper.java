package com.beanscore.exception;

import com.beanscore.dto.response.ErrorResponse;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotAuthorizedException;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Provider
public class GlobalExceptionMapper implements ExceptionMapper<Exception> {

  @Override
  public Response toResponse(Exception exception) {
    ErrorResponse errorResponse;
    Response.Status status;

    if (exception instanceof NotFoundException) {
      status = Response.Status.NOT_FOUND;
      errorResponse =
          new ErrorResponse(
              status.getStatusCode(), "Not Found", exception.getMessage(), LocalDateTime.now());

    } else if (exception instanceof NotAuthorizedException) {
      status = Response.Status.UNAUTHORIZED;
      errorResponse =
          new ErrorResponse(
              status.getStatusCode(), "Unauthorized", exception.getMessage(), LocalDateTime.now());

    } else if (exception instanceof BadRequestException) {
      status = Response.Status.BAD_REQUEST;
      errorResponse =
          new ErrorResponse(
              status.getStatusCode(), "Bad Request", exception.getMessage(), LocalDateTime.now());

    } else if (exception instanceof ConstraintViolationException) {
      status = Response.Status.BAD_REQUEST;
      ConstraintViolationException cve = (ConstraintViolationException) exception;
      String violations =
          cve.getConstraintViolations().stream()
              .map(ConstraintViolation::getMessage)
              .collect(Collectors.joining(", "));
      errorResponse =
          new ErrorResponse(
              status.getStatusCode(), "Validation Failed", violations, LocalDateTime.now());

    } else {
      status = Response.Status.INTERNAL_SERVER_ERROR;
      errorResponse =
          new ErrorResponse(
              status.getStatusCode(),
              "Internal Server Error",
              "An unexpected error occurred",
              LocalDateTime.now());
      // Log the full exception for debugging
      exception.printStackTrace();
    }

    return Response.status(status).entity(errorResponse).build();
  }
}
