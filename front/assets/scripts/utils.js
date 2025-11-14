customElements.define("load-file", class extends HTMLElement {

  static observedAttributes = ['src'];

  constructor() {
    super();
  }

  async connectedCallback() {
    this.innerHTML = await (await fetch(this.src)).text()
  }

  async attributeChangedCallback(name, oldValue, newValue) {
    if (name === "src") {
      this.src = newValue
      this.innerHTML = await (await fetch(this.src)).text()
    }
  }
})

function getInfo() {
  if (currentState.currentEleve !== 'all' && currentState.currentUser.role === 1) {
    return "#" + currentState.currentEleve
  }
  return ""
}

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
    const info = page === getAccueil()? "" : getInfo()
    history.pushState({}, null, "/".concat(page, info))
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
  const info = window.location.hash.split("#")[1]
  currentState.currentEleve = decodeURI((info === null || info === undefined? "all": info))
  
  if (currentState.currentUser.role === 1) {
    observeUser(currentState.currentEleve, false)
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

  window.history.replaceState({}, null, "/".concat(newMatiere,"/",currentState.currentOnglet,getInfo()))

  upNotes(notes, matiereToInt(newMatiere), currentState.currentEleve)

  matiere.classList.remove(currentState.currentMatiere)
  matiere.classList.add(newMatiere)

  currentState.currentMatiere = newMatiere

  const avatar = currentState.currentEleve === 'all' ? currentState.currentUser.avatar.data[0] : students.find(s => s.username === currentState.currentEleve).avatar.data[0]
  upAvatar(avatar, newMatiere)
}

function changeOnglet(newOnglet, prec = true) {
  // console.log(`onglet ${newOnglet}`)
  document.getElementById(currentState.currentOnglet).classList.remove('selected')
  document.getElementById(currentState.currentOnglet.concat("-content")).classList.add('none')

  if (prec) {
    history.pushState({}, null, "/".concat(currentState.currentMatiere,"/",newOnglet,getInfo()))
  }

  document.getElementById(newOnglet).classList.add('selected')
  document.getElementById(newOnglet.concat("-content")).classList.remove('none')

  currentState.currentOnglet = newOnglet
}

const observeUser = (user, byclick = true) => { // function only used by admin
  // console.log(`eleve ${user}`)
  currentState.currentEleve = user
  if (byclick) {
    changePage('accueil')
  }
  const titles = document.getElementsByClassName('global-label')
  for (t of titles) {
    t.innerHTML = user === 'all' ? "Tous les élèves" : `Elève ${user}`
  }
  upToiles(notes, user)
  const stud = students.find(e => e.username === user)
  upCarton(stud)
  upAvatar(user === 'all' ? currentState.currentUser.avatar.data[0] : stud.avatar.data[0])
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
  { id:0, value: "general"},
  { id:1, value: "francais"},
  { id:2, value: "mathematiques"},
  { id:3, value: "EMC"},
  { id:4, value: "anglais"},
  { id:5, value: "art"},
  { id:6, value: "musique"},
  { id:7, value: "EPS"},
  { id:8, value: "histoire"},
  { id:9, value: "geographie"},
  { id:10, value:"sciences"},
]

function matiereToInt(matiere) {
  return matieresTable.find(x => x.value === matiere).id
}

function matiereToString(matiere) {
  return matieresTable.find(x => x.id === matiere).value
}

const matieresColors = [ 
  "black",
  "DodgerBlue",
  "crimson",
  "BurlyWood",
  "DimGray",
  "RebeccaPurple",
  "DeepPink",
  "sienna",
  "Gold",
  "Tomato",
  "Green",
]

function matiereToColor(matiere) {
  return matieresColors[matiere]
}

const matieresColors2 = [ 
  "white",
  "LightSkyBlue",
  "LightCoral",
  "bisque",
  "Silver",
  "MediumOrchid",
  "HotPink",
  "Peru",
  "Yellow",
  "Orange",
  "LimeGreen",
]

function matiereToColor2(matiere) {
  return matieresColors2[matiere]
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
  return n.length === 0 ? "pas de note" : moy(n)
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
      total += moy(n)
      nbMat++
    }
  }
  return nbMat === 0 ? "pas de note" : Math.round(total/nbMat*10)/10
}

function moyenneClasse(notes, eleves, matiere=0) {
  var total = 0
  var nbEle = 0
  for (let eleve of eleves) {
    const m = matiere === 0 ? moyenneG(notes, eleve.username) : moyenne(notes, matiere, eleve.username)
    if (m !== "pas de note") {
      total += m
      nbEle++
    }
  }
  return nbEle === 0 ? "pas de note" : Math.round(total/nbEle*10)/10
}

