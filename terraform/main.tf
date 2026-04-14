terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = ">= 2.0.0"
    }
  }

  backend "s3" {
    bucket                      = "bean-score"
    key                         = "kubernetes/terraform.tfstate"
    region                      = "auto"
    endpoints                   = { s3 = "https://d17eb09b6bce2f90e16e800bb2a6baf9.r2.cloudflarestorage.com" }
    skip_credentials_validation = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    skip_metadata_api_check     = true
    skip_s3_checksum            = true
  }
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}

variable "db_user" {
  type      = string
  sensitive = true
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "db_name" {
  type      = string
  sensitive = true
}

variable "google_maps_api_key" {
  type      = string
  sensitive = true
}

variable "debug_maps" {
  type    = bool
  default = true
}

variable "backend_image" {
  type    = string
  default = "ghcr.io/rmcampos/bean-score/backend:latest"
}

variable "frontend_image" {
  type    = string
  default = "ghcr.io/rmcampos/bean-score/app:latest"
}

resource "kubernetes_namespace_v1" "bean_score" {
  metadata {
    name = "bean-score"
  }
}

resource "kubernetes_secret_v1" "bean_score_secrets" {
  metadata {
    name      = "bean-score-secrets"
    namespace = kubernetes_namespace_v1.bean_score.metadata[0].name
  }

  data = {
    postgres_user       = var.db_user
    postgres_password   = var.db_password
    postgres_db         = var.db_name
    google_maps_api_key = var.google_maps_api_key
    debug_maps          = var.debug_maps ? "true" : "false"
  }
}

resource "kubernetes_config_map_v1" "db_init_script" {
  metadata {
    name      = "db-init-script"
    namespace = kubernetes_namespace_v1.bean_score.metadata[0].name
  }

  data = {
    "init.sql" = file("${path.module}/init.sql")
  }
}

resource "kubernetes_persistent_volume_claim_v1" "bean_score_db_data" {
  metadata {
    name      = "postgres-data-pvc"
    namespace = kubernetes_namespace_v1.bean_score.metadata[0].name
  }
  spec {
    access_modes = ["ReadWriteOnce"]
    resources {
      requests = {
        storage = "1Gi"
      }
    }
  }
}

resource "kubernetes_deployment_v1" "bean_score_db" {
  metadata {
    name      = "bean-score-db"
    namespace = kubernetes_namespace_v1.bean_score.metadata[0].name
  }
  spec {
    replicas = 1
    selector { match_labels = { app = "bean-score-db" } }
    template {
      metadata { labels = { app = "bean-score-db" } }
      spec {
        container {
          image = "postgres:15.8-bookworm"
          name  = "postgres"
          volume_mount {
            name       = "init-script-volume"
            mount_path = "/docker-entrypoint-initdb.d"
            read_only  = true
          }
          volume_mount {
            name       = "postgres-storage"
            mount_path = "/var/lib/postgresql/data"
          }
          env {
            name = "POSTGRES_USER"
            value_from {
              secret_key_ref {
                name = kubernetes_secret_v1.bean_score_secrets.metadata[0].name
                key  = "postgres_user"
              }
            }
          }
          env {
            name = "POSTGRES_PASSWORD"
            value_from {
              secret_key_ref {
                name = kubernetes_secret_v1.bean_score_secrets.metadata[0].name
                key  = "postgres_password"
              }
            }
          }
          env {
            name = "POSTGRES_DB"
            value_from {
              secret_key_ref {
                name = kubernetes_secret_v1.bean_score_secrets.metadata[0].name
                key  = "postgres_db"
              }
            }
          }
          port { container_port = 5432 }
        }
        volume {
          name = "init-script-volume"
          config_map {
            name = kubernetes_config_map_v1.db_init_script.metadata[0].name
          }
        }
        volume {
          name = "postgres-storage"
          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim_v1.bean_score_db_data.metadata[0].name
          }
        }
      }
    }
  }
}

resource "kubernetes_service_v1" "bean_score_db_svc" {
  metadata {
    name      = "bean-score-db-svc"
    namespace = kubernetes_namespace_v1.bean_score.metadata[0].name
  }
  spec {
    selector = { app = "bean-score-db" }
    port { port = 5432 }
    type = "ClusterIP"
  }
}

