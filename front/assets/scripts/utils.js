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
    history.pushState({}, null, "/".concat(page))
  }

  oldPage.classList.add("hidden")
  newPage.classList.remove("hidden")

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
  console.log("reload page")
  const page = window.location.pathname.split("/")
  if (matiereList.includes(page[1])) {
    changePage("matiere", false)
    if (page.length > 2) {
      changeOnglet(page[2], false)
    } else {
      changeOnglet("note", false)
    }
    changeMatiere(page[1])
  } else {
    changePage(page[1] === ''?"accueil":page[1], false)
  }
}

function changeMatiere(newMatiere) {
  console.log(`matiere ${newMatiere}`)

  window.history.replaceState({}, null, "/".concat(newMatiere,"/",currentState.currentOnglet))

  matiere.classList.remove(currentState.currentMatiere)
  matiere.classList.add(newMatiere)

  currentState.currentMatiere = newMatiere
}

function changeOnglet(newOnglet, prec = true) {
  console.log(`onglet ${newOnglet}`)
  document.getElementById(currentState.currentOnglet).classList.remove('selected')
  document.getElementById(currentState.currentOnglet.concat("-content")).classList.add('none')

  if (prec) {
    history.pushState({}, null, "/".concat(currentState.currentMatiere,"/",newOnglet))
  }

  document.getElementById(newOnglet).classList.add('selected')
  document.getElementById(newOnglet.concat("-content")).classList.remove('none')

  currentState.currentOnglet = newOnglet
}

function alerte(type, msg) {
  let content = ""
  if (type === 'error') {
    content = `<load-file src="/assets/images/croix.svg" class="tiny-alarm"></load-file> ${msg}`
  } else if (type === 'success') {
    content = `<load-file src="/assets/images/valide.svg" class="tiny-alarm"></load-file> ${msg}`
  } else if (type === 'warning') {
    content = `<load-file src="/assets/images/attention.svg" class="tiny-alarm"></load-file> ${msg}`
  } else {
    content = `<load-file src="/assets/images/exclamation.svg" class="tiny-alarm"></load-file> ${msg}`
  }

  const alerte = document.createElement("div")
  alerte.classList.add(type)
  alerte.innerHTML = content

  feedback.appendChild(alerte)

  setTimeout(() => alerte.classList.add("hidden"), 2000)
  setTimeout(() => alerte.remove(), 3000)

}

function error(msg) {
  alerte('error',msg)
}
function success(msg) {
  alerte('success',msg)
}
function warning(msg) {
  alerte('warning',msg)
}
function info(msg) {
  alerte('info',msg)
}