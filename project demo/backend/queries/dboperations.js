const { request, response } = require("express");
const pool = require("../db/connectionobj");
const { Result } = require("pg");

const getUsers = (request, response) => {
    pool.query('SELECT * FROM "Account" ', (error, results) => {
        if(error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
}

const saveUser = (request, response) => {
    const {id, name, run, country} = request.body;
    pool.query("INSERT INTO Account (id, name, run, country) " + "VALUES ($1, $2, $3, $4)", [id, name, run, country], (error, results) => {
        if(error) {
            throw error;
        }
        response.status(200).send("User add successfully");
    });
}

const updateUser = (request, response) => {
    const { id, name, run, country} = request.body;
    pool.query("UPDATE Account SET name = $2, run = $3, country = $4 WHERE id = $1", [id, name, run, country], (error, results) => {
        if(error) {
            throw error;
        }
        response.status(200).send("User Updated successfully");
    });
}

const deleteUser = (request, response) => {
    const {id} = request.body;
    pool.query("DELETE FROM Account WHERE id = $1", [id], (error, results) => {
        if(error) {
            throw error;
        }
        response.status(200).send("User Delete successfully");
    });
}
module.exports = {
    getUsers,
    saveUser,
    updateUser,
    deleteUser
}