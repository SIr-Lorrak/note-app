import * as argon2 from "argon2"

async function getUserHandler(request, reply) {
  const { username } = request.params

  const results = await request.server.pg.query("SELECT * FROM users WHERE username = $1;", [
    username,
  ])

  if (!results.rowCount) {
    return reply.notFound(`User '${username}' not found`)
  }

  return reply.send(results.rows[0])
}

async function postUserHandler(request, reply) {
  const { username, password } = request.body

  const hashedPassword = await argon2.hash(password)

  request.server.log.info(
    `create new user ${username}`,
  )

  const results = await request.server.pg.query(
    `INSERT INTO users(username, password, role)
     VALUES ($1, $2, 0)
     -- conflict on either username or email)
     ON CONFLICT (username) DO NOTHING
     RETURNING *;`,
    [username, hashedPassword],
  )

  if (results.rowCount !== 1) {
    return reply.conflict(`User ${username} already exists`)
  }

  reply.status(201).send(results.rows[0])
}

async function delUserHandler(request, reply) {
  const { username } = request.params

  const results = await request.server.pg.query(
    "DELETE FROM users WHERE username = $1 RETURNING *;",
    [username],
  )

  if (results.rowCount !== 1) {
    return reply.notFound(`User '${username}' not found`)
  }

  return reply.send(results.rows[0])
}

export { getUserHandler, postUserHandler, delUserHandler }
