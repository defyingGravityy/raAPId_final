const fs = require('fs');
const express = require('express');

const app = express();
app.use(express.json());

const FILE = 'data.json';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const USERS_FILE = 'users.json';
const SECRET_KEY = 'your_secret_key'; // Use environment variables in production


// Function to read data from JSON file
const readData = () => {
    try {
        const raw = fs.readFileSync(FILE);
        const data = JSON.parse(raw);
        //console.log(data);  // Debugging line to check file content
        return data;
    } catch (err) {
        console.error("Error reading data:", err);  // Log any error
        return []; // If file is empty or missing, return empty array
    }
};


// Function to write data to JSON file
const writeData = (data) => {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
};

// Get all resources with optional filtering
app.get('/resources', (req, res) => {
    let resources = readData(); // Read data from file or memory
    const { subject, difficulty, contentType } = req.query;

    if (subject) {
        resources = resources.filter(r => r.subject === subject);
    }
    if (difficulty) {
        resources = resources.filter(r => r.difficulty === difficulty);
    }
    if (contentType) {
        resources = resources.filter(r => r.contentType === contentType);
    }

    res.json(resources); // Send filtered resources
});

// Create a new resource
app.post('/resources', (req, res) => {
    let resources = readData();
    const resource = { id: resources.length + 1, ...req.body };
    resources.push(resource);
    writeData(resources);
    res.status(201).json(resource);
});

// Get a single resource by ID
app.get('/resources/:id', (req, res) => {
    const resources = readData();
    const resource = resources.find(r => r.id == req.params.id);
    resource ? res.json(resource) : res.status(404).send("Not found");
});

// Update a resource
app.put('/resources/:id', (req, res) => {
    let resources = readData();
    const index = resources.findIndex(r => r.id == req.params.id);
    if (index !== -1) {
        resources[index] = { id: Number(req.params.id), ...req.body };
        writeData(resources);
        res.json(resources[index]);
    } else {
        res.status(404).send("Not found");
    }
});

// Delete a resource
app.delete('/resources/:id', (req, res) => {
    let resources = readData();
    resources = resources.filter(r => r.id != req.params.id);
    writeData(resources);
    res.status(204).send();
});

const readUsers = () => {
    try {
        const raw = fs.readFileSync(USERS_FILE);
        return JSON.parse(raw);
    } catch (err) {
        return []; // Return empty array if file is missing
    }
};

const writeUsers = (data) => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
};

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    let users = readUsers();
    if (users.find(user => user.username === username)) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = { id: users.length + 1, username, password: hashedPassword };

    users.push(newUser);
    writeUsers(users);
    res.status(201).json({ message: 'User registered successfully' });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const users = readUsers();

    const user = users.find(user => user.username === username);
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
});

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Access Denied' });

    try {
        const decoded = jwt.verify(token.split(' ')[1], SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(403).json({ message: 'Invalid Token' });
    }
};

app.post('/resources', authenticateToken, (req, res) => {
    let resources = readData();
    const resource = { id: resources.length + 1, ...req.body };
    resources.push(resource);
    writeData(resources);
    res.status(201).json(resource);
});

app.put('/resources/:id', authenticateToken, (req, res) => {
    let resources = readData();
    const index = resources.findIndex(r => r.id == req.params.id);
    if (index !== -1) {
        resources[index] = { id: Number(req.params.id), ...req.body };
        writeData(resources);
        res.json(resources[index]);
    } else {
        res.status(404).send("Not found");
    }
});

app.delete('/resources/:id', authenticateToken, (req, res) => {
    let resources = readData();
    resources = resources.filter(r => r.id != req.params.id);
    writeData(resources);
    res.status(204).send();
});


app.listen(3000, () => console.log("Server running on port 3000"));
