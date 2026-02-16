/**
 * Validation utilities
 */

const validateMenuItem = (item) => {
  const errors = [];

  if (!item.name || item.name.trim() === '') {
    errors.push('Name is required');
  }

  if (!item.price || item.price <= 0) {
    errors.push('Price must be greater than 0');
  }

  if (!item.category || item.category.trim() === '') {
    errors.push('Category is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateOrder = (order) => {
  const errors = [];

  if (!order.tableNumber) {
    errors.push('Table number is required');
  }

  if (!order.items || order.items.length === 0) {
    errors.push('Order must contain at least one item');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateTable = (table) => {
  const errors = [];

  if (!table.number) {
    errors.push('Table number is required');
  }

  if (!table.capacity || table.capacity <= 0) {
    errors.push('Capacity must be greater than 0');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateMenuItem,
  validateOrder,
  validateTable
};
