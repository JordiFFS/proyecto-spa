const express = require('express');
const {
    getItems,
    getItem,
    createItem,
    updateItem,
    deleteItem
} = require("../controllers/sugerencia");
const router = express.Router();

// Rutas http://localhost:3000/tracks GET, POST, PUT, DELETE
router.get("/", getItems);
router.get("/:id", getItem);
router.post("/", createItem);
router.put("/:id", updateItem);
router.delete("/:id", deleteItem);

module.exports = router;