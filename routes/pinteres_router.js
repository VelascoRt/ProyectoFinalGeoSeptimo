const express = require('express');
const router = express.Router();
const service = require('../services/pinteresService'); 

// GET
router.get("/", async (req, res) => {
  try {
    const data = await service.getAll();
    res.json(data);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// SEARCH
router.get('/search', async (req, res) => {
    try {
        const { name } = req.query; 
        if (!name) return res.status(400).json({ message: "Name required." });
        const data = await service.searchByName(name);
        res.status(200).json(data);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
});

// GET BY ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await service.getByID(id);
    res.json(data);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// POST
router.post("/", async (req, res) => {
  try {
    const data = req.body;
    const newResource = await service.create(data);
    res.status(201).json(newResource);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// UPDATE
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const changes = req.body;
    const data = await service.update(id, changes);
    res.status(200).json(data);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const response = await service.delete(id);
    res.status(200).json(response);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

module.exports = router;