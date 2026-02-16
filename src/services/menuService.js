/**
 * Menu Service
 * Business logic for menu operations
 */

const MenuItem = require('../models/MenuItem');

const menuService = {
  async getAllItems() {
    return MenuItem.findAll();
  },

  async createItem(itemData) {
    return MenuItem.create(itemData);
  },

  async updateItem(id, itemData) {
    return MenuItem.update(id, itemData);
  },

  async deleteItem(id) {
    return MenuItem.delete(id);
  }
};

module.exports = menuService;
