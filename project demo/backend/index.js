const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const dboperations = require('./queries/dboperations');
const port = 3000;


app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use(express.json());
app.get('/users', dboperations.getUsers);
app.post('/users', dboperations.saveUser);
app.post('/users/update', dboperations.updateUser);
app.post('/users/delete', dboperations.deleteUser);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});