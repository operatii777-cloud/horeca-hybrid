/**
 * Menu Controller
 * Handles menu-related operations
 */

const menuService = require('../services/menuService');
const { validateMenuItem } = require('../utils/validation');

const menuController = {
  async getMenu(req, res, next) {
    try {
      const menu = await menuService.getAllItems();
      res.json({ success: true, data: menu });
    } catch (error) {
      next(error);
    }
  },

  async addMenuItem(req, res, next) {
    try {
      const validation = validateMenuItem(req.body);
      if (!validation.isValid) {
        return res.status(400).json({ 
          success: false, 
          errors: validation.errors 
        });
      }

      const newItem = await menuService.createItem(req.body);
      res.status(201).json({ success: true, data: newItem });
    } catch (error) {
      next(error);
    }
  },

  async updateMenuItem(req, res, next) {
    try {
      const validation = validateMenuItem(req.body);
      if (!validation.isValid) {
        return res.status(400).json({ 
          success: false, 
          errors: validation.errors 
        });
      }

      const updatedItem = await menuService.updateItem(req.params.id, req.body);
      res.json({ success: true, data: updatedItem });
    } catch (error) {
      next(error);
    }
  },

  async deleteMenuItem(req, res, next) {
    try {
      await menuService.deleteItem(req.params.id);
      res.json({ success: true, message: 'Menu item deleted' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = menuController;
