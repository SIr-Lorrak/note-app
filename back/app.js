// Read the .env file ASAP, used for PG env variables, <https://github.com/motdotla/dotenv>
import "dotenv/config"
// Main node object
import process from "node:process"

// Require the framework <https://www.fastify.io/>
import fastify from "fastify"
// Utilities, notably httpErrors <https://github.com/fastify/fastify-sensible>
import fastifySensible from "@fastify/sensible"
// Wrapper for node-postgres <https://github.com/fastify/fastify-postgres> https://node-postgres.com/
import pg from "@fastify/postgres"
// Authentication wrapper <https://github.com/fastify/fastify-auth>
import fastifyAuth from "@fastify/auth"
// HTTP Basic Auth, <https://github.com/fastify/fastify-basic-auth>
import fastifyBasicAuth from "@fastify/basic-auth"
// Swagger generator <https://github.com/fastify/fastify-swagger
import fastifySwagger from "@fastify/swagger"
// Swagger UI <https://github.com/fastify/fastify-swagger-ui
import fastifySwaggerUI from "@fastify/swagger-ui"

// Print all routes, for dev <https://github.com/ShogunPanda/fastify-print-routes>
// eslint-disable-next-line import/no-unresolved, node/no-missing-import, node/no-unpublished-import
import fastifyPrintRoutes from "fastify-print-routes"

// Auth handler, to decorate app
import { verifyJWTToken, verifyLoginPassword } from "./auth/handlers.js"

// App's route
import authRoutes from "./auth/routes.js"
import userRoutes from "./user/routes.js"
import noteRoutes from "./note/routes.js"
const port = process.env.PORT ?? 3000
const host = process.env.HOST ?? "127.0.0.1"
const serverUrl = `http://${host}:${port}`

const swaggerOptions = {
  // openapi: "3.0.3", generated
  info: {
    title: "notation and authentification App",
    version: "0.1.0",
    summary: "A sample notation service",
    description: "Sample application for student notation",
    contact: {
      name: "NEXT LEVEL",
      url: serverUrl,
    },
  },

  servers: [
    {
      url: "https://next-level.somehow.wtf",
      description: "prod server",
    },
    {
      url: "https://next-level.localhost",
      description: "dev server",
    },
    {
      url: `http://localhost:${port}`,
      description: "Local server",
    },
  ],
  // host: `${process.env.HOSTNAME}:${process.env.PORT}`,
  // schemes: ["http"],
  consumes: ["application/json"],
  produces: ["application/json"],
  tags: [
    { name: "note", description: "notation end-points" },
    { name: "user", description: "User end-points" },
    { name: "auth", description: "Authentication end-points" },
  ],

  components: {
    securitySchemes: {
      jwtBearer: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT Authorization header using the Bearer scheme.",
      },
      httpBasic: {
        type: "http",
        scheme: "basic",
        description: "Basic Authorization header with login/password.",
      },
    },
  },
  security: [
    {
      jwtBearer: [],
    },
    {
      httpBasic: [],
    },
  ],
}

const swaggerUIOptions = {
  routePrefix: "/docs",
  uiConfig: {
    docExpansion: "list",
    deepLinking: true,
  },
}

// App builder see <https://www.fastify.io/docs/latest/Guides/Testing/>
function build(options = {}) {
  // Instantiate Fastify with configured logger
  const app = fastify(options)

  // Automatic Swagger doc, BEFORE fastifyPrintRoutes
  app.register(fastifySwagger, { openapi: swaggerOptions })
  app.register(fastifySwaggerUI, swaggerUIOptions)

  // register now and prints all route when server is ready
  if (process.env.NODE_ENV == "development") {
    app.register(fastifyPrintRoutes, { compact: true })
  }

  // Register plugins
  app.register(fastifySensible)
  app.register(pg, {
    // connectionString is replaced by env variables
    native: process.platform === "linux",
    max: 4,
    connectionTimeoutMillis: 3000,
  })

  // Decorate fastify with authentication and authorization logic
  app.register(fastifyAuth)
  // TODO : compléter la fonction verifyJWTToken
  app.decorate("verifyJWTToken", verifyJWTToken)

  app.register(fastifyBasicAuth, {
    // TODO : compléter la fonction verifyLoginPassword
    validate: verifyLoginPassword,
    authenticate: false, 
  })

  app.addHook("onRequest", (request, reply, done) => {
    reply.header('Cache-Control', 'private')
    done()
  })

  // Register applicative routes
  app.register(authRoutes, { prefix: "/auth" })
  app.register(userRoutes, { prefix: "/user" })
  app.register(noteRoutes, { prefix: "/note" })

  return app
}

export default build
