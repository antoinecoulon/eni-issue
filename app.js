const express = require('express');
const { query, matchedData, validationResult } = require('express-validator');

const app = express();
const port = 3000;

// Mise en place du moteur de rendu EJS
app.set("views", "./views");
app.set("view engine", "ejs");

// Middleware pour parser le body des requêtes
app.use(express.urlencoded({ extended: true }));

// Middleware pour parser le body des requêtes en JSON
app.use(express.json());

// Initialisation de la liste des issues
let issues = [
    {
        id: 1,
        titre: 'issue1',
        description: 'description test',
        auteur: 'Antoine',
        date: '2025-01-29',
        etat: 'resolu'
    }
];

// Routes
// Route pour la page d'accueil
app.get("/", (req, res) => {
  res.render("index", { issues });
});

// Route pour la page d'ajout d'une issue
app.post("/add-issue", (req, res) => {
    let id = issues.length + 1;
    const { titre, description, auteur, date, etat } = req.body;
    issues.push({ id, titre, description, auteur, date, etat });
    res.redirect("/");
});

// Route pour la suppression d'une issue
app.get("/delete-issue/:id", (req, res) => {
    const { id } = req.params;
    issues.splice(id - 1, 1);
    res.redirect("/");
});

// Route pour la page d'édition d'une issue
app.get("/edit-issue/:id", (req, res) => {
    const { id } = req.params;
    res.render("edit", { issue: issues[id - 1] });
});

// Route pour l'édition d'une issue
app.post("/edit-issue/:id", (req, res) => {
    const { id } = req.params;
    const { titre, description, auteur, date, etat } = req.body;
    issues[id - 1] = { id, titre, description, auteur, date, etat };
    res.redirect("/");
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