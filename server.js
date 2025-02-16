const express = require('express');
const argon2 = require('argon2');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connexion à la base de données SQLite
const db = new sqlite3.Database('./users.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connecté à la base de données SQLite.');
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE,
            password TEXT
        )`);
    }
});

// Route d'inscription
app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        const hashedPassword = await argon2.hash(password);
        db.run(`INSERT INTO users (email, password) VALUES (?, ?)`, [email, hashedPassword], (err) => {
            if (err) {
                return res.status(400).json({ error: "L'utilisateur existe déjà." });
            }
            res.status(201).json({ message: "Utilisateur créé avec succès !" });
        });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors du hashage du mot de passe." });
    }
});

// Route de connexion
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (!user) {
            return res.status(400).json({ error: "Utilisateur non trouvé." });
        }

        try {
            const isValidPassword = await argon2.verify(user.password, password);
            if (!isValidPassword) {
                return res.status(401).json({ error: "Mot de passe incorrect." });
            }

            res.status(200).json({ message: "Connexion réussie !" });
        } catch (error) {
            res.status(500).json({ error: "Erreur de vérification du mot de passe." });
        }
    });
});

// Démarrer le serveur
app.listen(5000, () => {
    console.log("Serveur backend démarré sur http://localhost:5000");
});
