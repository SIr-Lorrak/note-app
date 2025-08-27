const typeString = { type: "string" } // since i will be using this type a lot

const postAuthLoginSchema = {
  tags: ["auth"],
  summary: "Authentication using login/password",
  description: "Password authentication. Returns a JWT.",
  body: {
    type: "object",
    required: ["username", "password"],
    properties: {
      username: typeString,
      password: typeString,
    },
  },
  response: {
    200: typeString,
  },
}

export { postAuthLoginSchema }
