const todoService = require('../services/todo.service')
const getAll = (req, res) => {
    const todos = todoService.getAll
    res.json(todos)
}
const getById = (req, res) => {
    const todos = readdata();
    const id = req.params.id;
    const index = todos.findIndex((todo) => todo.id == id)
    if (index == -1) {
        return res.status(401).json({ 'message': 'No todo with given id:' + id })
    }
    res.status(201).json(todos[index])
}
const createTodo = (req, res) => {
    const todos = readdata();
    const newtodo = {
        id: Date.now().toString(),
        title: req.body.title,
        isCompleted: false
    }
    todos.push(newtodo)
    savedata(todos)
    res.status(201).json({ 'message': 'Data added', 'data': newtodo })
}
const updateTodo = (req, res) => {
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
}
const deleteTodo = (req, res) => {
    let todos = readdata();
    const id = req.params.id;
    const index = todos.findIndex((todo) => todo.id == id)
    if (index == -1) {
        return res.status(401).json({ 'message': 'No todo with given id:' + id })
    }
    todos = todos.filter((todo) => todo.id != id)
    savedata(todos)
    res.send('deleted todo with id' + req.params.id)
}
module.exports = {
    getAll,
    getById,
    createTodo,
    updateTodo,
    deleteTodo
}