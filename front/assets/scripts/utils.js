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

function week(date) {
  return new Date(date).getWeek()
}

function getAccueil() {
  if (currentState.connected === false) {
    return "connexion"
  }
  if (currentState.currentUser.role === 0) {
    return "accueil"
  }
  if (currentState.currentUser.role === 1) {
    return "eleves"
  }
}
function getAuthorizedPages() {
  if (currentState.connected === false) {
    return ["connexion","inscription"]
  }
  const elevePages = ["accueil", "parametre", "deconnexion", "matiere", "parametre"]
  if (currentState.currentUser.role === 0) {
    return elevePages
  }
  if (currentState.currentUser.role === 1) {
    return elevePages.concat(["eleves", "backup"])
  }
}

function getPage(page) {
  if (!getAuthorizedPages().includes(page)) {
    return getAccueil()
  }
  return page
}

function changePage(tryPage, prec = true) {
  // console.log(`page ${tryPage}`)
  const page = getPage(tryPage)
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

  if (page === getAccueil()) {
    go_home.classList.add("hidden")
  } else {
    go_home.classList.remove("hidden")
  }

  if (page === "parametre") {
    go_parametre.classList.add("hidden")
  } else {
    go_parametre.classList.remove("hidden")
  }

  if (["connexion", "deconnexion", "inscription", "loading"].includes(page)) {
    go_disconnect.classList.add("hidden")
    go_back.classList.add("hidden")
    go_home.classList.add("hidden")
    go_parametre.classList.add("hidden")
  } else {
    go_disconnect.classList.remove("hidden")
  }

  currentState.currentPage = page
  return page === tryPage
}

function reloadPage() {
  document.body.style.background = currentState.currentUser.color
  document.getElementById("change-color").value = currentState.currentUser.color
  document.getElementById("change-login").value = currentState.currentUser.username
  
  if (currentState.currentUser.role === 1) {
    observeUser(currentState.currentEleve, false)
  } else {
    const titles = document.getElementsByClassName('global')
    for (t of titles) {
      t.innerHTML = ''
    }
  }
  // console.log("reload page")
  const page = window.location.pathname.split("/")
  if (matiereList.includes(page[1])) {
    if (changePage("matiere", false)) {
      if (page.length > 2) {
        changeOnglet(page[2], false)
      } else {
        changeOnglet("note", false)
      }
      changeMatiere(page[1])
    }
  } else {
    changePage(page[1] === ''?getAccueil():page[1], false)
  }
}

function changeMatiere(newMatiere) {
  // console.log(`matiere ${newMatiere}`)

  window.history.replaceState({}, null, "/".concat(newMatiere,"/",currentState.currentOnglet))

  upNotes(notes, matiereToInt(newMatiere), currentState.currentEleve)

  matiere.classList.remove(currentState.currentMatiere)
  matiere.classList.add(newMatiere)

  currentState.currentMatiere = newMatiere
}

