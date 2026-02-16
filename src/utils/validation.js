/**
 * Validation utilities
 */

const validateMenuItem = (item) => {
  const errors = [];

  if (!item.name || item.name.trim() === '') {
    errors.push('Name is required');
  }

  if (item.price === null || item.price === undefined || typeof item.price !== 'number' || item.price <= 0) {
    errors.push('Price must be a number greater than 0');
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

  if (order.tableNumber === null || order.tableNumber === undefined) {
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

  if (table.number === null || table.number === undefined) {
    errors.push('Table number is required');
  }

  if (table.capacity === null || table.capacity === undefined || typeof table.capacity !== 'number' || table.capacity <= 0) {
    errors.push('Capacity must be a number greater than 0');
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
