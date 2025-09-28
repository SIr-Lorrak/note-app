document.getElementById("connexion-form").onsubmit = (e) => {
	e.preventDefault()
	const data = new FormData(document.getElementById('connexion-form'))
	connect(data.get("username"), data.get("password"))
}


const headers ={
  	"Content-Type": "application/json"
}

const connect = (username, password) =>
fetch(
	'/api/auth/login', 
	{
		method: "POST",
		mode: "same-origin",
  		credentials: "same-origin",
		headers: headers,
		body: JSON.stringigy({
			username: username,
			password: password,
		})
	},

)
.then(res => console.log(res))
.catch(e => console.log(e));


const observeUser = user => {
	console.log(`eleve ${user}`)
	currentState.currentEleve = user
	changePage('accueil')
	const titles = document.getElementsByClassName('global')
	for (t of titles) {
		t.innerHTML = `Elève ${user}`
	}
}

const changeNoteModal = (note) => {
	const modal = new bootstrap.Modal(document.getElementById("change-note-modal"), {})
	modal.show()
}

const supprNoteModal = (note) => {
	const modal = new bootstrap.Modal(document.getElementById("delete-note-modal"), {})
	modal.show()
}

const changeUserModal = (user) => {
	const modal = new bootstrap.Modal(document.getElementById("change-user-modal"), {})
	modal.show()
}

const cartonUserModal = (user) => {
	const modal = new bootstrap.Modal(document.getElementById("carton-modal"), {})
	modal.show()
}

const supprUserModal = (user) => {
	const modal = new bootstrap.Modal(document.getElementById("delete-user-modal"), {})
	modal.show()
}