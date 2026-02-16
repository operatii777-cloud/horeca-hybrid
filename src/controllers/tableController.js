/**
 * Table Controller
 * Handles table management operations
 */

const tableService = require('../services/tableService');
const { validateTable } = require('../utils/validation');

const tableController = {
  async getTables(req, res, next) {
    try {
      const tables = await tableService.getAllTables();
      res.json({ success: true, data: tables });
    } catch (error) {
      next(error);
    }
  },

  async addTable(req, res, next) {
    try {
      const validation = validateTable(req.body);
      if (!validation.isValid) {
        return res.status(400).json({ 
          success: false, 
          errors: validation.errors 
        });
      }

      const newTable = await tableService.createTable(req.body);
      res.status(201).json({ success: true, data: newTable });
    } catch (error) {
      next(error);
    }
  },

  async updateTable(req, res, next) {
    try {
      const validation = validateTable(req.body);
      if (!validation.isValid) {
        return res.status(400).json({ 
          success: false, 
          errors: validation.errors 
        });
      }

      const updatedTable = await tableService.updateTable(req.params.id, req.body);
      res.json({ success: true, data: updatedTable });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = tableController;