function changeOnglet(newOnglet, prec = true) {
  // console.log(`onglet ${newOnglet}`)
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
  { id:1, value:"francais"},
  { id:2, value:"mathematiques"},
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

function toEmoji(humeur) {
  const emojis = ["💀","😣","🤔","😊","🤩"]
  return emojis[humeur-1]
}
function cartonToEmoji(carton) {
  const emojis = ["","⬜","🟨","🟥"]
  return emojis[carton]
}

function moy(notes) {
  sum = notes.reduce((a,b) => a + b.note, 0)
  l = notes.length
  return l === 0 ? 0 : Math.round(sum/l*10)/10
}

function moyenne(notes, matiere, eleve) {
  if (matiere === 0) {
    return moyenneG(notes, eleve)
  }
  if (eleve === 'all') {
    return moyenneClasse(notes, students, matiere)
  }
  const n = notes.filter(note => (note.name === eleve) && (note.matiere === matiere))
  const sum = n.reduce((a,b) => a + b.note, 0)
  return n.length === 0 ? "pas de note" : Math.round(sum/n.length*10)/10
}

function moyenneG(notes, eleve) {
  if (eleve === 'all') {
    return moyenneClasse(notes, students)
  }
  var total = 0
  var nbMat = 0
  const ne = notes.filter(e => e.name === eleve)
  for (let i = 1; i <= 10; i++) {
    const n = ne.filter(e => e.matiere === i)
    if (n.length !== 0) {
      total += n.reduce((a,b) => a + b.note, 0)
      nbMat++
    }
  }
  return nbMat === 0 ? "pas de note" : Math.round(total/nbMat*10)/10
}

function moyenneClasse(notes, eleves, matiere=0) {
  var total = 0
  var nbEle = 0
  for (let eleve of eleves) {
    const m = matiere === 0 ? moyenneG(notes, eleve) : moyenne(notes, matiere, eleve)
    if (m !== "pas de note") {
      total += m
      nbEle++
    }
  }
  return nbEle === 0 ? "pas de note" : Math.round(total/nbEle*10)/10
}

function notesToHTML(notes, matiere, eleve) { // eleve can be all
  const result = notes
  .reduce(
    (r,note) => r.concat(`
        <tr id="line-${note.id}" class="line-${matiere === 0?matiereToString(note.matiere):"normal"}">
          ${eleve === "all"?`<td>${note.name}</td>` : ""}
          ${matiere === 0?`<td class="${matiereToString(note.matiere)}-td">${matiereToString(note.matiere)}</td>` : ""}
          <td>${new Date(note.date).toLocaleDateString("fr")}</td>
          <td>${note.notion}</td>
          <td>${note.note}</td>
          <td>${note2ToString(note.note2)}</td>
          <td>${note.revision}</td>
          <td>${toEmoji(note.satisfaction)}</td>
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
          <td>${moyenneG(notes,user.username)}</td>
          <td>${cartonToEmoji(user.carton)}${user.commentaire}</td>
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
      <th>Moyenne Générale</th>
      <th>Carton</th>
      <th>Action</th>
    </tr>`
  )

  return result.concat(`</table><br/>
    <button type="button" class="btn btn-primary center" onclick="observeUser('all')"><load-file src="/assets/images/oeil.svg" class="tiny-action"></load-file> tous</button>`)

}

function exosToHTML(exos, matiere, eleve) {

}

function cartonToHTML(lvl, date, text) {
  if (lvl === 0 || (lvl === 1 && week(date) !== week(today))) {
    return `<div class="carton">Tu n'as pas de cartons actuellement (continue comme ça !)</div>`
  }
  return `<div class="carton carton${lvl}">${text}</div>`
}

function upStats(notes, matiere, eleve) {

}

function upNotes(notes, matiere, eleve) {
  notes = notes.filter(note => (note.name == eleve || eleve == 'all') && (note.matiere == matiere || matiere == 0))
  document.getElementById("historique-tab").innerHTML = notesToHTML(notes, matiere, eleve)
  upStats(notes, matiere, eleve)
}

function upCarton(user) {
  document.getElementById("avertissement-content").innerHTML = user === undefined? 'Pas de punition collective enfin :P' : cartonToHTML(user.carton, user.datecarton, user.commentaire)
}

function upToiles(notes, eleve) {
  if (currentState.toile !== undefined) {
    currentState.toile.destroy()
  }

  notes = notes.filter(e => e.name === eleve || eleve === 'all')

  const moyennes = []
  for (const m of matieresTable) {
    if (m.id !== 0) {
      const matiereNotes = notes.filter(e => e.matiere === m.id)
      moyennes.push(moy(matiereNotes))
    }
  }
  const ctx = document.getElementById('toile-moyenne');
  const data = {
    labels: [
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      ''
    ],
    datasets: [{
      label: 'Moyenne',
      data: moyennes,//TODO: remplir avec les moyennes
      fill: true,
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgb(255, 99, 132)',
      pointBackgroundColor: 'rgb(255, 99, 132)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgb(255, 99, 132)'
    }]
  };

  const optionsDefault = {
    responsive: true,
      elements: {
        line: {
          borderWidth: 3
        }
      },
      plugins: {
        legend: {
            display: false,
        } 
      },
      scales: {
          r: {
              angleLines: {
                  display: true,
                  color: 'DimGray'
              },
              grid: {
                color: 'DimGray',
                circular:true
              },
              suggestedMin: 0,
              suggestedMax: 100,
            ticks: {
          font: {
                size: 25
              }
            }
          }
      }
   }

  const config = {
    type: 'radar',
    data: data,
    options: optionsDefault,
  };

  const canvas = document.getElementById('toile-moyenne');

  currentState.toile = new Chart(canvas, config)
}

function upUsers(users) {
  document.getElementById("eleves-tab").innerHTML = usersToHTML(users)
}

function modalShow(id) {
  const modal = new bootstrap.Modal(document.getElementById(id), {})
  modal.show()
}

function modalHide(id) {
  document.getElementById(`${id}-close`).click()
}