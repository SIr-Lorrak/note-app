const note = {
  type: "object",
  required: ["name", "matiere", "date", "notion", "note", "note2", "revision", "satisfaction"],
  properties: {
    id: {
      description: "identifiant unique à chaque note",
      type: "number",
    },
    name: {
      description: "le nom de l'élève ayant recu la note",
      type: "string",
    },
    matiere: {
      description: "la matiere de la note",
      type: "number",
    },
    date: {
      description: "la date de reception de la note",
      type: "string",
    },
    notion: {
      description: "la notion couverte par la note",
      type: "string",
    },
    note: {
      description: "note en pourcentage de réussite",
      type:"number",
    },
    note2: {
      description: "dit si la notion est acquise (non acquis, en cour d'acquisition, acquis)",
      type:"number",
    },
    revision: {
      description: "la personne avec qui l'élève a révisé pour le contrôle",
      type:"string",
    },
    satisfaction: {
      description: "auto-note si l'élève est satisfait de lui",
      type:"number"
    }
  }
}

const notes = {
  type: "array",
  items: note,
}

const getNotesSchema = {
  tags: ["note"],
  summary: "all notes from a user",
  description: "Retreives all notes from a designated user.",
  params: {
    type: "object",
    properties: {
      username: { type: "string", minLength: 3 },
    }
  },
  response: {
    "2xx": notes,
  },
}

const getAllNotesSchema = {
  tags: ["note"],
  summary: "All notes",
  description: "Retreives all notes from ALL users. Administrators only.",
  response: {
    "2xx": notes,
  },
}

const delNoteSchema = {
  tags: ["note"],
  summary: "Delete a note",
  description: "Deletes a note.",
  params: {
    type: "object",
    properties: {
      id: { type: "number" },
    }
  },
  body: {
    type: "object",
    required: ["name"],
    properties: {
      username: { type:"string", minLength:3}
    }
  },
  response: {
    "2xx": note,
  },
}

const postNoteSchema = {
  tags: ["note"],
  summary: "Create a new note",
  description: "Creates a new note.",
  body: note,   // without id
  response: {
    "2xx": note,// with id
  },
}

const postNotesSchema = {
  tags: ["note"],
  summary: "restores notes",
  description: "restores notes. Administrators only.",
  body: {
    type: "object",
    required: ["notes"],
    properties: {
      notes: notes, // with id
    },
  },
  response: {
    "2xx": notes,   // with id too
  },
}

const putNoteSchema = {
  tags: ["note"],
  summary: "modify a note",
  description: "modify a note.",
  params: {
    type: "object",
    properties: {
      id: { type: "number" },
    }
  },
  body: note,   // without id
  response: {
    "2xx": note,// with id
  },
}

export { getNotesSchema, getAllNotesSchema, postNoteSchema, postNotesSchema, putNoteSchema, delNoteSchema }
