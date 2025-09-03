// Read the .env file ASAP
import "dotenv/config"
// Import fastify app
import build from "./app.js"
import populate from "./postgres/populate.js"

import fastifyCookie from "@fastify/cookie"

// HTTP config from dotenv
const port = process.env.PORT ?? 3000
const host = process.env.HOST ?? "127.0.0.1"

// Global target in {production, development, test}
const environment = process.env.NODE_ENV ?? "development"
const app = await build({ logger: true })

// Entry point
async function startServer() {
  try {
    const status = await app.pg.query(
      "SELECT current_catalog , current_user, inet_server_addr(), inet_server_port();",
    )

    const { current_catalog, current_user, inet_server_addr, inet_server_port } = status.rows[0]
    app.log.info(
      `Connected to postgres://${current_user}@${inet_server_addr}:${inet_server_port}/${current_catalog}`,
    )

    await populate(app, 69) 

    app.register(fastifyCookie, {
      secret: SECRET, // for cookies signature
      hook: 'onRequest', // set to false to disable cookie autoparsing or set autoparsing on any of the following hooks: 'onRequest', 'preParsing', 'preHandler', 'preValidation'. default: 'onRequest'
      parseOptions: {}  // options for parsing cookies
    })

    await app.listen({ port, host })

  } catch (error) {
    app.log.fatal(error)
    // crashes the app
    // eslint-disable-next-line no-process-exit, unicorn/no-process-exit
    process.exit(1)
  }
}

await startServer()
