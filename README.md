# HoReCa Hybrid

A hybrid restaurant management application for modern food service businesses.

## Features

- **Menu Management**: Create, update, and manage restaurant menu items
- **Order Processing**: Handle customer orders efficiently
- **Table Management**: Manage restaurant tables and reservations
- **RESTful API**: Clean and well-structured API endpoints

## Project Structure

```
horeca-hybrid/
├── src/
│   ├── config/          # Application configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── app.js           # Express app setup
│   └── index.js         # Application entry point
├── package.json
└── README.md
```

## Installation

```bash
npm install
```

## Usage

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

## API Endpoints

### Menu

- `GET /api/menu` - Get all menu items
- `POST /api/menu` - Add a new menu item
- `PUT /api/menu/:id` - Update a menu item
- `DELETE /api/menu/:id` - Delete a menu item

### Orders

- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create a new order
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id` - Update an order

### Tables

- `GET /api/tables` - Get all tables
- `POST /api/tables` - Add a new table
- `PUT /api/tables/:id` - Update table information

## Architecture

This application follows a clean architecture pattern with separation of concerns:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic
- **Models**: Define data structures
- **Middleware**: Process requests before they reach controllers
- **Utils**: Provide helper functions

## License

ISC

