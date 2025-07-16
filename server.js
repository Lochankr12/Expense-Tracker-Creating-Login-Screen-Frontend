const express = require('express');
const path = require('path');
const mysql = require('mysql2');

const app = express();
const PORT = 3000;

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'loch7760',
    database: 'expensess_db'
});

db.connect((err) => {
    if (err) {
        console.error('❌ Error connecting to MySQL:', err);
        return;
    }
    console.log('✅ Connected to MySQL database.');
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/user/signup', (req, res) => {
    const { name, email, password } = req.body;
    const sql = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
    const values = [name, email, password];
    db.query(sql, values, (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'This email is already registered.' });
            }
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error during signup.' });
        }
        console.log(`User ${name} created with ID: ${result.insertId}`);
        return res.status(201).json({ message: `Signup successful! Welcome, ${name}.` });
    });
});

app.post('/user/login', (req, res) => {
    const { email, password } = req.body;
    const sql = `SELECT * FROM users WHERE email = ?`;
    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error('Database error during login:', err);
            return res.status(500).json({ message: 'Internal server error.' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found. Please check your email.' });
        }
        const user = results[0];
        if (password !== user.password) {
            return res.status(401).json({ message: 'Incorrect password. Please try again.' });
        }
        console.log(`User ${user.name} logged in successfully.`);
        res.status(200).json({ message: 'User logged in successfully' });
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});