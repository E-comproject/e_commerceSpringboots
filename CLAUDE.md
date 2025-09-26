# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack e-commerce application with a **Spring Boot backend** and **Next.js frontend**, containerized with Docker for the database layer. The system implements JWT authentication, WebSocket-based chat functionality, product management, shopping cart, order processing, and review systems.

## Architecture

### Backend (Spring Boot 3.2.0)
- **Package Structure**: `com.ecommerce.EcommerceApplication`
- **Java Version**: 21
- **Database**: PostgreSQL with JPA/Hibernate
- **Authentication**: JWT tokens with Spring Security
- **Real-time**: WebSocket support for chat functionality
- **Testing**: Includes concurrency tests for order processing

### Frontend (Next.js 14)
- **Framework**: Next.js with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Forms**: React Hook Form

### Database
- **PostgreSQL 15** running in Docker container
- **pgAdmin 4** for database management via web interface

## Development Commands

### Database Setup
```bash
# Start PostgreSQL and pgAdmin containers
scripts/start-database.bat
# OR
docker-compose up -d

# Stop database
scripts/stop-database.bat
# OR
docker-compose down

# Access database directly
docker exec -it ecommerce_postgres psql -U postgres -d ecommerce_dev
```

### Backend (Spring Boot)
```bash
cd backend

# Development mode
mvn spring-boot:run -Dspring.profiles.active=dev
# OR use script
scripts/start-backend.bat

# Production mode
mvn spring-boot:run -Dspring.profiles.active=prod

# Run tests
mvn test

# Build
mvn clean package
```

### Frontend (Next.js)
```bash
cd frontend

# Install dependencies
npm install

# Development server
npm run dev
# OR use script
scripts/start-frontend.bat

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Key Domain Models

### Core Entities
- **Product**: Product catalog with images, pricing, shop association
- **ProductVariant**: Product variations (size, color, storage) with individual SKUs and stock
- **Shop**: Merchant/seller entities that own products
- **Cart/CartItem**: Shopping cart functionality (supports both products and variants)
- **Order/OrderItem**: Order processing with concurrency handling (supports both products and variants)
- **Review**: Product reviews with user ratings
- **ChatRoom/ChatMessage**: Real-time chat between users

### Authentication
- JWT-based authentication with configurable expiration
- Spring Security integration with custom user details

## Environment Configuration

### Development Profile (`dev`)
- Database: `ecommerce_dev`
- DDL: `create-drop` (recreates schema on restart)
- SQL logging enabled
- Debug logging level

### Production Profile (`prod`)
- Database: `ecommerce_prod`
- DDL: `validate` (schema validation only)
- SQL logging disabled
- Info logging level

## Database Access
- **PostgreSQL**: `localhost:5432` (postgres/password)
- **pgAdmin**: `http://localhost:5050` (admin@ecommerce.com/admin123)

## API Structure
- **Base URL**: `http://localhost:8080/api`
- **CORS**: Frontend allowed on `http://localhost:3000`

## Testing
- Spring Boot Test with H2 in-memory database for tests
- Concurrency tests for order processing to prevent race conditions
- Use `@ActiveProfiles("test")` for test configurations

## WebSocket Configuration
- Chat functionality implemented with STOMP protocol
- WebSocket endpoint configuration in `WsConfig.java`

## Important Notes
- The system has inventory management capabilities (some files deleted in current branch)
- Order processing includes concurrency handling to prevent overselling
- Review system prevents duplicate reviews per user-product combination
- Chat system supports real-time messaging between users

## Product Variants System

The system supports product variants (e.g., size, color, storage) with the following features:

### Database Tables
- `product_variants`: Stores variant data with JSONB options field
- `product_variant_images`: Variant-specific images
- Updated `cart_items` and `order_items` to support variants

### Key Variant Features
- **Flexible Options**: JSON-based variant options (color, size, storage, etc.)
- **Individual Pricing**: Variants can have their own price or inherit from parent
- **Stock Management**: Each variant tracks its own inventory
- **SKU Generation**: Auto-generated unique SKUs for variants
- **Price Ranges**: Products show min/max prices when variants have different prices

### API Endpoints
- `GET /api/products/{id}/variants` - Get product variants
- `POST /api/products/{id}/variants` - Create variant
- `GET /api/products/{id}/variant-options` - Get available options
- `POST /api/cart/items` - Add variant to cart (supports both products and variants)

### Usage Examples
```json
// T-Shirt with size and color variants
{
  "variantOptions": {"color": "Red", "size": "M"},
  "sku": "TSHIRT-RED-M",
  "price": 299.00,
  "stockQuantity": 15
}

// iPhone with storage and color variants
{
  "variantOptions": {"storage": "256GB", "color": "Space Black"},
  "sku": "IP15P-256GB-BLACK",
  "price": 45900.00,
  "stockQuantity": 8
}
```

See `PRODUCT_VARIANTS_GUIDE.md` for detailed implementation guide and examples.