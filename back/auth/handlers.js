// at the beginning of the file, import jwt and assign to a variable
import jwt from "jsonwebtoken"

import * as argon2 from "argon2"
import fastify from "fastify"

// convert secret in hex string to bytes
const secret = Buffer.from(process.env.JWT_SECRET, "hex")

// helper
function generateJWTToken(username, role) {
	const token = jwt.sign({ username, role, sub: username }, secret, {
		expiresIn: 600,
	})
	return token
}

// set user's info once authenticated, user by verify{JWTToken, LoginPassword} functions
function setRequestUser(username, role, request) {
  request.server.log.info(`setRequestUser(${username}, ${role})`)
  // pass in the user's info
  request.user = { username, role, isAdmin: role === 1 }
}

// Handler used by fastify.auth, decorates fastify instance
async function verifyJWTToken(request, reply) {
  const token = request.headers.authorization.split(' ')[1] // token sous la forme "bearer token"
  const payload = jwt.verify(token, secret)
  setRequestUser(payload.username, payload.role, request)
}

// intermediate function : DO NOT reply JWT. Used by postAuthLoginHandler and "@fastify/basic-auth"
async function verifyLoginPassword(username, password, request, reply, done = () => 0) {
    const result = await request.server.pg.query("SELECT * FROM users WHERE username = $1;", [username,])
    if (result.rows.length === 0) {
      reply.header('Content-Type', 'application/json; charset=utf-8').status(401).send('Bad credentials')
      return
    }

    const user = result.rows[0]
    
    try{
      const match = await argon2.verify(user.password, password) 
      if (match) {
        setRequestUser(user.username, user.role, request)
        done()
        return user
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

// Get user's information from Gitlab
async function fetchGitlabUserProfile(glAccessToken) {
  const options = {
    method: "GET",
    headers: new Headers({
      Accept: "application/json",
      Authorization: `Bearer ${glAccessToken}`,
    }),
  }

  const resultProfile = await fetch(`https://forge.univ-lyon1.fr/api/v4/user`, options)
  return await resultProfile.json()
}

// Route handler for login/password
async function postAuthLoginHandler(request, reply) {
  if (!request.body.username || !request.body.password) {
    reply.status(400).send()
  }
  const user = await verifyLoginPassword(request.body.username, request.body.password, request, reply)
  if (user) {
    const token = generateJWTToken(user.username, user.role)
    reply.header('Content-Type', 'text/plain; charset=utf-8').send(token)
  } else { 
    reply.header('Content-Type', 'application/json; charset=utf-8').status(401).send('Bad credentials')
  }
}

export {
  generateJWTToken,
  verifyJWTToken,
  verifyLoginPassword,
  postAuthLoginHandler,
}
