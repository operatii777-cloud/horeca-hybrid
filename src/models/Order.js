/**
 * Order Model
 */

class Order {
  constructor(data) {
    this.id = data.id;
    this.tableNumber = data.tableNumber;
    this.items = data.items || [];
    this.totalAmount = data.totalAmount;
    this.status = data.status || 'pending';
    this.createdAt = data.createdAt || new Date();
  }

  static async findAll() {
    // TODO: Implement database query
    return [];
  }

  static async findById(id) {
    // TODO: Implement database query
    return null;
  }

  static async create(orderData) {
    // TODO: Implement database insert
    return new Order({ id: Date.now(), ...orderData });
  }

  static async update(id, orderData) {
    // TODO: Implement database update
    return new Order({ id, ...orderData });
  }
}

module.exports = Order;
