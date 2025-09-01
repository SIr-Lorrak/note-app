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
    history.pushState({}, null, page)
  }

  oldPage.classList.toggle("hidden")
  newPage.classList.toggle("hidden")

  if (window.location.pathname.replace(/\//g,'') === '') {
    go_back.classList.add("hidden")
  } else {
    go_back.classList.remove("hidden")
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

function reloadPage() {
  const path = window.location.pathname.replace(/\//g,'')
  if (matiereList.includes(path)) {
    changePage("matiere", false)
    changeMatiere(path)
  } else {
    changePage(path === ''?"accueil":path, false)
  }
}

function changeMatiere(newMatiere) {
  console.log(`matiere ${newMatiere}`)
  window.history.replaceState({}, null, newMatiere)

  matiere.classList.remove(currentState.currentMatiere)
  matiere.classList.add(newMatiere)

  currentState.currentMatiere = newMatiere
}