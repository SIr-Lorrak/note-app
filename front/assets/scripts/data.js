//here we'll fetch our data from the api but for now data are mocked
const top_nav = document.getElementById("top_nav")
const connexion = document.getElementById("connexion")
const deconnexion = document.getElementById("deconnexion")
const accueil = document.getElementById("accueil")
const matiere = document.getElementById("matiere")
const new_note = document.getElementById("new_note")
const historique = document.getElementById("historique")
const statistiques = document.getElementById("statistiques")
const exercices = document.getElementById("exercices")
const parametre = document.getElementById("parametre")
const after_nav = document.getElementById("after-nav")

const matieres = document.getElementsByClassName("matiere")
const go_home = document.getElementById("go-home")
const go_back = document.getElementById("go-back")
const go_disconnect = document.getElementById("go-disconnect")
const go_parametre = document.getElementById("go-parametre")

const matiereList = ["general", "mathematiques", "francais", "EMC", "anglais", "art", "musique", "EPS", "histoire", "geographie", "sciences"]

const currentState = {
	currentUser : {
		username : "Lorrak",
		role : 1, // 1 for admin display
		color : {
			type : "Buffer",
			data : [
				250, 235, 215
			]
		},
		avatar : {
			type : "Buffer",
			data : [
				0,
			]
		},
		matiere : 6,
		carton : 0,
		commentaire : "élève très sage",
		datecarton : "2000-09-26"
	},
	token : "Bearer test",
	currentPage : "accueil", //current page to show 
	currentMatiere : "general" // matiere to display on matiere page (0 for general)
}

const students = [ // student list used for admin
	{
		username : "Lorrak",
		role : 1, // 1 for admin display
		color : {
			type : "Buffer",
			data : [
				255,
				0,
				0
			]
		},
		avatar : {
			type : "Buffer",
			data : [
				0,
			]
		},
		matiere : 6,
		carton : 0,
		commentaire : "élève très sage",
		datecarton : "2000-09-26"
	},
	{
		username : "Titouan Sèchepine",
		role : 0, // 1 for admin display
		color : {
			type : "Buffer",
			data : [
				255,
				255,
				0
			]
		},
		avatar : {
			type : "Buffer",
			data : [
				0,
			]
		},
		matiere : 1,
		carton : 1,
		commentaire : "un peu trop fan de Daniel Balavoine",
		datecarton : "2025-09-01"
	},
	{
		username : "Martine Du Calpié",
		role : 0, // 1 for admin display
		color : {
			type : "Buffer",
			data : [
				128,
				255,
				75
			]
		},
		avatar : {
			type : "Buffer",
			data : [
				0,
			]
		},
		matiere : 5,
		carton : 3,
		commentaire : "exécrable",
		datecarton : "2025-09-01"
	},
	{
		username : "Joséphine Pélouze",
		role : 0, // 1 for admin display
		color : {
			type : "Buffer",
			data : [
				128,
				0,
				255
			]
		},
		avatar : {
			type : "Buffer",
			data : [
				0,
			]
		},
		matiere : 2,
		carton : 2,
		commentaire : "attention",
		datecarton : "2025-09-01"
	},
	{
		username : "Léon Duku",
		role : 0, // 1 for admin display
		color : {
			type : "Buffer",
			data : [
				0,
				0,
				0
			]
		},
		avatar : {
			type : "Buffer",
			data : [
				0,
			]
		},
		matiere : 4,
		carton : 3,
		commentaire : "Banni de twitter (extrèmement raciste)",
		datecarton : "2025-09-01"
	},
]

const note = [ // note list 
	{
		id : 1,
		name : "Titouan Sèchepine",
		matiere : 1,
		date : "2025-12-25",
		notion : "skibidi toilet",
		note : 76, // en pourcentage
		note2 : 4, // de NA a A+
		révision : "Maman",
		statisfaction : 3
	},
	{
		id : 2,
		name : "Titouan Sèchepine",
		matiere : 5,
		date : "2025-09-11",
		notion : "les attentats du 11 septembre",
		note : 99, // en pourcentage
		note2 : 7, // de NA a A+
		révision : "Etude",
		statisfaction : 4
	},{
		id : 3,
		name : "Titouan Sèchepine",
		matiere : 1,
		date : "2025-11-11",
		notion : "pythagore",
		note : 45, // en pourcentage
		note2 : 2, // de NA a A+
		révision : "Papa",
		statisfaction : 2
	},{
		id : 4,
		name : "Titouan Sèchepine",
		matiere : 1,
		date : "2025-12-25",
		notion : "statistiques",
		note : 100, // en pourcentage
		note2 : 7, // de NA a A+
		révision : "Maman",
		statisfaction : 5
	},{
		id : 5,
		name : "Titouan Sèchepine",
		matiere : 1,
		date : "2025-12-25",
		notion : "skibidi toilet",
		note : 76, // en pourcentage
		note2 : 4, // de NA a A+
		révision : "Maman",
		statisfaction : 3
	},{
		id : 6,
		name : "Titouan Sèchepine",
		matiere : 5 ,
		date : "2025-12-25",
		notion : "skibidi toilet",
		note : 76, // en pourcentage
		note2 : 4, // de NA a A+
		révision : "Etude",
		statisfaction : 3
	},{
		id : 7,
		name : "Titouan Sèchepine",
		matiere : 1,
		date : "2025-12-25",
		notion : "skibidi toilet",
		note : 76, // en pourcentage
		note2 : 4, // de NA a A+
		révision : "Maman",
		statisfaction : 3
	},
]