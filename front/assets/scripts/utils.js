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

  if (["connexion", "deconnexion", "inscription"].includes(page)) {
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

  upNotes(notes, matiereToInt(newMatiere), currentState.currentEleve)

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


const matieresTable = [ 
  { id:0, value:"general"},
  { id:1, value:"mathematiques"},
  { id:2, value:"francais"},
  { id:3, value:"EMC"},
  { id:4, value:"anglais"},
  { id:5, value:"art"},
  { id:6, value:"musique"},
  { id:7, value:"EPS"},
  { id:8, value:"histoire"},
  { id:9, value:"geographie"},
  { id:10, value:"sciences"},
]
function matiereToInt(matiere) {
  return matieresTable.find(x => x.value === matiere).id
}

function matiereToString(matiere) {
  return matieresTable.find(x => x.id === matiere).value
}

const note2Table = [
  { id:0, value:"NA"},
  { id:1, value:"PA-"},
  { id:2, value:"PA"},
  { id:3, value:"PA+"},
  { id:4, value:"A-"},
  { id:5, value:"A"},
  { id:6, value:"A+"},
]

function note2ToInt(note2) {
  return note2Table.find(x => x.value === note2).id
}

function note2ToString(note2) {
  return note2Table.find(x => x.id === note2).value
}

function moyenne(notes, matiere, eleve) {
  const n = notes.filter(note => (note.name === eleve) && (note.matiere === matiere || matiere === 0))
  const sum = n.reduce((a,b) => a + b.note, 0)
  console.log(sum)
  return n.length === 0 ? "pas de note" : Math.round(sum/n.length*10)/10
}

function notesToHTML(notes, matiere, eleve) { // eleve can be all
  const result = notes
  .filter(note => (note.name == eleve || eleve == 'all') && (note.matiere == matiere || matiere == 0))
  .reduce(
    (r,note) => r.concat(`
        <tr id="line-${note.id}">
          ${eleve == "all"?`<td>${note.name}</td>` : ""}
          ${matiere == 0?`<td>${matiereToString(note.matiere)}</td>` : ""}
          <td>${note.date}</td>
          <td>${note.notion}</td>
          <td>${note.note}</td>
          <td>${note2ToString(note.note2)}</td>
          <td>${note.révision}</td>
          <td>${note.statisfaction}</td>
          <td>
            <span id="change-note-${note.id}" onclick="changeNoteModal(${note.id})"><load-file src="/assets/images/crayon.svg" class="tiny-action"></load-file></span>
            <span id="suppr-note-${note.id}" onclick="supprNoteModal(${note.id})"><load-file src="/assets/images/poubelle.svg" class="tiny-action"></load-file></span>
          </td>
        </tr>
      `),
    `<table>
    <tr>
      ${eleve == "all"?"<th>Elève</th>" : ""}
      ${matiere == 0?"<th>Matière</th>" : ""}
      <th>Date</th>
      <th>Notion</th>
      <th>Note</th>
      <th>Note 2</th>
      <th>Révision</th>
      <th>Satisfaction</th>
      <th>Action</th>
    </tr>`
  )

  return result.concat("</table>")
}
function usersToHTML(users) {
  const result = users
  .reduce(
    (r,user) => r.concat(`
        <tr id="user-${user.username}">
          <td>${user.username}</td>
          <td>${moyenne(notes,0,user.username)}</td>
          <td>${user.commentaire}</td>
          <td>
            <span id="observe-user-${user.username}" onclick="observeUser('${user.username}')"><load-file src="/assets/images/oeil.svg" class="tiny-action"></load-file></span>
            <span id="change-user-${user.username}" onclick="changeUserModal('${user.username}')"><load-file src="/assets/images/parametre.svg" class="tiny-action"></load-file></span>
            <span id="carton-user-${user.username}" onclick="cartonUserModal('${user.username}')"><load-file src="/assets/images/crayon.svg" class="tiny-action"></load-file></span>
            <span id="suppr-user-${user.username}" onclick="supprUserModal('${user.username}')"><load-file src="/assets/images/poubelle.svg" class="tiny-action"></load-file></span>
          </td>
        </tr>
      `),
    `<table>
    <tr>
      <th>Nom</th>
      <th>Moyenne Général</th>
      <th>Carton</th>
      <th>Action</th>
    </tr>`
  )

  return result.concat("</table>")

}

function exosToHTML(exos, matiere, eleve) {

}

function upNotes(notes, matiere, eleve) {
  document.getElementById("historique-tab").innerHTML = notesToHTML(notes, matiere, eleve)
}
function upUsers(users) {
  document.getElementById("eleves-tab").innerHTML = usersToHTML(users)
}

upNotes(notes, 0, currentState.currentEleve)
upUsers(students)