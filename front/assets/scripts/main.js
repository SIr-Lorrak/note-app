moment.locale('fr')



// ~~~~~~~~~~~~~~~~INITIAL STATE~~~~~~~~~~~~~~~~

whoami()
//reloadPage()
//upUsers(students)
//upToiles(notes, currentState.currentEleve)
document.getElementById('new-note-date').value = today
document.getElementById('carton-date').value = today



// ~~~~~~~~~~~~~~~~~~~EVENTS~~~~~~~~~~~~~~~~~~~~

for (const m of matieres) {
	m.onclick = (e) => {
    changePage("matiere")
    changeOnglet("historique", false)
    changeMatiere(m.id)
	}
}

for (const o of onglet) {
  o.onclick = (e) => {
    changeOnglet(o.id)
  }
}

go_home.onclick = (e) => {
  changePage(getAccueil())
}

go_back.onclick = (e) => {
  history.back();
}

go_disconnect.onclick = (e) => {
  changePage("deconnexion")
}

go_parametre.onclick = (e) => {
  changePage("parametre")
}

window.onpopstate = (e) => {
  reloadPage()
}

connexionForm.onsubmit = (e) => {
  e.preventDefault()
  const data = new FormData(connexionForm)
  connect(data.get("username"), data.get("password"))
}
inscriptionForm.onsubmit = (e) => {
  e.preventDefault()
  const data = new FormData(inscriptionForm)
  const pwd = data.get("new-password")
  const confirm = data.get("confirm-password")
  if (confirm !== pwd) {
    error("Les mots de passe de sont pas les même")
    return
  }
  
  signin(data.get("new-login"), pwd)
}

changeLoginForm.onsubmit = (e) => {
  e.preventDefault()
  const data = new FormData(changeLoginForm)
  const user = currentState.currentUser
  const username = currentState.currentUser.username
  user.username = data.get("change-login")
  putUser(username, user)
}
changePasswordForm.onsubmit = (e) => {
  e.preventDefault()
  const data = new FormData(changePasswordForm)
  const newP = data.get("change-password")
  const confirm = data.get("confirm-change-password")
  const oldP = data.get("old-password")
  putUserPassword(currentState.currentUser.username, oldP, newP)
}
changeColorForm.onsubmit = (e) => {
  e.preventDefault()
  const data = new FormData(changeColorForm)
  const color = data.get("change-color")
  currentState.currentUser.color = color
  reloadPage()
  putUser(currentState.currentUser.username, currentState.currentUser)
}
newNoteForm.onsubmit = (e) => {
  e.preventDefault()
  const data = new FormData(newNoteForm)

  var revision = ""
  for (r of ["Papa","Maman","Frère/Soeur","APC","Étude"]) {
    if (data.get(r)) {
      revision = revision.concat(r,",")
    }
  }
  revision = revision.concat(data.get("autres"))
  if (revision.endsWith(',')) {
    revision = revision.slice(0, -1)
  }

  const newNote = {
    name: (currentState.currentUser.role === 1 && currentState.currentEleve !== "all"? currentState.currentEleve : currentState.currentUser.username),
    matiere: matiereToInt(currentState.currentMatiere),
    date: data.get("new-note-date"),
    notion: data.get("new-note-notion"),
    note: Number(data.get("new-note-note")),
    note2: Number(data.get("new-note-note2")),
    revision: revision,
    satisfaction: Number(data.get("new-note-satisfaction")),
  }

  postNote(newNote)

  modalHide("add-note-modal")
}
changeNoteForm.onsubmit = (e) => {
  e.preventDefault()
  const data = new FormData(changeNoteForm)
  var revision = ""
  for (r of ["Papa","Maman","Frère/Soeur","APC","Étude"]) {
    if (data.get(r)) {
      revision = revision.concat(r,",")
    }
  }
  revision = revision.concat(data.get("autres"))
  if (revision.endsWith(',')) {
    revision = revision.slice(0, -1)
  }
  const noteId = Number(data.get("change-note-id"))
  const oldNote = notes.find(e => e.id === noteId)
  const newNote = {
    name: oldNote.name,
    matiere: oldNote.matiere,
    date: data.get("change-note-date"),
    notion: data.get("change-note-notion"),
    note: Number(data.get("change-note-note")),
    note2: Number(data.get("change-note-note2")),
    revision: revision,
    satisfaction: Number(data.get("change-note-satisfaction")),
  }

  putNote(noteId, newNote)

  modalHide("change-note-modal")
}
supprNoteForm.onsubmit = (e) => {
  e.preventDefault()
  const data = new FormData(supprNoteForm)
  const id = Number(data.get("suppr-note-id"))
  const name = notes.find(n => n.id === id).name
  delNote(id, name)
  modalHide("delete-note-modal")
}
changeUserForm.onsubmit = (e) => {// admin only
  e.preventDefault()
  const data = new FormData(changeUserForm)
  newP = data.get("change-user-password")
  putUserPassword(data.get("change-user-id"), newP, newP)
  modalHide("change-user-modal")
}
supprUserForm.onsubmit = (e) => {// admin only
  e.preventDefault()
  const data = new FormData(supprUserForm)
  delUser(data.get("username"))
  modalHide("delete-user-modal")
}
cartonForm.onsubmit = (e) => {// admin only
  e.preventDefault()
  const data = new FormData(cartonForm)
  cartone(data.get("username"), Number(data.get("carton")), data.get("carton-commentaire"), data.get("carton-date")).then( r => {
      // console.log(r)
      if (r.ok) {
        modalHide("carton-modal")
      } else {
        error(`${r.status} : ${r.statusText}`)
      }
    }
  )
}
getBackup.onsubmit = (e) => { // put jsons in a file
  e.preventDefault()
  const data = new FormData(getBackup)
  getNotes().then(() =>
    getUsers().then(() => {
      var a = window.document.createElement('a');
      a.href = window.URL.createObjectURL(
        new Blob(
          [`[{"notes":${JSON.stringify(notes)}},{"users":${JSON.stringify(students)}}]`],
          {type: 'text/plain'}
        )
      );

      a.download = 'backup.save';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    })
  )
}
sendBackup.onsubmit = (e) => {
  e.preventDefault()
  const data = new FormData(sendBackup) // read the file and send jsons
  file = data.get("backup-file")
  // console.log(file)
  var reader = new FileReader();

  reader.onload = () => {
    const save = JSON.parse(reader.result)
    postNotes(save[0])
    postUsers(save[1])
  }

  reader.readAsText(file)
}