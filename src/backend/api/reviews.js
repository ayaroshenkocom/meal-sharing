const express = require("express");
const router = express.Router();
const knex = require("../database");

router.get("/reviews", async (request, response) => {
    try {
        const reviews = await knex("reviews").select("*");
        response.json(reviews);
    } catch (error) { response.status(500).json({ error: "An unexpected error occurred while processing your request." }); }
});


router.post("/reviews", async (request, response) => {
    const body = request.body;
    body.created_date = new Date();

    try {
        await knex("reviews").insert(body);
        response.status(201).json("New review entry has been created!");
    } catch (error) { response.status(500).json({ error: "An unexpected error occurred while processing your request:", message: error.message }); }
});


router.get("/reviews/:id", async (request, response) => {
    const id = request.params.id;
    try {
        const meal = await knex("reviews").select("*").where("id", "=", id);

        if (meal.length) {
            response.json(meal);
        } else {
            response.status(404).json({ message: "No reviews available." });
        }
    } catch (error) {
        response.status(404).json({ error: "An unexpected error occurred while processing your request." });
    }
});

router.put("/reviews/:id", async (request, response) => {
    const id = request.params.id;
    const body = request.body;

    try {
        await knex("reviews").update(body).where("id", "=", id);
        response.status(200).json("Review entry has been updated!");
    } catch (error) { response.status(404).json({ error: "An unexpected error occurred while processing your request:", message: error.message }); }
});

router.delete("/reviews/:id", async (request, response) => {
    const id = request.params.id;

    try {
        await knex("reviews").delete().where("id", "=", id);
        response.status(204).json("Reservations entry has been deleted!");
    } catch (error) { response.status(404).json({ error: "An unexpected error occurred while processing your request:", message: error.message }); }
});

module.exports = router;