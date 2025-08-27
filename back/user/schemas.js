const user = {
  type: "object",
  required: ["username"],
  properties: {
    username: {
      description: "ton nom, primary key",
      type: "string",
    },
    role: {
      description: "0 pour les élève, 1 pour les profs",
      type: "number",
    },
    matiere: {
      description: "ta matiere préféré",
      type: "number",
    },
    color: {
      description: "ta couleur préféré",
      type: "number",
    },
    avatar: {
      description: "un entier représentant ton avatar",
      type:'number',
    },
  },
}

const getUserSchema = {
  tags: ["user"],
  summary: "User's information",
  description: "Retreives a user' information.",
  params: {
    type: "object",
    properties: {
      username: { type: "string", minLength: 3 },
    }
  },
  response: {
    "2xx": user,
  },
}

const delUserSchema = {
  tags: ["user"],
  summary: "Delete a user",
  description: "Delete a user. Administrators only.",
  params: {
    type: "object",
    properties: {
      username: { type: "string", minLength: 3 },
    }
  },
  response: {
    "2xx": user,
  },
}

const postUserSchema = {
  tags: ["user"],
  summary: "Create a new user",
  description: "Creates a new user. Administrators only.",
  body: {
    type: "object",
    required: ["username"],
    properties: {
      username: { type: "string", minLength: 3 },
      password: { type: "string", minLength: 4 },
    },
  },
  response: {
    "2xx": user,
  },
}

export { getUserSchema, postUserSchema, delUserSchema }
