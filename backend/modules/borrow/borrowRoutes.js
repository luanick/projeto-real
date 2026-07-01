const express = require('express');
const router = express.Router();
const borrowController = require('./borrowController');
const { isAuthenticated } = require('../../middlewares/auth');

router.post('/books/:id/request', isAuthenticated, borrowController.requestBorrow);
router.get('/borrows', isAuthenticated, borrowController.listBorrows);
router.post('/borrows/:id/approve', isAuthenticated, borrowController.approveBorrow);
router.post('/borrows/:id/reject', isAuthenticated, borrowController.rejectBorrow);
router.post('/borrows/:id/return', isAuthenticated, borrowController.returnBorrow);

module.exports = router;
