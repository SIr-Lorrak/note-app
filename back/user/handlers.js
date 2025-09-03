import * as argon2 from "argon2"


function toBytea(buf) {
  let result = "\\x"
  for (const value of buf.data) {
    const hex = value.toString(16)
    result = result.concat(hex.length === 1 ? "0".concat(hex) : hex)
  }
  return result
}

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

async function getUsersHandler(request, reply) {
  const results = await request.server.pg.query("SELECT * FROM users;")
  return reply.send(results.rows)
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
     ON CONFLICT (username) DO NOTHING
     RETURNING *;`,
    [username, hashedPassword],
  )

  if (results.rowCount !== 1) {
    return reply.conflict(`User ${username} already exists`)
  }

  reply.status(201).send(results.rows[0])
}

async function postUsersHandler(request, reply) {
  const { users } = request.body

  request.server.log.info(
    `restore ${users.length} users `,
  )

  for (const user of users) {
    await request.server.pg.query(
      `INSERT INTO users(username, password, role, color, matiere, avatar, carton, commentaire, datecarton)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (username) DO UPDATE 
       SET password = EXCLUDED.password, role = EXCLUDED.role, color = EXCLUDED.color, matiere = EXCLUDED.matiere, avatar = EXCLUDED.avatar, carton = EXCLUDED.carton, commentaire = EXCLUDED.commentaire, datecarton = EXCLUDED.datecarton
       RETURNING *;`,

      [user.username, user.password, user.role,
       toBytea(user.color), user.matiere, toBytea(user.avatar),
       user.carton, user.commentaire, user.dateCarton])
  }

  const results = await request.server.pg.query("SELECT * FROM users;")

  reply.status(201).send(results.rows)
}

async function putUserHandler(request, reply) {
  const oldname = request.params.username
  const { username, color, matiere, avatar } = request.body
  const hexAvatar = toBytea(avatar)
  
  try {
    const results = await request.server.pg.query(
      `UPDATE users 
       SET username = $1, color = $2, matiere = $3, avatar = $4
       WHERE username = $5
       RETURNING *;`,
      [username, color, matiere, hexAvatar, oldname],
    )
    if (results.rowCount !== 1) {
      return reply.notFound(`User ${oldname} not found`)
    }

    if (oldname !== username) {
      const results2 = await request.server.pg.query(
        `UPDATE notes
         SET name = $1
         WHERE name = $2;`,
        [username, oldname],
      )
    }

    request.server.log.info(
      `update user ${oldname}`,
    )

    reply.status(201).send(results.rows[0])
  } catch {
    return reply.conflict(`User ${username} already exists other changement where kept`)
  }
}

async function putUserPassHandler(request, reply) {
  const username = request.params.username
  const { oldPassword, newPassword } = request.body
  const result = await request.server.pg.query("SELECT * FROM users WHERE username = $1;", [username,])
    if (result.rows.length === 0) {
      reply.header('Content-Type', 'application/json; charset=utf-8').status(401).send('Bad credentials')
      return
    }

    const user = result.rows[0]
    
    try{
      const match = await argon2.verify(user.password, oldPassword) 
      if (match) {
        const hashedPassword = await argon2.hash(newPassword)
        const results = await request.server.pg.query(
          `UPDATE users 
           SET password = $2
           WHERE username = $1
           RETURNING *;`,
          [username, hashedPassword],
        )
        reply.status(201).send(results.rows[0])
      }
      else {
        reply.header('Content-Type', 'application/json; charset=utf-8').status(401).send('Bad credentials')
        return
      }
    } catch (e) {
        request.server.log.error(e)
        reply.header('Content-Type', 'application/json; charset=utf-8').status(401).send('Bad credentials')
        return
    }
}

async function putUserCartonHandler(request, reply) {
  const { username } = request.params
  const { carton, commentaire, datecarton } = request.body
  
    const results = await request.server.pg.query(
      `UPDATE users 
       SET carton = $1, commentaire = $2, datecarton = $3
       WHERE username = $4
       RETURNING *;`,
      [carton, commentaire, datecarton, username],
    )
    if (results.rowCount !== 1) {
      return reply.notFound(`User ${username} not found`)
    }

    request.server.log.info(
      `carton given to ${username}`,
    )

    reply.status(201).send(results.rows[0])
}

async function putUserTimeHandler(request, reply) {
  const { username } = request.params
  const { activeTime } = request.body
  
    const results = await request.server.pg.query(
      `UPDATE users 
       SET activetime = activetime + $1
       WHERE username = $2
       RETURNING *;`,
      [activeTime, username],
    )
    if (results.rowCount !== 1) {
      return reply.notFound(`User ${username} not found`)
    }

    request.server.log.info(
      `active time updated for ${username}`,
    )

    reply.status(201).send(results.rows[0])
}

async function delUserHandler(request, reply) {
  const { username } = request.params

  const results = await request.server.pg.query(
    "DELETE FROM users WHERE username = $1 RETURNING *;",
    [username],
  )

  const results2 = await request.server.pg.query(
    "DELETE FROM notes WHERE name = $1 RETURNING *;",
    [username],
  )

  if (results.rowCount !== 1) {
    return reply.notFound(`User '${username}' not found`)
  }

  return reply.send(results.rows[0])
}

export { getUserHandler, getUsersHandler, postUserHandler, postUsersHandler, putUserHandler, putUserPassHandler, putUserCartonHandler, putUserTimeHandler, delUserHandler }
