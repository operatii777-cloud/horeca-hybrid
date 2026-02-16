/**
 * Table Service
 * Business logic for table management
 */

const Table = require('../models/Table');

const tableService = {
  async getAllTables() {
    return Table.findAll();
  },

  async createTable(tableData) {
    return Table.create(tableData);
  },

  async updateTable(id, tableData) {
    return Table.update(id, tableData);
  }
};

module.exports = tableService;
