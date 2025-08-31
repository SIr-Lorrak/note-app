import { getUserSchema, getUsersSchema, postUserSchema, postUsersSchema, putUserSchema, delUserSchema } from "./schemas.js"
import { getUserHandler, getUsersHandler, postUserHandler, postUsersHandler, putUserHandler, delUserHandler } from "./handlers.js"

const getUserOptions = {
  method: "GET",
  path: "/:username",
  schema: getUserSchema,
  // Authorization logic
  preHandler: (request, reply, done) => request.user.isAdmin || (request.user.username === request.params.username) ? done() : reply.status(403).send(),
  // Business logic
  handler: getUserHandler,
}

const getUsersOptions = {
  method: "GET",
  path: "",
  schema: getUsersSchema,
  // Authorization logic
  preHandler: (request, reply, done) => request.user.isAdmin ? done() : reply.status(403).send(),
  // Business logic
  handler: getUsersHandler,
}

const postUserOptions = {
  method: "POST",
  path: "",
  schema: postUserSchema,
  // Authorization logic
  preHandler: (request, reply, done) => done(),
  // Business logic
  handler: postUserHandler,
}

const postUsersOptions = {
  method: "POST",
  path: "/many",
  schema: postUsersSchema,
  // Authorization logic
  preHandler: (request, reply, done) => request.user.isAdmin ? done() : reply.status(403).send(),
  // Business logic
  handler: postUsersHandler,
}

const putUserOptions = {
  method: "PUT",
  path: "/:username",
  schema: putUserSchema,
  // Authorization logic
  preHandler: (request, reply, done) => request.user.isAdmin || (request.user.username === request.params.username) ? done() : reply.status(403).send(),
  // Business logic
  handler: putUserHandler,
}

const putUserCartonOptions = {
  method: "PUT",
  path: "/:username/carton",
  schema: putUserCartonSchema,
  // Authorization logic
  preHandler: (request, reply, done) => request.user.isAdmin ? done() : reply.status(403).send(),
  // Business logic
  handler: putUserCartonHandler,
}

const delUserOptions = {
  method: "DELETE",
  path: "/:username",
  schema: delUserSchema,
  // Authorization logic
  preHandler: (request, reply, done) => request.user.isAdmin ? done() : reply.status(403).send(),
  // Business logic
  handler: delUserHandler,
}

function usersRoutes(fastify, options, done) {
  fastify.addHook("onRequest", fastify.auth([fastify.verifyJWTToken, fastify.basicAuth]))
  fastify.route(getUserOptions)
  fastify.route(getUsersOptions)
  fastify.route(postUserOptions)
  fastify.route(postUsersOptions)
  fastify.route(putUserOptions)
  fastify.route(delUserOptions)
  done()
}

export default usersRoutes
