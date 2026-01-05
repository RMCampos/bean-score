package com.beanscore.resource;

import com.beanscore.service.CoffeePlaceService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;
import org.jboss.resteasy.reactive.PartType;

@Path("/coffee-places/{id}/photo")
@RolesAllowed("user")
public class CoffeePlacePhotoResource {

  @Inject CoffeePlaceService coffeePlaceService;

  public static class PhotoUpload {
    @FormParam("photo")
    @PartType(MediaType.APPLICATION_OCTET_STREAM)
    public InputStream photo;

    @FormParam("thumbnail")
    @PartType(MediaType.APPLICATION_OCTET_STREAM)
    public InputStream thumbnail;

    @FormParam("contentType")
    @PartType(MediaType.TEXT_PLAIN)
    public String contentType;
  }

  @POST
  @Consumes(MediaType.MULTIPART_FORM_DATA)
  public Response uploadPhoto(@PathParam("id") UUID id, @BeanParam PhotoUpload upload) {
    try {
      byte[] photoBytes = upload.photo.readAllBytes();
      byte[] thumbnailBytes = upload.thumbnail.readAllBytes();

      // Validate file sizes
      if (photoBytes.length > 2 * 1024 * 1024) {
        return Response.status(Response.Status.BAD_REQUEST)
            .entity("Photo file size must be less than 2MB")
            .build();
      }
      if (thumbnailBytes.length > 500 * 1024) {
        return Response.status(Response.Status.BAD_REQUEST)
            .entity("Thumbnail file size must be less than 500KB")
            .build();
      }

      // Validate content type
      if (!upload.contentType.equals("image/jpeg") && !upload.contentType.equals("image/png")) {
        return Response.status(Response.Status.BAD_REQUEST)
            .entity("Only JPEG and PNG images are allowed")
            .build();
      }

      coffeePlaceService.uploadPhoto(id, photoBytes, thumbnailBytes, upload.contentType);
      return Response.noContent().build();
    } catch (IOException e) {
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
          .entity("Failed to process photo upload")
          .build();
    }
  }

  @GET
  @Path("/thumbnail")
  @Produces({"image/jpeg", "image/png"})
  public Response getThumbnail(@PathParam("id") UUID id) {
    var photoData = coffeePlaceService.getPhotoThumbnail(id);
    if (photoData == null) {
      return Response.status(Response.Status.NOT_FOUND).build();
    }

    return Response.ok(photoData.bytes())
        .type(photoData.contentType())
        .header("Cache-Control", "max-age=3600")
        .build();
  }

  @GET
  @Produces({"image/jpeg", "image/png"})
  public Response getPhoto(@PathParam("id") UUID id) {
    var photoData = coffeePlaceService.getPhoto(id);
    if (photoData == null) {
      return Response.status(Response.Status.NOT_FOUND).build();
    }

    return Response.ok(photoData.bytes())
        .type(photoData.contentType())
        .header("Cache-Control", "max-age=86400")
        .build();
  }

  @DELETE
  public Response deletePhoto(@PathParam("id") UUID id) {
    coffeePlaceService.deletePhoto(id);
    return Response.noContent().build();
  }
}
