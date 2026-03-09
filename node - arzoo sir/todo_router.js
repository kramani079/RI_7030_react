const express = require('express')
const router = express.Router();

// fetch all todos
router.get("/", (req, res) => {
    const todos = readdata();
    res.json(todos)
})
// get todo with id
router.get("/:id", (req, res) => {
    const todos = readdata();
    const id = req.params.id;
    const index = todos.findIndex((todo) => todo.id == id)
    if (index == -1) {
        return res.status(401).json({ 'message': 'No todo with given id:' + id })
    }
    res.status(201).json(todos[index])
})
router.post('/', (req, res) => {
    const todos = readdata();
    const newtodo = {
        id: Date.now().toString(),
        title: req.body.title,
        isCompleted: false
    }
    todos.push(newtodo)
    savedata(todos)
    res.status(201).json({ 'message': 'Data added', 'data': newtodo })
})
router.put('/:id', (req, res) => {
    const todos = readdata();
    const id = req.params.id;
    const index = todos.findIndex((todo) => todo.id == id)
    if (index == -1) {
        return res.status(401).json({ 'message': 'No todo with given id:' + id })
    }
    todos[index] = {
        ...todos[index],
        title: req.body.title
    }
    savedata(todos)
    res.status(201).json({ 'message': 'Data updated', 'data': todos[index] })
})
router.delete('/:id', (req, res) => {
    let todos = readdata();
    const id = req.params.id;
    const index = todos.findIndex((todo) => todo.id == id)
    if (index == -1) {
        return res.status(401).json({ 'message': 'No todo with given id:' + id })
    }
    todos = todos.filter((todo) => todo.id != id)
    savedata(todos)
    res.send('deleted todo with id' + req.params.id)
})
module.exports = router;