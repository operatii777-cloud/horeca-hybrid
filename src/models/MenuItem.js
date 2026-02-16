/**
 * MenuItem Model
 */

class MenuItem {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.price = data.price;
    this.category = data.category;
    this.available = data.available !== undefined ? data.available : true;
  }

  static async findAll() {
    // TODO: Implement database query
    return [];
  }

  static async create(itemData) {
    // TODO: Implement database insert
    return new MenuItem({ id: Date.now(), ...itemData });
  }

  static async update(id, itemData) {
    // TODO: Implement database update
    return new MenuItem({ id, ...itemData });
  }

  static async delete(id) {
    // TODO: Implement database delete
    return true;
  }
}

module.exports = MenuItem;
