/// <reference types="vite/client" />

declare module 'vue-router' {
  interface RouteMeta {
    title?: string;
    description?: string;
    noIndex?: boolean;
    requiresAuth?: boolean;
    requiresAdmin?: boolean;
    breadcrumb?: string;
  }
}

export {};
