const top_nav = document.getElementById("top_nav")
const connection = document.getElementById("connection")
const accueil = document.getElementById("accueil")
const matiere = document.getElementById("matiere")
const new_note = document.getElementById("new_note")
const historique = document.getElementById("historique")
const statistiques = document.getElementById("statistiques")
const exercices = document.getElementById("exercices")
const parametre = document.getElementById("parametre")

const matieres = document.getElementsByClassName("matiere")

for (const m of matieres) {
	m.onclick = (e) => {
		console.log(`${m.id} selectionné`)
	}
}

accueil.style.background = `rgb(${currentState.currentUser.color.data[0]},${currentState.currentUser.color.data[1]},${currentState.currentUser.color.data[2]})`