function notesToHTML(notes, matiere, eleve, allTable=true) { // eleve can be all
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
    allTable?`<table class="table-${matiereToString(matiere)}">
    <thead id="table-head-notes">
    <tr>
      ${eleve == "all"?`<th>Elève <span onclick="trierPar('name')"><load-file src="/assets/images/triangle.svg" class="filter infobulle" id="trier-name" aria-label="trier par nom"></load-file></span></th>` : ""}
      ${matiere == 0?`<th>Matière <span onclick="trierPar('matiere')"><load-file src="/assets/images/triangle.svg" class="filter infobulle" id="trier-matiere" aria-label="trier par matière"></load-file></span></th>` : ""}
      <th>Date <span onclick="trierPar('date')"><load-file src="/assets/images/triangle.svg" class="filter infobulle down" id="trier-date" aria-label="trier par date"></load-file></span></th>
      <th>Notion <span onclick="trierPar('notion')"><load-file src="/assets/images/triangle.svg" class="filter infobulle" id="trier-notion" aria-label="trier par notion"></load-file></span></th>
      <th>Note <span onclick="trierPar('note')"><load-file src="/assets/images/triangle.svg" class="filter infobulle" id="trier-note" aria-label="trier par note"></load-file></span></th>
      <th>Note 2 <span onclick="trierPar('note2')"><load-file src="/assets/images/triangle.svg" class="filter infobulle" id="trier-note2" aria-label="trier par note2"></load-file></span></th>
      <th>Révision <span onclick="trierPar('revision')"><load-file src="/assets/images/triangle.svg" class="filter infobulle" id="trier-revision" aria-label="trier par révision"></load-file></span></th>
      <th>Satisfaction <span onclick="trierPar('satisfaction')"><load-file src="/assets/images/triangle.svg" class="filter infobulle" id="trier-satisfaction" aria-label="trier par satisfaction"></load-file></span></th>
      <th>Action</th>
    </tr>
    </thead><tbody id="table-body-notes">` : ""
  )

  return result.concat(allTable?"</tbody></table>":"")
}
function usersToHTML(users) {
  const result = users
  .reduce(
    (r,user) => r.concat(`
        <tr id="user-${user.username}">
          <td><img class="avatar-eleve-img" src="/assets/images/avatar/${user.avatar.data[0]}.png"/>${user.username}</td>
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
  const content = document.getElementById("stats-content")
  content.classList.remove("none")
  const fallback = document.getElementById("stats-fallback")
  if (notes.length === 0) {
    fallback.innerHTML = `Tu n'as pas encore de notes en ${matiereToString(matiere)}`
    content.classList.add("none")
    return
  }
  const mean = moyenne(notes, matiere, eleve)
  const lastNote = notes.reduce((a,b) => a.date > b.date? a : b)
  fallback.innerHTML = `ta dernière note est ${lastNote.note}%, ce qui a fait ${lastNote.note < mean? "baisser" : "monter"} ta moyenne !`
  upLine(notes, matiere, eleve)
  document.getElementById("insert-moyenne").innerHTML = `Ton taux de réussite ${matiere === 0? "général" : `en ${matiereToString(matiere)}`} est en moyenne de ${moyenne(notes, matiere, eleve)}%`
  upPie(notes, matiere)
  upBox(notes, matiere)
  upDonuts(notes, matiere)
}

function upNotes(notes, matiere, eleve, allTable = true) {
  if (allTable) {
    currentState.triFunc = orderByDateInv
    currentState.tri = 'date'
    currentState.inv = true
  }
  notes = notes.filter(note => (note.name == eleve || eleve == 'all') && (note.matiere == matiere || matiere == 0)).sort(currentState.triFunc)
  const html = allTable ? document.getElementById("historique-tab") : document.getElementById("table-body-notes")
  html.innerHTML = notesToHTML(notes, matiere, eleve, allTable)
  if (allTable) {
    upStats(notes, matiere, eleve)
  }
}

function upCarton(user) {
  document.getElementById("avertissement-content").innerHTML = user === undefined? 'Pas de punition collective enfin :P' : cartonToHTML(user.carton, user.datecarton, user.commentaire)
}

function orderByDate(note1, note2) {
  const date1 = new Date(note1.date)
  const date2 = new Date(note2.date)
  return date1-date2
}

function orderByDateInv(note1, note2) {
  const date1 = new Date(note1.date)
  const date2 = new Date(note2.date)
  return date2-date1
}

function orderByMatiere(note1, note2) {
  return note1.matiere-note2.matiere
}

function orderByMatiereInv(note1, note2) {
  return note2.matiere-note1.matiere
}

function orderByNote(note1, note2) {
  return note1.note-note2.note
}

function orderByNoteInv(note1, note2) {
  return note2.note-note1.note
}

function orderByNote2(note1, note2) {
  return note1.note2-note2.note2
}

function orderByNote2Inv(note1, note2) {
  return note2.note2-note1.note2
}

function orderBySatisfaction(note1, note2) {
  return note1.satisfaction-note2.satisfaction
}

function orderBySatisfactionInv(note1, note2) {
  return note2.satisfaction-note1.satisfaction
}

function orderByRevision(note1, note2) {
  return note1.revision.localeCompare(note2.revision)
}

function orderByRevisionInv(note1, note2) {
  return note2.revision.localeCompare(note1.revision)
}

function orderByName(note1, note2) {
  return note1.name.localeCompare(note2.name)
}

function orderByNameInv(note1, note2) {
  return note2.name.localeCompare(note1.name)
}

function orderByNotion(note1, note2) {
  return note1.notion.localeCompare(note2.notion)
}

function orderByNotionInv(note1, note2) {
  return note2.notion.localeCompare(note1.notion)
}

function trierPar(type) {
  currentState.inv = !(currentState.tri === type && currentState.inv)
  document.getElementById(`trier-${currentState.tri}`).classList.remove('up')
  document.getElementById(`trier-${currentState.tri}`).classList.remove('down')
  currentState.tri = type
  document.getElementById(`trier-${type}`).classList.add((currentState.inv? 'down':'up'))
  if (type==='name') {
    if (!currentState.inv) {
      currentState.triFunc = orderByName
    } else {
      currentState.triFunc = orderByNameInv
    }
  } else if (type==='matiere') {
    if (!currentState.inv) {
      currentState.triFunc = orderByMatiereInv
    } else {
      currentState.triFunc = orderByMatiere
    }
  } else if (type==='date') {
    if (!currentState.inv) {
      currentState.triFunc = orderByDate
    } else {
      currentState.triFunc = orderByDateInv
    }
  } else if (type==='note') {
    if (!currentState.inv) {
      currentState.triFunc = orderByNote
    } else {
      currentState.triFunc = orderByNoteInv
    }
  } else if (type==='note2') {
    if (!currentState.inv) {
      currentState.triFunc = orderByNote2
    } else {
      currentState.triFunc = orderByNote2Inv
    }
  } else if (type==='revision') {
    if (!currentState.inv) {
      currentState.triFunc = orderByRevisionInv
    } else {
      currentState.triFunc = orderByRevision
    }
  } else if (type==='satisfaction') {
    if (!currentState.inv) {
      currentState.triFunc = orderBySatisfaction
    } else {
      currentState.triFunc = orderBySatisfactionInv
    }
  } else if (type==='notion') {
    if (!currentState.inv) {
      currentState.triFunc = orderByNotionInv
    } else {
      currentState.triFunc = orderByNotion
    }
  }
  upNotes(notes, matiereToInt(currentState.currentMatiere), currentState.currentEleve, false)
}

function upLine(notes, matiere, eleve) {
  if (notes.length === 0) {
    return
  }

  const data = {
    datasets: [],
  }


  const dateMin = new Date(notes.reduce((a, b) => a.date < b.date ? a : b).date)
  const dateMax = new Date(notes.reduce((a, b) => a.date > b.date ? a : b).date)

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
          display: false,
      },
      annotation: {
        clip: false,
        annotations: {}
      }
    },
    scales: {
      x: {
        min: dateMin,
        type: 'time',
        time: {
          unit: 'month',
          displayFormats: {
            month: 'MMM YYYY'
          }
        }
      },
      y: {
        min: 0,
        max: 100,
      }
    }
  }

  notes = notes.sort(orderByDate)
  if (eleve === 'all') {
    for (const student of students) {
      const n = notes.filter(note => note.name === student.username).reduce((a,b) => ({
        data: a.data.concat({x:new Date(b.date), y:b.note }),
        color1: a.color1.concat(matiereToColor(b.matiere)),
        color2 :a.color2.concat(matiereToColor2(b.matiere)),
      }), ({color1:[], color2:[], data:[]}))

      if (n.data.length > 0) {
        data.datasets.push({
          label: student.username,
          data: n.data,
          pointBackgroundColor: n.color2,
          pointBorderColor: n.color1,
          fill: false,
          pointRadius: 10,
          borderColor: student.color === '#ffffff' ? 'Gainsboro':student.color,
          tension: 0.1,
        })
        options.plugins.annotation.annotations[student.username] = {
          type: 'label',
          xValue: n.data[n.data.length-1].x-((dateMax-dateMin)/25),
          yValue: n.data[n.data.length-1].y-5,
          backgroundColor: '#ffffff00',
          color: student.color === '#ffffff' ? 'Gainsboro':student.color,
          content: [student.username],
          textAlign: 'start'
        }
      }
    }
  } else {
    const n = notes.reduce((a,b) => ({
      data: a.data.concat({x:new Date(b.date), y:b.note }),
      color1: a.color1.concat(matiereToColor(b.matiere)),
      color2 :a.color2.concat(matiereToColor2(b.matiere)),
    }), ({color1:[], color2:[], data:[]}))

    data.datasets.push({
      label: "note",
      data: n.data,
      pointBackgroundColor: n.color2,
      pointBorderColor: n.color1,
      fill: false,
      pointRadius: 10,
      borderColor: matiereToColor(matiere),
      tension: 0.1,
    })
  }

  
  if (currentState.line !== undefined) {
    currentState.line.data = data
    currentState.line.config.options = options
    currentState.line.update()
    return
  }

  const config = {
    type: 'line',
    data: data,
    options: options,
  };

  currentState.line = new Chart(canvasLine, config)
}

