const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Simulación de base de datos
const users = [];

// Funciones auxiliares
const generateToken = (user) => {
    return jwt.sign({ userId: user.id, username: user.username }, 'secret_key', { expiresIn: '1h' });
};

const findUserByUsername = (username) => {
    return users.find(user => user.username === username);
};

// Rutas
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.post('/auth/signup', async (req, res) => {
    const { fullName, username, password, confirmPassword, email } = req.body;

    if (findUserByUsername(username)) {
        return res.status(400).json({ message: 'El nombre de usuario ya existe' });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Las contraseñas no coinciden' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
        id: users.length + 1,
        fullName,
        username,
        password: hashedPassword,
        email,
    };

    users.push(user);

    const token = generateToken(user);
    res.status(201).json({ token, userId: user.id, hashedPassword, fullName });
});

app.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;

    const user = findUserByUsername(username);
    if (!user) {
        return res.status(400).json({ message: 'Nombre de usuario o contraseña no válidos' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Nombre de usuario o contraseña no válidos' });
    }

    const token = generateToken(user);
    res.status(200).json({ token, userId: user.id, hashedPassword: user.password, fullName: user.fullName });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));