resource "kubernetes_deployment_v1" "bean_score_backend" {
  metadata {
    name      = "bean-score-backend"
    namespace = kubernetes_namespace_v1.bean_score.metadata[0].name
  }
  spec {
    replicas = 1
    selector { match_labels = { app = "bean-score-backend" } }
    template {
      metadata { labels = { app = "bean-score-backend" } }
      spec {
        container {
          image = var.backend_image
          name  = "backend"
          env {
            name  = "QUARKUS_PROFILE"
            value = "prod"
          }
          env {
            name  = "QUARKUS_DATASOURCE_JDBC_URL"
            value = "jdbc:postgresql://bean-score-db-svc:5432/${var.db_name}"
          }
          env {
            name = "QUARKUS_DATASOURCE_USERNAME"
            value_from {
              secret_key_ref {
                name = kubernetes_secret_v1.bean_score_secrets.metadata[0].name
                key  = "postgres_user"
              }
            }
          }
          env {
            name = "QUARKUS_DATASOURCE_PASSWORD"
            value_from {
              secret_key_ref {
                name = kubernetes_secret_v1.bean_score_secrets.metadata[0].name
                key  = "postgres_password"
              }
            }
          }
          resources {
            limits   = { memory = "256Mi", cpu = "500m" }
            requests = { memory = "256Mi", cpu = "250m" }
          }
        }
      }
    }
  }
}

resource "kubernetes_service_v1" "bean_score_backend_svc" {
  metadata {
    name      = "bean-score-backend-svc"
    namespace = kubernetes_namespace_v1.bean_score.metadata[0].name
  }
  spec {
    selector = { app = "bean-score-backend" }
    port {
      port        = 8080
      target_port = 8080
    }
  }
}

resource "kubernetes_deployment_v1" "bean_score_frontend" {
  metadata {
    name      = "bean-score-frontend"
    namespace = kubernetes_namespace_v1.bean_score.metadata[0].name
  }
  spec {
    replicas = 1
    selector { match_labels = { app = "bean-score-app" } }
    template {
      metadata { labels = { app = "bean-score-app" } }
      spec {
        container {
          image = var.frontend_image
          name  = "frontend"
          port { container_port = 80 }
          env {
            name  = "VITE_BACKEND_SERVER"
            value = "https://beanapi.darkroasted.vps-kinghost.net"
          }
          env {
            name = "VITE_GOOGLE_MAPS_API_KEY"
            value_from {
              secret_key_ref {
                name = kubernetes_secret_v1.bean_score_secrets.metadata[0].name
                key  = "google_maps_api_key"
              }
            }
          }
          env {
            name = "VITE_DEBUG_MAPS"
            value_from {
              secret_key_ref {
                name = kubernetes_secret_v1.bean_score_secrets.metadata[0].name
                key  = "debug_maps"
              }
            }
          }
        }
      }
    }
  }
}

resource "kubernetes_service_v1" "bean_score_frontend_svc" {
  metadata {
    name      = "bean-score-frontend-svc"
    namespace = kubernetes_namespace_v1.bean_score.metadata[0].name
  }
  spec {
    selector = { app = "bean-score-app" }
    port {
      port        = 80
      target_port = 80
    }
    type = "ClusterIP"
  }
}

# Unified Ingress for App and API
resource "kubernetes_ingress_v1" "bean_score_ingress" {
  metadata {
    name      = "bean-score-ingress"
    namespace = kubernetes_namespace_v1.bean_score.metadata[0].name
    annotations = {
      "kubernetes.io/ingress.class"    = "traefik"
      "cert-manager.io/cluster-issuer" = "letsencrypt-prod"
    }
  }
  spec {
    tls {
      hosts       = ["beanscore.darkroasted.vps-kinghost.net", "beanapi.darkroasted.vps-kinghost.net"]
      secret_name = "beanscore-tls-certs"
    }
    rule {
      host = "beanscore.darkroasted.vps-kinghost.net"
      http {
        path {
          path      = "/"
          path_type = "Prefix"
          backend {
            service {
              name = kubernetes_service_v1.bean_score_frontend_svc.metadata[0].name
              port { number = 80 }
            }
          }
        }
      }
    }
    rule {
      host = "beanapi.darkroasted.vps-kinghost.net"
      http {
        path {
          path      = "/"
          path_type = "Prefix"
          backend {
            service {
              name = kubernetes_service_v1.bean_score_backend_svc.metadata[0].name
              port { number = 8080 }
            }
          }
        }
      }
    }
  }
}