function upPie(notes, eleve) {
  if (notes.length === 0) {
    return
  }

  const n = notes.reduce((a, b) => {
    a.data[b.satisfaction-1]++
    return a
  }
  , {data: [0,0,0,0,0]})

  if (currentState.pie !== undefined) {
    currentState.pie.data.datasets[0].data = n.data
    currentState.pie.update()
    return
  }

  const data = {
    labels: ["💀","😣","🤔","😊","🤩"],
    datasets: [{
      data: n.data,
      backgroundColor: [
        'IndianRed',
        'LightSalmon',
        'Gold',
        'LightGreen',
        'DeepSkyBlue'
      ]
    }]
  }

  const config = {
    type: 'pie',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
    }
  }

  const canvas = document.getElementById("donuts-satisfaction")
  currentState.pie = new Chart(canvas, config)
}

function upBox(notes, eleve) {
  if (notes.length === 0) {
    return
  }

  const r = notes.reduce((a, b) => {
    const revs = b.revision.split(',')
    for (const rev of revs) {
      if (rev === "") {
        continue;
      }
      if (a.people.includes(rev)) {
        a.data[a.peopleId[rev]]++
      } else {
        a.peopleId[rev] = a.count
        a.count++
        a.people.push(rev)
        a.data.push(1)
      }
    }
    return a
  }
  , {data: [], people: [], peopleId: {}, count:0})

  if (currentState.box !== undefined) {
    currentState.box.data.datasets[0].data = r.data
    currentState.box.data.labels = r.people
    currentState.box.update()
    return
  }

  const data = {
    labels: r.people,
    datasets: [{
      data: r.data,
    }]
  }

  const config = {
    type: 'bar',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
            display: false,
        } 
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        }
      }
    }
  }

  const canvas = document.getElementById("box-revision")
  currentState.box = new Chart(canvas, config)
}

