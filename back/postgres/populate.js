import * as argon2 from "argon2"

const admin_password = process.env.ADMIN_PASSWORD

export default async function populate(app, version) {
  await app.pg.query(`CREATE TABLE IF NOT EXISTS version (
    v int primary key);`
  )
  const vresults = await app.pg.query("SELECT * FROM version")
  const oldVersion = !vresults.rowCount? 0 : vresults.rows[0].v

  if (oldVersion !== version) {
  	app.log.info(`mise à jour de la base de données à la version ${version}.0`)
  	await app.pg.query(`DROP TABLE IF EXISTS notes CASCADE;`)
  	await app.pg.query(`DROP TABLE IF EXISTS exos CASCADE;`)
  	await app.pg.query(`DROP TABLE IF EXISTS exos_users CASCADE;`) //relation many to many entre users et exos
  	await app.pg.query(`DROP TABLE IF EXISTS users CASCADE;`)
  	await app.pg.query(`TRUNCATE version;`)
  	await app.pg.query(`INSERT INTO version(v) VALUES ($1);`, [version])
  }

	await app.pg.query(`CREATE TABLE IF NOT EXISTS users (
    username varchar(45) NOT NULL primary key,
    password varchar(450) NOT NULL,
    role int NOT NULL DEFAULT '0',
    avatar bytea NOT NULL DEFAULT '\\x00',
    color varchar(7) NOT NULL DEFAULT '#FAEBD7',
    matiere int NOT NULL DEFAULT '0',
    carton int NOT NULL DEFAULT '0',
		commentaire varchar(300) NOT NULL DEFAULT '',
		dateCarton date NOT NULL DEFAULT '2000-09-26',
		created date NOT NULL DEFAULT CURRENT_DATE,
		activetime int NOT NULL DEFAULT '0');`
  )

  await app.pg.query(`CREATE TABLE IF NOT EXISTS notes (
    id serial primary key,
    name varchar(45) NOT NULL references users(username),
    matiere int NOT NULL,
    date date NOT NULL DEFAULT CURRENT_DATE,
    notion varchar(200) NOT NULL,
    note int NOT NULL,
    note2 int NOT NULL,
    revision varchar(80) NOT NULL,
    satisfaction int NOT NULL);`
  )

  await app.pg.query(`CREATE TABLE IF NOT EXISTS exos (
    id serial primary key,
    matiere int NOT NULL DEFAULT '0',
    nom varchar(45) NOT NULL DEFAULT 'exercice',
    date date NOT NULL DEFAULT CURRENT_DATE,
    texte varchar(300) NOT NULL DEFAULT '',
    file varchar(200) NOT NULL);`
  )

  await app.pg.query(`CREATE TABLE IF NOT EXISTS exos_users (
    id int NOT NULL references exos(id),
    name varchar(45) NOT NULL references users(username),
    PRIMARY KEY(id, name));`
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
  const sresults = await app.pg.query("SELECT * FROM secrets")
  var s = 0
  if (!sresults.rowCount) {
    app.log.info("no secret found, creating one...")
    s = genRanHex(32)
    await app.pg.query(`INSERT INTO secrets(secret) VALUES ($1) ON CONFLICT (secret) DO NOTHING RETURNING *;`, [s])
  } else {
    s = sresults.rows[0].secret
  }

  global.SECRET = Buffer.from(s, "hex")
}