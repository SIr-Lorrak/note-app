customElements.define("load-file", class extends HTMLElement {
  async connectedCallback(
    src = this.getAttribute("src"),
  ) {
    this.innerHTML = await (await fetch(src)).text()
  }
})

Date.prototype.getWeek = function() {
  var onejan = new Date(this.getFullYear(), 0, 1);
  var millisecsInDay = 86400000;
  const weekDay = Math.ceil((((this - onejan) / millisecsInDay) + onejan.getDay()) / 7);
  return weekDay === 53 ? 1 : weekDay
};

function changePage(page, prec = true) {
  console.log(`page ${page}`)
  oldPage = document.getElementById(currentState.currentPage)
  const newPage = document.getElementById(page)

  if (prec) {
    currentState.prec.push(currentState.currentPage)
  }

  oldPage.classList.toggle("hidden")
  newPage.classList.toggle("hidden")

  if (currentState.prec.length >= 1) {
    go_back.classList.remove("hidden")
  } else {
    go_back.classList.add("hidden")
  }

  if (page === "accueil") {
    go_home.classList.add("hidden")
  } else {
    go_home.classList.remove("hidden")
  }

  if (page === "parametre") {
    go_parametre.classList.add("hidden")
  } else {
    go_parametre.classList.remove("hidden")
  }

  if (page === "connexion" || page === "deconnexion") {
    go_disconnect.classList.add("hidden")
    go_back.classList.add("hidden")
    go_home.classList.add("hidden")
    go_parametre.classList.add("hidden")
  } else {
    go_disconnect.classList.remove("hidden")
  }


  currentState.currentPage = page
}

function precPage() {
  var oldPM = currentState.prec.pop()
  if (matiereList.includes(oldPM)) {
    changeMatiere(oldPM, false)
    oldPM = currentState.prec.pop()
  }
  changePage(oldPM, false)

}

function changeMatiere(newMatiere, prec=true) {
  console.log(`matiere ${newMatiere}`)
  if (prec) {
    currentState.prec.push(currentState.currentMatiere)
  }

  matiere.classList.remove(currentState.currentMatiere)
  matiere.classList.add(newMatiere)

  currentState.currentMatiere = newMatiere
}