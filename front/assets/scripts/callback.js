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
	delNote(Number(data.get("suppr-note-id")))
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
	getNotes().then( () => 
		getUsers().then(() => {
			var a = window.document.createElement('a');
			a.href = window.URL.createObjectURL(
				new Blob(
					[`{"notes":${JSON.stringify(notes)}};{"users":${JSON.stringify(students)}}`],
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
		const save = reader.result.split(";")
		postNotes(save[0])
		postUsers(save[1])
	}

	reader.readAsText(file)
}

const headers ={
  	"Content-Type": "application/json"
}

const disconnect = (first = true) => {
	currentState.connected = false
	const color = currentState.currentUser.color
	currentState.currentUser = {color: color}
	students = []
	notes = []
	document.cookie = "Connected=disconnect; max-age=34560000; samesite=strict; secure; path=/";
	if (first) {
		whoami(false)
	}
	reloadPage()
}

const getNotes = () => {
	const name = currentState.currentUser.role === 1? "all" : currentState.currentUser.username 
	return fetch(
		`/api/note/${encodeURIComponent(name)}`,
		{
			method: "GET",
			mode: "same-origin",
			credentials: "same-origin",
			headers: headers,
		},
	)
	.then(res => {
		if (!res.ok) {
			throw res
			return res
		}
		return res.json().then( j => {
				notes = j
				upNotes(notes, matiereToInt(currentState.currentMatiere), name)
				upToiles(notes, name)
				upUsers(students)
			}
		)
	})
	.catch(e => {
		if (e.status === 403) {	
			disconnect()
		}
		return e
	})
}

const postNote = (note) => 
fetch(
	'/api/note', 
	{
		method: "POST",
		mode: "same-origin",
  		credentials: "same-origin",
		headers: headers,
		body: JSON.stringify(note)
	},
)
.then(res => {
	if (!res.ok) {
		throw res
		return res
	}
	getNotes()
	return res
})
.catch(e => {
	if (e.status === 403) {	
		disconnect()
	}
	return e
})

const postNotes = (notes) => 
fetch(
	'/api/note/many', 
	{
		method: "POST",
		mode: "same-origin",
  		credentials: "same-origin",
		headers: headers,
		body: notes
	},
)
.then(res => {
	if (!res.ok) {
		throw res
		return res
	}
	getNotes()
	return res
})
.catch(e => {
	if (e.status === 403) {	
		disconnect()
	}
	return e
})

const putNote = (id, note) => 
fetch(
	`/api/note/${encodeURIComponent(id)}`, 
	{
		method: "PUT",
		mode: "same-origin",
  		credentials: "same-origin",
		headers: headers,
		body: JSON.stringify(note)
	},
)
.then(res => {
	if (!res.ok) {
		throw res
		return res
	}
	getNotes()
	return res
})
.catch(e => {
	if (e.status === 403) {	
		disconnect()
	}
	return e
})

const delNote = (id) => 
fetch(
	`/api/note/${encodeURIComponent(id)}`, 
	{
		method: "DELETE",
		mode: "same-origin",
  		credentials: "same-origin",
	},
)
.then(res => {
	if (!res.ok) {
		throw res
		return res
	}
	getNotes()
	return res
})
.catch(e => {
	if (e.status === 403) {	
		disconnect()
	}
	return e
})

const getUsers = () => 
fetch(
	`/api/user`,
	{
		method: "GET",
		mode: "same-origin",
  		credentials: "same-origin",
		headers: headers,
	},
)
.then(res => {
	if (!res.ok) {
		throw res
		return res
	}
	return res.json().then( j => {
			students = j
			upUsers(students)
		}
	)
})
.catch(e => {
	if (e.status === 403) {	
		disconnect()
	}
	return e
})

const postUsers = (users) => 
fetch(
	'/api/user/many', 
	{
		method: "POST",
		mode: "same-origin",
  		credentials: "same-origin",
		headers: headers,
		body: users
	},
)
.then(res => {
	if (!res.ok) {
		throw res
		return res
	}
	getUsers()
	return res
})
.catch(e => {
	if (e.status === 403) {	
		disconnect()
	}
	return e
})

const putUser = (username, user) => 
fetch(
	`/api/user/${encodeURIComponent(username)}`, 
	{
		method: "PUT",
		mode: "same-origin",
  		credentials: "same-origin",
		headers: headers,
		body: JSON.stringify(user)
	},
)
.then(res => {
	if (!res.ok) {
		throw res
		return res
	}
	whoami()
	getEverything()
	return res
})
.catch(e => {
	if (e.status === 403) {	
		disconnect()
	}
	if (e.status === 409) {
		error("Ce nom est déjà utilisé")
	}
	return e
})

const putUserPassword = (username, oldPass, newPass) => 
fetch(
	`/api/user/${encodeURIComponent(username)}/password`, 
	{
		method: "PUT",
		mode: "same-origin",
  		credentials: "same-origin",
		headers: headers,
		body: JSON.stringify({
			oldPassword: oldPass,
			newPassword: newPass,
		})
	},
)
.then(res => {
	if (!res.ok) {
		throw res
		return res
	}
	whoami()
	return res
})
.catch(e => {
	if (e.status === 403) {	
		disconnect()
	}
	return e
})

const delUser = (username) => 
fetch(
	`/api/user/${encodeURIComponent(username)}`, 
	{
		method: "DELETE",
		mode: "same-origin",
  		credentials: "same-origin",
	},
)
.then(res => {
	if (!res.ok) {
		throw res
		return res
	}
	whoami()
	return res
})
.catch(e => {
	if (e.status === 403) {	
		disconnect()
	}
	return e
})

const cartone = (username, carton, commentaire, date) => 
fetch(
	`/api/user/${encodeURIComponent(username)}/carton`, 
	{
		method: "PUT",
		mode: "same-origin",
  		credentials: "same-origin",
		headers: headers,
		body: JSON.stringify({
			carton: carton,
			commentaire: commentaire,
			datecarton: date,
		})
	},
)
.then(res => {
	if (!res.ok) {
		throw res
		return res
	}
	getEverything()
	return res
})
.catch(e => {
	if (e.status === 403) {	
		disconnect()
	}
	return e
})


const getEverything = () => {
	getNotes().then (() => {
		if (currentState.currentUser.role === 1) {
		getUsers().then(() => upCarton(students.find(e => e.username === currentState.currentEleve)))
		} else {
			upCarton(currentState.currentUser)
		}
	})
	
}

const connect = (username, password) =>
fetch(
	'/api/auth/login', 
	{
		method: "POST",
		mode: "same-origin",
  		credentials: "same-origin",
		headers: headers,
		body: JSON.stringify({
			username: username,
			password: password,
		})
	},

)
.then(res => {
	if (!res.ok) {
		throw res
		return res
	}
	whoami()
})
.catch(e => {
	if (e.status === 403) {	
		disconnect()
	}
	error("Mauvais Nom ou Mot de passe")
	return e
});



const signin = (username, password) => 
fetch(
	'/api/user', 
	{
		method: "POST",
		mode: "same-origin",
  		credentials: "same-origin",
		headers: headers,
		body: JSON.stringify({
			username: username,
			password: password,
		})
	},

)
.then(res => {
	if (!res.ok) {
		throw res
		return res
	}
	connect(username,password)
})
.catch(e => {
	if (e.status === 403) {	
		disconnect()
	}
	if (e.status === 409) {
		error("Ce nom est déjà utilisé")
	}
	return e
})

const whoami = (deco = true) => 
fetch(
	'/api/user/me',
	{
		method: "GET",
		mode: "same-origin",
  		credentials: "same-origin",
		headers: headers,
	},
)
.then(res => {
	if (!res.ok) {
		throw res
		return res
	}
	return res.json().then( j => {
		currentState.connected = true
		currentState.currentUser = j
		reloadPage()
		getEverything()
	})
})
.catch(e => {
	if (e.status === 403) {
		if (deco) {
			disconnect(false)
		}
	}
	reloadPage()
	return e
})


const observeUser = (user, byclick = true) => { // function only used by admin
	// console.log(`eleve ${user}`)
	currentState.currentEleve = user
	if (byclick) {
		changePage('accueil')
	}
	const titles = document.getElementsByClassName('global')
	for (t of titles) {
		t.innerHTML = user === 'all' ? "Tous les élèves" : `Elève ${user}`
	}
	upToiles(notes, user)
	upCarton(students.find(e => e.username === user))
}

const changeNoteModal = (note) => {//TODO : charger la note et son id dans le formulaire
	document.getElementById("change-note-id").value = note
	const n = notes.find(e => e.id === note)
	document.getElementById("change-note-date").value = n.date.split("T")[0]
	document.getElementById("change-note-notion").value = n.notion
	document.getElementById("change-note-note").value = n.note
	document.getElementById("change-note-" + note2ToString(n.note2)).checked = true
	document.getElementById("change-star" + n.satisfaction).checked = true

	const revisions = n.revision.split(',')
	const rCheckable = ["Papa","Maman","Frère/Soeur","APC","Étude"]
	for (const r of rCheckable) {
		const rBox = document.getElementById("change-note-" + r.toLowerCase())
		if (revisions.includes(r)) {
			rBox.checked = true
		} else {
			rBox.checked = false
		}
	}

	document.getElementById("change-note-autres").value = revisions.filter(e => !rCheckable.includes(e)).reduce((a,b) => a + (a !== '' ? ',':'') + b, '')

	const modal = new bootstrap.Modal(document.getElementById("change-note-modal"), {})
	modal.show()
}

const supprNoteModal = (note) => {//TODO : charger l'id de la note dans le formulaire
	document.getElementById("suppr-note-id").value = note
	modalShow("delete-note-modal")
}

const changeUserModal = (user) => {//TODO : charger l'utilisateur dans le formulaire
	document.getElementById("change-user-name").innerHTML = user
	document.getElementById("change-user-id").value = user
	modalShow("change-user-modal")
}

const cartonUserModal = (user) => {//TODO : charger l'id du user dans le formulaire
	document.getElementById("carton-user-name")
	.innerHTML = user
	document.getElementById("carton-user-id").value = user
	modalShow("carton-modal")
}

const supprUserModal = (user) => {//TODO : charger l'id du user dans le formulaire
	document.getElementById("suppr-user-name").innerHTML = user
	document.getElementById("suppr-user-id").value = user
	modalShow("delete-user-modal")
}