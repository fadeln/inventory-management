# Inventory Management Backend

A Node.js/Express backend with Prisma ORM for PostgreSQL.

## Setup

1. **Create the database:**
   ```bash
   createdb inventory_db
   ```

2. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment:**
   Edit `.env` file with your PostgreSQL credentials:
   ```
   DATABASE_URL="postgresql://postgres:123@localhost:5432/inventory_db"
   JWT_SECRET="your-super-secret-jwt-key-change-this"
   PORT=3001
   ```

4. **Generate Prisma client and push schema:**
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Seed the database:**
   ```bash
   npm run db:seed
   ```

6. **Start the server:**
   ```bash
   npm run dev
   ```

## Default Users

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | admin |
| warehouse | staff123 | warehouse_staff |
| purchasing | staff123 | purchasing |
| requester | staff123 | requester |

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category (admin only)

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `GET /api/suppliers/:id` - Get supplier by ID
- `POST /api/suppliers` - Create supplier
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier (admin only)

### Items
- `GET /api/items` - Get all items
- `GET /api/items/:id` - Get item by ID
- `POST /api/items` - Create item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item (admin only)

### Item Requests
- `GET /api/item-requests` - Get all requests
- `POST /api/item-requests` - Create request
- `PATCH /api/item-requests/:id/status` - Approve/reject request
- `DELETE /api/item-requests/:id` - Delete request

### Incoming Goods
- `GET /api/incoming-goods` - Get all incoming goods
- `POST /api/incoming-goods` - Create incoming goods
- `DELETE /api/incoming-goods/:id` - Delete incoming goods

### Outgoing Goods
- `GET /api/outgoing-goods` - Get all outgoing goods
- `POST /api/outgoing-goods` - Create outgoing goods
- `DELETE /api/outgoing-goods/:id` - Delete outgoing goods

### Stock Movements
- `GET /api/stock-movements` - Get all movements
- `GET /api/stock-movements/item/:itemId` - Get movements by item

### Purchase Orders
- `GET /api/purchase-orders` - Get all orders
- `POST /api/purchase-orders` - Create order
- `PATCH /api/purchase-orders/:id/status` - Approve/reject order
- `DELETE /api/purchase-orders/:id` - Delete order

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## Prisma Commands

- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run migrations
- `npm run db:seed` - Seed database
- `npm run db:studio` - Open Prisma Studio
