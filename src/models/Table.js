/**
 * Table Model
 */

class Table {
  constructor(data) {
    this.id = data.id;
    this.number = data.number;
    this.capacity = data.capacity;
    this.status = data.status || 'available';
  }

  static async findAll() {
    // TODO: Implement database query
    return [];
  }

  static async create(tableData) {
    // TODO: Implement database insert
    return new Table({ id: Date.now(), ...tableData });
  }

  static async update(id, tableData) {
    // TODO: Implement database update
    return new Table({ id, ...tableData });
  }
}

module.exports = Table;
