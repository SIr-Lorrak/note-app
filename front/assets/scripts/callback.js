
// ~~~~~~~~~~~~~~~~FETCHING DATA~~~~~~~~~~~~~~~~~~

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

const delNote = (id, name) => 
fetch(
	`/api/note/${encodeURIComponent(id)}`, 
	{
		method: "DELETE",
		mode: "same-origin",
  		credentials: "same-origin",
		headers: headers,
  		body: JSON.stringify({name: name})
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
		currentState.currentEleve = currentState.currentUser.role === 1? 'all' : currentState.currentUser.username
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


// ~~~~~~~~~~~~~~~FILL FORMS~~~~~~~~~~~~~~~~

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