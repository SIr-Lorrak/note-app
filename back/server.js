// Read the .env file ASAP
import "dotenv/config"
// Import fastify app
import build from "./app.js"

import * as argon2 from "argon2"

// HTTP config from dotenv
const port = process.env.PORT ?? 3000
const host = process.env.HOST ?? "127.0.0.1"

// Global target in {production, development, test}
const environment = process.env.NODE_ENV ?? "development"
const admin_password = process.env.ADMIN_PASSWORD
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


    await app.pg.query(`CREATE TABLE IF NOT EXISTS users (
      username varchar(45) NOT NULL primary key,
      password varchar(450) NOT NULL,
      role int NOT NULL DEFAULT '0',
      avatar bytea NOT NULL DEFAULT '\\x00',
      color bytea NOT NULL DEFAULT '\\xFF0000',
      matiere int NOT NULL DEFAULT '0');`
    )

    await app.pg.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS carton int NOT NULL DEFAULT 0;`)
    await app.pg.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS commentaire varchar(300) NOT NULL DEFAULT '';`)
    await app.pg.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS dateCarton date NOT NULL DEFAULT '2000-09-26';`)


    await app.pg.query(`CREATE TABLE IF NOT EXISTS notes (
      id serial primary key,
      name varchar(45) NOT NULL references users(username),
      matiere int NOT NULL,
      date date NOT NULL,
      notion varchar(200) NOT NULL,
      note int NOT NULL,
      note2 int NOT NULL,
      revision varchar(80) NOT NULL,
      satisfaction int NOT NULL);`
    )

    await app.pg.query(`CREATE TABLE IF NOT EXISTS secrets (
      secret varchar(32) primary key);`
    ) 

    async function createAdmin(username, password) {
      const hashedPassword = await argon2.hash(password)

      app.log.info(
        `create new admin ${username}`,
      )

      await app.pg.query(
        `INSERT INTO users(username, password, role)
         VALUES ($1, $2, 1)
         ON CONFLICT (username) DO NOTHING
         RETURNING *;`,
        [username, hashedPassword],
      )
    }

    await createAdmin("Chloé", admin_password)
    await createAdmin("Lorrak", admin_password)

    const genRanHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')
    const results = await app.pg.query("SELECT * FROM secrets")
    var s = 0
    if (!results.rowCount) {
      app.log.info("no secret found, creating one...")
      s = genRanHex(32)
      await app.pg.query(`INSERT INTO secrets(secret) VALUES ($1) ON CONFLICT (secret) DO NOTHING RETURNING *;`, [s])
    } else {
      s = results.rows[0].secret
    }

    global.SECRET = Buffer.from(s, "hex")

    await app.listen({ port, host })

  } catch (error) {
    app.log.fatal(error)
    // crashes the app
    // eslint-disable-next-line no-process-exit, unicorn/no-process-exit
    process.exit(1)
  }
}

await startServer()
