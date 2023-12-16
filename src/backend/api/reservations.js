const express = require("express");
const router = express.Router();
const knex = require("../database");

router.get("/reservations", async (request, response) => {
    try {
        const reservations = await knex("reservations").select("*");
        response.json(reservations);
    } catch (error) { response.status(500).json({ error: "An unexpected error occurred while processing your request." }); }
});


router.post("/reservations", async (request, response) => {
    const body = request.body;
    body.created_date = new Date();

    try {
        await knex("reservations").insert(body);
        response.status(201).json("New r entry has been created!");
    } catch (error) { response.status(500).json({ error: "An unexpected error occurred while processing your request:", message: error.message }); }
});


router.get("/reservations/:id", async (request, response) => {
    const id = request.params.id;
    try {
        const meal = await knex("reservations").select("*").where("id", "=", id);

        if (meal.length) {
            response.json(meal);
        } else {
            response.status(404).json({ message: "No reservations available." });
        }
    } catch (error) {
        response.status(404).json({ error: "An unexpected error occurred while processing your request." });
    }
});

router.put("/reservations/:id", async (request, response) => {
    const id = request.params.id;
    const body = request.body;

    try {
        await knex("reservations").update(body).where("id", "=", id);
        response.status(200).json("Reservations entry has been updated!");
    } catch (error) { response.status(404).json({ error: "An unexpected error occurred while processing your request:", message: error.message }); }
});

router.delete("/reservations/:id", async (request, response) => {
    const id = request.params.id;

    try {
        await knex("reservations").delete().where("id", "=", id);
        response.status(204).json("Reservations entry has been deleted!");
    } catch (error) { response.status(404).json({ error: "An unexpected error occurred while processing your request:", message: error.message }); }
});

module.exports = router;