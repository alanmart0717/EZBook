# EZbook Backend

Backend API for the EZbook platform.

---

## Purpose

Handles authentication, users, services, bookings, and messaging.

---

## API Endpoints

Auth:
- POST /auth/register
- POST /auth/login

Users:
- GET /users/:id
- PUT /users/:id

Services:
- GET /services
- POST /services

Bookings:
- POST /bookings
- GET /bookings/:userId

Messages:
- POST /messages
- GET /messages/:chatId

---

## Architecture

- Express server
- PostgreSQL database
- JWT authentication
- MVC structure (models, controllers, routes)

---

## Project Status

In progress