function upDonuts(notes, eleve) {
  if (notes.length === 0) {
    return
  }

  const n = notes.reduce((a, b) => {
    a.data[b.note2]++
    return a
  }
  , {data: [0,0,0,0,0,0,0]})

  if (currentState.donut !== undefined) {
    currentState.donut.data.datasets[0].data = n.data
    currentState.donut.update()
    return
  }

  const data = {
    labels: ["NA","PA-","PA","PA+","A-","A","A+"],
    datasets: [{
      data: n.data,
    }]
  }

  const config = {
    type: 'doughnut',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
    }
  }

  const canvas = document.getElementById("pie-note2")
  currentState.donut = new Chart(canvas, config)
}

function upToiles(notes, eleve) {

  notes = notes.filter(e => e.name === eleve || eleve === 'all')

  const moyennes = []
  for (const m of matieresTable) {
    if (m.id !== 0) {
      const matiereNotes = notes.filter(e => e.matiere === m.id)
      moyennes.push(moy(matiereNotes))
    }
  }

  if (currentState.toile !== undefined) {
    currentState.toile.data.datasets[0].data = moyennes
    currentState.toile.update()
    return
  }

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
  document.getElementById("eleves-tab").innerHTML = usersToHTML(users.sort((a,b) => a.username.localeCompare(b.username)))
}

function modalShow(id) {
  const modal = new bootstrap.Modal(document.getElementById(id), {})
  modal.show()
}

function modalHide(id) {
  document.getElementById(`${id}-close`).click()
}

function upAvatarParam(avatar) {
  document.getElementById('avatar-' + currentState.currentAvatar).classList.remove('selected')
  document.getElementById('avatar-' + avatar).classList.add('selected')
  currentState.currentAvatar = Number(avatar)
}

function upAvatar(avatar, matiere = "none") {
  const suffix = matiere === 'general' || matiere === 'none'? "" : "-" + matiere
  for (const e of document.getElementsByClassName('avatar-img')) {
    e.src = "/assets/images/avatar/" + avatar + ".png"
  }
  if (matiere !== 'none') {
    for (const e of document.getElementsByClassName('avatar-matiere-img')) {
      e.src = "/assets/images/avatar/" + avatar + suffix + ".png"
    }
  }
}
