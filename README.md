# Inventory Management System

A comprehensive inventory management application built with modern web technologies. This application provides a complete solution for managing warehouse inventory, tracking items, handling incoming and outgoing goods, processing purchase orders, and managing user roles and permissions.

Demo Web : https://demoinventorymanagement18391.netlify.app

## Features

- **User Authentication & Authorization**: Role-based access control with different user types (admin, warehouse staff, department users, head of warehouse)
- **Dashboard**: Overview of inventory status, recent activities, and key metrics
- **Item Management**: Create, update, and manage inventory items with categories and suppliers
- **Category Management**: Organize items into categories for better organization
- **Supplier Management**: Track supplier information and relationships
- **Incoming Goods**: Process and track incoming inventory items
- **Outgoing Goods**: Manage and track outgoing inventory items
- **Purchase Orders**: Create and manage purchase orders for inventory replenishment
- **Item Requests**: Allow users to request items from inventory
- **Approvals**: Approval workflow for managing item requests and purchase orders
- **Stock Movements**: Track all inventory movements and changes
- **Reports**: Generate various reports for inventory analysis and insights
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## Tech Stack

### Frontend
- **React 18**: Modern component-based UI library
- **TypeScript**: Type-safe JavaScript development
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Reusable UI components
- **Radix UI**: Accessible UI primitives
- **TanStack Query**: Server state management (formerly React Query)
- **React Router**: Client-side routing
- **Lucide React**: Beautiful icon library
- **Zod**: Schema validation
- **React Hook Form**: Form management and validation

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **Prisma**: Modern database toolkit and ORM
- **PostgreSQL**: Database adapter (via Prisma)
- **JSON Web Tokens (JWT)**: Authentication and authorization
- **Bcrypt**: Password hashing
- **CORS**: Cross-origin resource sharing

### Development Tools
- **ESLint**: Code linting
- **TypeScript**: Static type checking
- **PostCSS**: CSS processing
- **Nodemon**: Development server with auto-restart

## Project Structure

```
├── src/                    # Frontend source code
│   ├── components/         # Reusable UI components
│   ├── contexts/           # React context providers
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions and libraries
│   ├── pages/              # Application pages
│   ├── types/              # TypeScript type definitions
│   ├── App.tsx            # Main application component
│   └── main.tsx           # Application entry point
├── backend/               # Backend server code
│   ├── src/               # Server source files
│   └── package.json       # Backend dependencies
├── public/                # Static assets
└── package.json           # Frontend dependencies
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Bun (or npm/yarn) package manager
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd remix-of-inventory-canvas-main
```

2. Install frontend dependencies:
```bash
bun install
```

3. Navigate to the backend directory and install backend dependencies:
```bash
cd backend
bun install
```

4. Set up environment variables:
   - Create a `.env` file in the `backend` directory
   - Add your database connection string and JWT secret:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/inventory_db"
JWT_SECRET="your-super-secret-jwt-key"
```

5. Set up the database:
```bash
cd backend
bun run db:migrate
bun run db:seed  # Optional: to populate with sample data
```

### Running the Application

1. Start the backend server:
```bash
cd backend
bun run dev
```

2. In a new terminal, start the frontend development server:
```bash
bun run dev
```

3. Open your browser and navigate to `http://localhost:5173` (or the port shown in the terminal)

### Available Scripts

#### Frontend Scripts
- `bun run dev` - Start the development server
- `bun run build` - Build the application for production
- `bun run build:dev` - Build the application in development mode
- `bun run lint` - Lint the codebase
- `bun run preview` - Preview the production build locally

#### Backend Scripts
- `bun run dev` - Start the development server with auto-restart
- `bun run start` - Start the production server
- `bun run db:generate` - Generate Prisma client
- `bun run db:push` - Push schema changes to database
- `bun run db:migrate` - Run database migrations
- `bun run db:seed` - Seed the database with sample data
- `bun run db:studio` - Open Prisma Studio for database management

## User Roles & Permissions

- **Admin**: Full access to all features and user management
- **Warehouse Staff**: Manage items, categories, suppliers, incoming/outgoing goods
- **Department User**: Request items and view relevant information
- **Head of Warehouse**: Approve requests and manage stock movements/reports

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please file an issue in the repository.
