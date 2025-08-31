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

const toile = document.getElementById('toile-moyenne');

new Chart(toile, config)

