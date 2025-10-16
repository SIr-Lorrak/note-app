async function getNotesHandler(request, reply) {
  const { username } = request.params

  const results = await request.server.pg.query("SELECT * FROM notes WHERE name = $1;", [
    username,
  ])

  return reply.send(results.rows)
}

async function getAllNotesHandler(request, reply) {
  const results = await request.server.pg.query("SELECT * FROM notes;")
  return reply.send(results.rows)
}

async function postNoteHandler(request, reply) {
  const { name, matiere, date, notion, note, note2, revision, satisfaction } = request.body
  
  // just to test if the user exists
  const test = await request.server.pg.query("SELECT * FROM users WHERE username = $1;", [
    name,
  ])
  if (!test.rowCount) {
    return reply.notFound(`User '${name}' not found`)
  }

  request.server.log.info(
    `create new note for user ${name}`,
  )

  const results = await request.server.pg.query(
    `INSERT INTO notes(name, matiere, date, notion, note, note2, revision, satisfaction)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *;`,
    [name, matiere, date, notion, note, note2, revision, satisfaction],
  )

  reply.status(201).send(results.rows[0])
}

async function postNotesHandler(request, reply) {
  const { notes } = request.body

  request.server.log.info(
    `restore ${notes.length} notes `,
  )

  for (const note of notes) {
    await request.server.pg.query(
      `INSERT INTO notes(name, matiere, date, notion, note, note2, revision, satisfaction)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (username) DO UPDATE 
       SET name = EXCLUDED.name, matiere = EXCLUDED.matiere, date = EXCLUDED.date, notion = EXCLUDED.notion, note = EXCLUDED.note, note2 = EXCLUDED.note2, revision = EXCLUDED.revision, satisfaction = EXCLUDED.satisfaction
       RETURNING *;`,[note.name, note.matiere, note.date, note.notion, note.note, note.note2, note.revision, note.satisfaction])
  }

  const results = await request.server.pg.query("SELECT * FROM notes;")

  reply.status(201).send(results.rows)
}

async function putNoteHandler(request, reply) {
  const { id } = request.params.id
  const { name, matiere, date, notion, note, note2, revision, satisfaction } = request.body
  const hexColor = toBytea(color)
  const hexAvatar = toBytea(avatar)
  
  const results = await request.server.pg.query(
    `UPDATE notes 
     SET matiere = $1, date = $2, notion = $3, note = $4, note2 = $5, revision = $6, satisfaction = $7
     WHERE id = $8 AND name = $9
     RETURNING *;`,
    [matiere, date, notion, note, note2, revision, satisfaction, id, name],
  )
  if (results.rowCount !== 1) {
    return reply.notFound(`note ${id} not found for user ${name}`)
  }

  request.server.log.info(
    `update note ${id} of user ${name}`,
  )

  reply.status(201).send(results.rows[0])
}


async function delNoteHandler(request, reply) {
  const { id } = request.params
  const { username } = request.body

  const results = await request.server.pg.query(
    "DELETE FROM notes WHERE id = $1 AND name = $2 RETURNING *;",
    [id, username],
  )

  if (results.rowCount !== 1) {
    return reply.notFound(`notes '${id}' not found for user ${name}`)
  }

  return reply.send(results.rows[0])
}

export { getNotesHandler, getAllNotesHandler, postNoteHandler, postNotesHandler, putNoteHandler, delNoteHandler }
