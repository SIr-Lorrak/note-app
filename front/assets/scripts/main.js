reloadPage()
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
  changePage("accueil")
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
body.style.background = currentState.currentUser.color


document.getElementById('new-note-date').value = new Date().toLocaleDateString('en-CA')

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
    data: [65, 59, 90, 81, 56, 55, 40, 100, 34, 12],
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

const toile = new Chart(canvas, config)
