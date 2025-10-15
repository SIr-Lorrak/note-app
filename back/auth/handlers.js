// at the beginning of the file, import jwt and assign to a variable
import jwt from "jsonwebtoken"

import * as argon2 from "argon2"
import fastify from "fastify"
import fastifyCookie from '@fastify/cookie';

// helper
function generateJWTToken(username, role) {
	const token = jwt.sign({ username, role, sub: username }, SECRET, {
		expiresIn: "400d",
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
  const token = request.cookies.Authorization
  request.server.log.info("token d'autorisation : " + token)
  const connected = request.cookies.Connected
  request.server.log.info("token de connexion : " + connected)
  if (connected === undefined || connected === 'disconnect') {
    reply
      .clearCookie('Authorization', {
        maxAge: 34560000,
        httpOnly: true,
        sameSite: 'strict',
        secure: true,
        path: '/'
      })
      .clearCookie('Connected', {
        maxAge: 34560000,
        sameSite: 'strict',
        secure: true,
        path: '/'
      })
  } else {
    const payload = jwt.verify(token, SECRET)
    setRequestUser(payload.username, payload.role, request)
  }
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

// Route handler for login/password
async function postAuthLoginHandler(request, reply) {
  if (!request.body.username || !request.body.password) {
    reply.status(400).send()
  }
  const genRanHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')
  const s = 'Bearer '+genRanHex(32)
  const user = await verifyLoginPassword(request.body.username, request.body.password, request, reply)
  if (user) {
    const token = generateJWTToken(user.username, user.role)
    reply
      .setCookie('Authorization', token, {
        maxAge: 34560000,
        httpOnly: true,
        sameSite: 'strict',
        secure: true,
        path: '/'
      })
      .setCookie('Connected', s, {
        maxAge: 34560000,
        sameSite: 'strict',
        secure: true,
        path: '/'
      })
      .send('')
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
