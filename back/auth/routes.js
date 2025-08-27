import { postAuthLoginSchema } from "./schemas.js"
import { postAuthLoginHandler } from "./handlers.js"

const loginOptions = {
  method: "POST",
  path: "/login",
  schema: postAuthLoginSchema,
  handler: postAuthLoginHandler,
}

const authRoutes = (fastify, options, done) => {
  fastify.route(loginOptions)
  done()
}

export default authRoutes
