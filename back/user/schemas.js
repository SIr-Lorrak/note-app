const binary = {
  type: "object",
  properties: {
    type: {type:  "string"},
    data: {type: "array", items:{type: "number"}}
  }
}

const user = {
  type: "object",
  required: ["username","role","matiere","color","avatar", "carton", "commentaire", "datecarton", "created", "activetime"],
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
      type: "string"
    },
    avatar: binary,
    carton: {
      description: "carton recu par l'élève",
      type: "number"
    },
    commentaire: {
      description: "commentaire sur le comportement de l'élève",
      type: "string"
    },
    datecarton: {
      description: "date du dernier carton obtenu",
      type: "string"
    },
    created: {
      description: "date de l'inscription de l'élève",
      type: "string"
    },
    activetime: {
      description: "temps actif sur le site en seconde",
      type: "number"
    },
  },
}
const userUp = {
  type: "object",
  required: ["username","matiere","color","avatar"],
  properties: {
    username: {
      description: "ton nom, primary key",
      type: "string",
    },
    matiere: {
      description: "ta matiere préféré",
      type: "number",
    },
    color: {
      description: "ta couleur préféré",
      type: "string"
    },
    avatar: binary
  },
}

const userPass = {
  type: "object",
  required: ["username","password","role","matiere","color","avatar","carton","commentaire","datecarton", "created", "activetime"],
  properties: {
    username: {
      description: "ton nom, primary key",
      type: "string",
    },
    password: {
      description: "mot de passe hashé",
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
    color: binary,
    avatar: binary,
    carton: {
      description: "carton recu par l'élève",
      type: "number"
    },
    commentaire: {
      description: "commentaire sur le comportement de l'élève",
      type: "string"
    },
    datecarton: {
      description: "date du dernier carton obtenu",
      type: "string"
    },
    created: {
      description: "date de l'inscription de l'élève",
      type: "string"
    },
    activetime: {
      description: "temps actif sur le site en seconde",
      type: "number"
    },
  },
}

const carton = {
  type: "object",
  required: ["carton","commentaire","datecarton"],
  properties: {
    carton: {
      description: "carton recu par l'élève",
      type: "number"
    },
    commentaire: {
      description: "commentaire sur le comportement de l'élève",
      type: "string"
    },
    datecarton: {
      description: "date du dernier carton obtenu",
      type: "string"
    },
  },
}

const users = {
  type: "array",
  items: userPass,
}

const getUserSchema = {
  tags: ["user"],
  summary: "User's information",
  description: "Retreives a user informations.",
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

const getUsersSchema = {
  tags: ["user"],
  summary: "User's information",
  description: "Retreives all users informations. Administrators only.",
  response: {
    "2xx": users,
  },
}

const delUserSchema = {
  tags: ["user"],
  summary: "Delete a user",
  description: "Deletes a user.",
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
  description: "Creates a new user.",
  body: {
    type: "object",
    required: ["username","password"],
    properties: {
      username: { type: "string", minLength: 3 },
      password: { type: "string", minLength: 4 },
    },
  },
  response: {
    "2xx": user,
  },
}

const postUsersSchema = {
  tags: ["user"],
  summary: "Create a new user",
  description: "restores users. Administrators only.",
  body: {
    type: "object",
    required: ["users"],
    properties: {
      users: users, // with hashed password
    },
  },
  response: {
    "2xx": users,
  },
}

const putUserSchema = {
  tags: ["user"],
  summary: "Create a new user",
  description: "updates a user.",
  params: {
    type: "object",
    properties: {
      username: { type: "string", minLength: 3 },
    }
  },
  body: userUp,
  response: {
    "2xx": user,
  },
}

const putUserPassSchema = {
  tags: ["user"],
  summary: "Create a new user",
  description: "updates a user.",
  params: {
    type: "object",
    properties: {
      username: { type: "string", minLength: 3 },
    }
  },
  body: {
    type: "object",
    required: ["username","password"],
    properties: {
      oldPassword: { type: "string", minLength: 4 },
      newPassword: { type: "string", minLength: 4 },
    },
  },
  response: {
    "2xx": user,
  },
}


const putUserCartonSchema = {
  tags: ["user"],
  summary: "give a carton to a user",
  description: "give a carton to a user.",
  params: {
    type: "object",
    properties: {
      username: { type: "string", minLength: 3 },
    }
  },
  body: carton,// with non hashed password
  response: {
    "2xx": user,
  },
}

const putUserTimeSchema = {
  tags: ["user"],
  summary: "give a carton to a user",
  description: "give a carton to a user.",
  params: {
    type: "object",
    properties: {
      username: { type: "string", minLength: 3 },
    }
  },
  body: {
    type: "object",
    required: ["activeTime"],
    properties: {
      activeTime: { type: "number" },
    },
  },
  response: {
    "2xx": user,
  },
}

export { getUserSchema, getUsersSchema, postUserSchema, postUsersSchema, putUserSchema, putUserPassSchema, putUserCartonSchema, putUserTimeSchema, delUserSchema }
