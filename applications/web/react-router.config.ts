import type { Config } from "@react-router/dev/config";

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
  future: {
    // Enables `context`-based dependency injection in loaders/actions via
    // route middleware, so routes depend on domain interfaces rather than
    // instantiating infrastructure directly. See app/server/url-repository.server.ts.
    v8_middleware: true,
  },
} satisfies Config;
