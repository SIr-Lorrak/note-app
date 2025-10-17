whoami()
//reloadPage()
//upUsers(students)
//upToiles(notes, currentState.currentEleve)
document.getElementById('new-note-date').value = today
document.getElementById('carton-date').value = today

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
