import { getUserSchema, getMeSchema, getUsersSchema, postUserSchema, postUsersSchema, putUserSchema, putUserPassSchema, putUserCartonSchema, putUserTimeSchema, delUserSchema } from "./schemas.js"
import { getUserHandler, getMeHandler, getUsersHandler, postUserHandler, postUsersHandler, putUserHandler, putUserPassHandler, putUserCartonHandler, putUserTimeHandler, delUserHandler } from "./handlers.js"

const getMeOptions = {
  method: "GET",
  path: "/me",
  schema: getMeSchema,
  // Authorization logic
  preHandler: (request, reply, done) => request.user !== undefined ? done() : reply.status(403).send(),
  // Business logic
  handler: getMeHandler,
}

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

const putUserPassOptions = {
  method: "PUT",
  path: "/:username/password",
  schema: putUserPassSchema,
  // Authorization logic
  preHandler: (request, reply, done) => request.user.isAdmin || (request.user.username === request.params.username) ? done() : reply.status(403).send(),
  // Business logic
  handler: putUserPassHandler,
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

const putUserTimeOptions = {
  method: "PUT",
  path: "/:username/time",
  schema: putUserTimeSchema,
  // Authorization logic
  preHandler: (request, reply, done) => (request.user.username === request.params.username) ? done() : reply.status(403).send(),
  // Business logic
  handler: putUserTimeHandler,
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
  fastify.addHook("onRequest", fastify.verifyJWTToken)
  fastify.route(getUserOptions)
  fastify.route(getMeOptions)
  fastify.route(getUsersOptions)
  fastify.route(postUserOptions)
  fastify.route(postUsersOptions)
  fastify.route(putUserOptions)
  fastify.route(putUserPassOptions)
  fastify.route(putUserCartonOptions)
  fastify.route(putUserTimeOptions)
  fastify.route(delUserOptions)
  done()
}

export default usersRoutes
