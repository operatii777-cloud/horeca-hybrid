/**
 * Order Controller
 * Handles order-related operations
 */

const orderService = require('../services/orderService');
const { validateOrder } = require('../utils/validation');

const orderController = {
  async getOrders(req, res, next) {
    try {
      const orders = await orderService.getAllOrders();
      res.json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  },

  async createOrder(req, res, next) {
    try {
      const validation = validateOrder(req.body);
      if (!validation.isValid) {
        return res.status(400).json({ 
          success: false, 
          errors: validation.errors 
        });
      }

      const newOrder = await orderService.createOrder(req.body);
      res.status(201).json({ success: true, data: newOrder });
    } catch (error) {
      next(error);
    }
  },

  async updateOrder(req, res, next) {
    try {
      const validation = validateOrder(req.body);
      if (!validation.isValid) {
        return res.status(400).json({ 
          success: false, 
          errors: validation.errors 
        });
      }

      const updatedOrder = await orderService.updateOrder(req.params.id, req.body);
      res.json({ success: true, data: updatedOrder });
    } catch (error) {
      next(error);
    }
  },

  async getOrderById(req, res, next) {
    try {
      const order = await orderService.getOrderById(req.params.id);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = orderController;
