//here we'll fetch our data from the api but for now data are mocked
const top_nav = document.getElementById("top_nav")
const body = document.getElementById("body")
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
const feedback = document.getElementById("feedback")

const matieres = document.getElementsByClassName("matiere")
const has_shadow = document.getElementsByClassName("has-shadow")
const my_shadow = document.getElementsByClassName("myshadow")
const onglet = document.getElementsByClassName("onglet")
const go_home = document.getElementById("go-home")
const go_back = document.getElementById("go-back")
const go_disconnect = document.getElementById("go-disconnect")
const go_parametre = document.getElementById("go-parametre")
const today = new Date().toLocaleDateString('en-CA')

const connexionForm = document.getElementById("connexion-form")
const inscriptionForm = document.getElementById("inscription-form")
const changeLoginForm = document.getElementById("change-login-form")
const changePasswordForm = document.getElementById("change-password-form")
const changeColorForm = document.getElementById("change-color-form")
const newNoteForm = document.getElementById("new-note-form")
const changeNoteForm = document.getElementById("change-note-form")
const supprNoteForm = document.getElementById("suppr-note-form")
const changeUserForm = document.getElementById("change-user-form")
const supprUserForm = document.getElementById("suppr-user-form")
const cartonForm = document.getElementById("carton-form")
const getBackup = document.getElementById("get-backup")
const sendBackup = document.getElementById("send-backup")

const matiereList = ["general", "mathematiques", "francais", "EMC", "anglais", "art", "musique", "EPS", "histoire", "geographie", "sciences"]

const currentState = {
	currentEleve : "all", // les notes de cette eleve seront afficher laisser vide pour afficher tt le monde
	connected : false,
	currentUser : {
		username : "Lorrak",
		role : 0, // 1 for admin display
		color : "#faebd7",
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
	currentPage : "loading", //current page to show 
	currentOnglet : "historique",
	currentMatiere : "general" // matiere to display on matiere page (0 for general)
}

var students = [ // student list used for admin
	{
		username : "Léontine Robinson",
		role : 1, // 1 for admin display
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
		avatar : {
			type : "Buffer",
			data : [
				0,
			]
		},
		matiere : 1,
		carton : 1,
		commentaire : "un peu trop fan de Daniel Balavoine",
		datecarton : today
	},
	{
		username : "Martine Du Calpié",
		role : 0, // 1 for admin display
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
		avatar : {
			type : "Buffer",
			data : [
				0,
			]
		},
		matiere : 2,
		carton : 2,
		commentaire : "Passe trop de temps sur Minecraft",
		datecarton : "2025-09-01"
	},
	{
		username : "Léon Duku",
		role : 0, // 1 for admin display
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

var notes = [ // note list 
	{
		id : 1,
		name : "Titouan Sèchepine",
		matiere : 1,
		date : "2025-12-25",
		notion : "Madame Bovary",
		note : 76, // en pourcentage
		note2 : 4, // de NA a A+
		revision : "Maman",
		satisfaction : 3
	},
	{
		id : 2,
		name : "Titouan Sèchepine",
		matiere : 8,
		date : "2025-09-11",
		notion : "époque féodal",
		note : 99, // en pourcentage
		note2 : 6, // de NA a A+
		revision : "Etude",
		satisfaction : 4
	},{
		id : 3,
		name : "Titouan Sèchepine",
		matiere : 2,
		date : "2025-11-11",
		notion : "pythagore",
		note : 45, // en pourcentage
		note2 : 2, // de NA a A+
		revision : "Papa",
		satisfaction : 2
	},{
		id : 4,
		name : "Titouan Sèchepine",
		matiere : 2,
		date : "2025-12-25",
		notion : "statistiques",
		note : 100, // en pourcentage
		note2 : 6, // de NA a A+
		revision : "Maman,Papa,APC,Tim,Youtube",
		satisfaction : 5
	},{
		id : 5,
		name : "Titouan Sèchepine",
		matiere : 5,
		date : "2025-12-25",
		notion : "skibidi toilet",
		note : 76, // en pourcentage
		note2 : 4, // de NA a A+
		revision : "Maman",
		satisfaction : 3
	},{
		id : 6,
		name : "Titouan Sèchepine",
		matiere : 4,
		date : "2025-12-25",
		notion : "colorfull colors",
		note : 76, // en pourcentage
		note2 : 4, // de NA a A+
		revision : "Etude",
		satisfaction : 3
	},{
		id : 7,
		name : "Titouan Sèchepine",
		matiere : 10,
		date : "2025-12-25",
		notion : "thermodynamique",
		note : 76, // en pourcentage
		note2 : 4, // de NA a A+
		revision : "Maman",
		satisfaction : 3
	},{
		id : 8,
		name : "Titouan Sèchepine",
		matiere : 6,
		date : "2025-12-25",
		notion : "JEAN SEBSALUT BACH",
		note : 13, // en pourcentage
		note2 : 0, // de NA a A+
		revision : "Maman",
		satisfaction : 1
	}
]

var exos = []