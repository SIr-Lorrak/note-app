import { getNotesSchema, getAllNotesSchema, postNoteSchema, postNotesSchema, putNoteSchema, delNoteSchema } from "./schemas.js"
import { getNotesHandler, getAllNotesHandler, postNoteHandler, postNotesHandler, putNoteHandler, delNoteHandler } from "./handlers.js"

const getNotesOptions = {
  method: "GET",
  path: "/:username",
  schema: getNotesSchema,
  // Authorization logic
  preHandler: (request, reply, done) => request.user.isAdmin || (request.user.username === request.params.username) ? done() : reply.status(403).send(),
  // Business logic
  handler: getNotesHandler,
}

const getAllNotesOptions = {
  method: "GET",
  path: "/all",
  schema: getAllNotesSchema,
  // Authorization logic
  preHandler: (request, reply, done) => request.user.isAdmin ? done() : reply.status(403).send(),
  // Business logic
  handler: getAllNotesHandler,
}

const postNoteOptions = {
  method: "POST",
  path: "",
  schema: postNoteSchema,
  // Authorization logic
  preHandler: (request, reply, done) => request.user.isAdmin || (request.user.username === request.body.name) ? done() : reply.status(403).send(),
  // Business logic
  handler: postNoteHandler,
}

const postNotesOptions = {
  method: "POST",
  path: "/many",
  schema: postNotesSchema,
  // Authorization logic
  preHandler: (request, reply, done) => request.user.isAdmin ? done() : reply.status(403).send(),
  // Business logic
  handler: postNotesHandler,
}

const putNoteOptions = {
  method: "PUT",
  path: "/:id",
  schema: putNoteSchema,
  // Authorization logic
  preHandler: (request, reply, done) => request.user.isAdmin || (request.user.username === request.body.name) ? done() : reply.status(403).send(),
  // Business logic
  handler: putNoteHandler,
}

const delNoteOptions = {
  method: "DELETE",
  path: "/:id",
  schema: delNoteSchema,
  // Authorization logic
  preHandler: (request, reply, done) => request.user.isAdmin || (request.user.username === request.body.name) ? done() : reply.status(403).send(),
  // Business logic
  handler: delNoteHandler,
}

function noteRoutes(fastify, options, done) {
  fastify.addHook("onRequest", fastify.auth([fastify.verifyJWTToken, fastify.basicAuth]))
  fastify.route(getNotesOptions)
  fastify.route(getAllNotesOptions)
  fastify.route(postNoteOptions)
  fastify.route(postNotesOptions)
  fastify.route(putNoteOptions)
  fastify.route(delNoteOptions)
  done()
}

export default noteRoutes
