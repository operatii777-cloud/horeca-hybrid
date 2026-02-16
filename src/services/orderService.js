/**
 * Order Service
 * Business logic for order operations
 */

const Order = require('../models/Order');

const orderService = {
  async getAllOrders() {
    return Order.findAll();
  },

  async createOrder(orderData) {
    return Order.create(orderData);
  },

  async updateOrder(id, orderData) {
    return Order.update(id, orderData);
  },

  async getOrderById(id) {
    return Order.findById(id);
  }
};

module.exports = orderService;
