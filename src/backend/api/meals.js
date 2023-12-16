const express = require("express");
const router = express.Router();
const knex = require("../database");

const date = new Date();
const formattedCurrentDate = date.toISOString().slice(0, 19).replace('T', ' ');

router.get("/meals", async (request, response) => {
  const allowedKeys = [
    'meal_when',
    'max_reservations',
    'price',
  ];

  try {
    const queryParams = request.query;
    let queryBuilder = knex("meals");

    if (queryParams.maxPrice) {
      queryBuilder.where('price', '<', queryParams.maxPrice);
    }

    if (queryParams.limit) {
      queryBuilder.limit(queryParams.limit);
    }

    if (queryParams.title) {
      queryBuilder.where('title', 'LIKE', `%${queryParams.title}%`);
    }

    if (queryParams.dateAfter) {
      queryBuilder.where('meal_when', '>', queryParams.dateAfter);
    }

    if (queryParams.dateBefore) {
      queryBuilder.where('meal_when', '<', queryParams.dateBefore);
    }

    if (queryParams.sortDir && queryParams.sortKey) {
      if (allowedKeys.includes(queryParams.sortKey)) {
        queryBuilder.orderBy(queryParams.sortKey, queryParams.sortDir.toUpperCase());
      }
    }

    if (queryParams.sortKey && !queryParams.sortDir) {
      if (allowedKeys.includes(queryParams.sortKey)) {
        queryBuilder.orderBy(queryParams.sortKey, 'ASC');
      }
    }

    if (queryParams.availableReservations !== undefined) {

      const availability = queryParams.availableReservations !== 'false' ? '<' : '>=';
      queryBuilder
        .leftJoin('reservations', 'meals.id', '=', 'reservations.meal_id')
        .groupBy('meals.id')
        .having(knex.raw(`count(reservations.id) ${availability} meals.max_reservations`))
    }



    const meals = await queryBuilder.select("meals.*");
    response.json(meals);
  } catch (error) { response.status(500).json({ error: "An unexpected error occurred while processing your request.", message: error.message }); }
});


router.get("/future-meals", async (request, response) => {
  try {

    const futureMeals = await knex("meals").select(["id", "title", "description", "price"]).where("meal_when", ">", formattedCurrentDate);
    response.json(futureMeals);
  } catch (error) {
    response.status(500).json({ error: "An unexpected error occurred while processing your request." });
  }
});




router.get("/past-meals", async (request, response) => {
  try {

    const pastMeals = await knex("meals").select(["id", "title", "description", "price"]).where("meal_when", "<", formattedCurrentDate);
    response.json(pastMeals);
  } catch (error) {
    response.status(500).json({ error: "An unexpected error occurred while processing your request." });
  }
});


router.get("/all-meals", async (request, response) => {
  try {

    const allMeals = await knex("meals").select(["id", "title", "description", "price"]).orderBy('id', 'desc');
    response.json(allMeals);
  } catch (error) {
    response.status(500).json({ error: "An unexpected error occurred while processing your request." });
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
    response.status(500).json({ error: "An unexpected error occurred while processing your request." });
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
    response.status(500).json({ error: "An unexpected error occurred while processing your request." });
  }
});


router.post("/meals", async (request, response) => {
  const body = request.body;
  body.created_date = new Date();

  try {
    await knex("meals").insert(body);
    response.status(201).json("New meal entry has been created!");
  } catch (error) { response.status(500).json({ error: "An unexpected error occurred while processing your request:", message: error.message }); }
});


router.get("/meals/:id", async (request, response) => {
  const id = request.params.id;
  try {
    const meal = await knex("meals").select("*").where("id", "=", id);

    if (meal.length) {
      response.json(meal);
    } else {
      response.status(404).json({ message: "No meals available." });
    }
  } catch (error) {
    response.status(404).json({ error: "An unexpected error occurred while processing your request." });
  }
});

router.get("/meals/:id/reviews", async (request, response) => {
  const id = request.params.id;
  try {
    const meal = await knex("meals")
      .select("reviews.*")
      .join('reviews', 'meals.id', '=', 'reviews.meal_id')
      .where("meals.id", "=", id);

    if (meal.length) {
      response.json(meal);
    } else {
      response.status(404).json({ message: "No meal reviews available." });
    }
  } catch (error) {
    response.status(404).json({ error: "An unexpected error occurred while processing your request." });
  }
});

router.put("/meals/:id", async (request, response) => {
  const id = request.params.id;
  const body = request.body;

  try {
    await knex("meals").update(body).where("id", "=", id);
    response.status(200).json("Meal entry has been updated!");
  } catch (error) { response.status(404).json({ error: "An unexpected error occurred while processing your request:", message: error.message }); }
});

router.delete("/meals/:id", async (request, response) => {
  const id = request.params.id;

  try {
    await knex("meals").delete().where("id", "=", id);
    response.status(204).json("Meal entry has been deleted!");
  } catch (error) { response.status(404).json({ error: "An unexpected error occurred while processing your request:", message: error.message }); }
});


module.exports = router;
