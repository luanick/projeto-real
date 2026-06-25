const express = require('express');
const router = express.Router();
const bookController = require('./bookController');
const { isAuthenticated } = require('../../middlewares/auth');

router.get('/books', isAuthenticated, bookController.renderBooksFeed);
router.get('/books/new', isAuthenticated, bookController.renderNewBookForm);
router.post('/books', isAuthenticated, bookController.createBook);

module.exports = router;
