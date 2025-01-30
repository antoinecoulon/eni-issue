const express = require('express');
const { query, matchedData, validationResult } = require('express-validator');

const app = express();
const port = 3000;
// fichiers statiques du dossier public
app.use(express.static('public'));

// Importer les modules nécessaires à MongoDB
const {v4: uuidv4} = require('uuid');
const {MongoClient} = require('mongodb');

// Connexion à la base de données
const uri = "mongodb://localhost:27017/eni-issue";
const client = new MongoClient(uri, {useNewUrlParser: true});
const db = client.db("eni-issue");
client.connect()
    .then(() => {
        console.log('Connected succesfully to server');
    })
    .catch((err) => {
        console.log('Error connecting to server: ', err);
    });

// Mise en place du moteur de rendu EJS
app.set("views", "./views");
app.set("view engine", "ejs");

// Middleware pour parser le body des requêtes
app.use(express.urlencoded({ extended: true }));

// Middleware pour parser le body des requêtes en JSON
app.use(express.json());

// Routes
// Route pour la page d'accueil
app.get("/", (req, res) => {
    db.collection('issues').find().toArray().then((issues) => {
        res.render("index", { issues });
    });
});

// Route pour obtenir le détail d'une issue
app.get("/details/:uuid", (req, res) => {
    db.collection('issues').findOne({uuid: req.params.uuid}).then((issue) => {
        if (issue) {
            res.render("details", { issue: issue });
        } else {
            res.status(404).send('Error: no issue found');
        }
    })
});

// Route pour la création d'un message sur une issue
app.post("/details/:uuid/add-message", (req, res) => {
    let issueID = req.params.uuid;
    db.collection('issues').updateOne({uuid: issueID}, {
        $push: {
            messages: {
                nom: req.body.name,
                message: req.body.message,
                date: new Date()
            }
        }
    });
    res.redirect(`/details/${issueID}`)
})

// Route pour la page d'ajout d'une issue
app.post("/add-issue", (req, res) => {
    let date = new Date();
    let dateFormatted = date.toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    
    db.collection('issues').insertOne({
        uuid: uuidv4(),
        titre: req.body.titre,
        description: req.body.description,
        auteur: req.body.auteur,
        date: dateFormatted,
        etat: 'en-cours'
    });
    
    res.redirect("/");
});

// Route pour la page d'édition d'une issue
app.get("/edit-issue/:uuid", (req, res) => {
    db.collection('issues').findOne({uuid: req.params.uuid}).then((issue) => {
        if (issue) {
            res.render("edit", { issue: issue });
        } else {
            res.status(404).send('Error: no issue found');
        }
    })
});

// Route pour l'édition d'une issue
app.post("/edit-issue/:uuid", (req, res) => {
    db.collection('issues').updateOne({uuid: req.params.uuid}, {
        $set: {
            titre: req.body.titre,
            description: req.body.description,
            auteur: req.body.auteur,
            etat: req.body.etat
        }
    })
    
    res.redirect("/");
});

// Route pour la suppression d'une issue
app.get("/delete-issue/:uuid", (req, res) => {
    db.collection('issues').deleteOne({uuid: req.params.uuid}).then((response) => {
        if (response.deletedCount === 1) {
            res.redirect("/");
        } else {
            res.status(404).send('Error: no issue found');
        }
    })
});

// Fermer une issue
app.post("/details/:uuid/close-issue", (req, res) => {
    let issueID = req.params.uuid;
    db.collection('issues').updateOne({uuid: issueID}, {
        $set: {
            etat: 'resolu'
            }
        })
    res.redirect(`/details/${issueID}`);
});

// Simulation d'une erreur
app.get('/error', (req, res, next) => {
    next(new Error("Ceci est un test d'erreur"));
});

// Middleware pour gérer les erreurs
app.use((err, req, res, next) => {
    let erreurPerso = err.message;
    console.log("ERREUR:::::" + erreurPerso);
    res.render("error", { erreurPerso });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});