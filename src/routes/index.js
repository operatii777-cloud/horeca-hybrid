/**
 * API Routes
 */

const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const orderController = require('../controllers/orderController');
const tableController = require('../controllers/tableController');

// Menu routes
router.get('/menu', menuController.getMenu);
router.post('/menu', menuController.addMenuItem);
router.put('/menu/:id', menuController.updateMenuItem);
router.delete('/menu/:id', menuController.deleteMenuItem);

// Order routes
router.get('/orders', orderController.getOrders);
router.post('/orders', orderController.createOrder);
router.put('/orders/:id', orderController.updateOrder);
router.get('/orders/:id', orderController.getOrderById);

// Table routes
router.get('/tables', tableController.getTables);
router.post('/tables', tableController.addTable);
router.put('/tables/:id', tableController.updateTable);

module.exports = router;
