const express = require("express");
const router = express.Router();
const knex = require("../database");

let date = new Date();
const formattedCurrentDate = date.toISOString().slice(0, 19).replace('T', ' ');

router.get("/meals", async (request, response) => {
  try {
    // knex syntax for selecting things. Look up the documentation for knex for further info
    const titles = await knex("meals").select("title");
    response.json(titles);
  } catch (error) {
    throw error;
  }
});


router.get("/future-meals", async (request, response) => {
  try {
    // knex syntax for selecting things. Look up the documentation for knex for further info
    const futureMeals = await knex("meals").select(["id", "title", "description", "price"]).where("meal_when", ">", formattedCurrentDate);
    response.json(futureMeals);
  } catch (error) {
    throw error;
  }
});

router.get("/past-meals", async (request, response) => {
  try {
    // knex syntax for selecting things. Look up the documentation for knex for further info
    const pastMeals = await knex("meals").select(["id", "title", "description", "price"]).where("meal_when", "<", formattedCurrentDate);
    response.json(pastMeals);
  } catch (error) {
    throw error;
  }
});


router.get("/all-meals", async (request, response) => {
  try {
    // knex syntax for selecting things. Look up the documentation for knex for further info
    const allMeals = await knex("meals").select(["id", "title", "description", "price"]).orderBy('id', 'desc');
    response.json(allMeals);
  } catch (error) {
    throw error;
  }
});

router.get("/first-meal", async (request, response) => {
  try {
    const firstMeal = await knex("meals").select(["id", "title", "description", "price"]).orderBy('id', 'asc').first();

    if (firstMeal) {
      response.json(firstMeal);
    } else {
      response.status(404).json({ message: "No meals available." });
    }
  } catch (error) {
    throw error;
  }
});

router.get("/last-meal", async (request, response) => {
  try {
    const lastMeal = await knex("meals").select(["id", "title", "description", "price"]).orderBy('id', 'desc').first();

    if (lastMeal) {
      response.json(lastMeal);
    } else {
      response.status(404).json({ message: "No meals available." });
    }
  } catch (error) {
    throw error;
  }
});


module.exports = router;
