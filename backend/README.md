# Backend - POS & Inventory API

This is the FastAPI backend for the POS & Inventory Management System.

## Prerequisites

- Python 3.8+
- PostgreSQL (or ensure your `DATABASE_URL` in the `.env` file points to a compatible database)
- Pip (Python package installer)

## Setup

1.  **Clone the Repository (if not already done):**
    ```bash
    git clone <repository-url>
    cd <repository-url>/backend
    ```

2.  **Create and Activate a Virtual Environment (Recommended):**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scriptsctivate
    ```

3.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure Environment Variables:**
    *   Create a `.env` file in the `backend` directory by copying the example (if one is provided, e.g., `.env.example`) or creating it from scratch.
    *   Key variables to set in `.env`:
        *   `DATABASE_URL`: The connection string for your database.
            *   Example for PostgreSQL: `postgresql://user:password@host:port/dbname`
        *   `SECRET_KEY`: A strong, random string used for security purposes (e.g., token generation). You can generate one using `openssl rand -hex 32`.
        *   `ALGORITHM`: The algorithm for JWT encoding (default is "HS256").
        *   `ACCESS_TOKEN_EXPIRE_MINUTES`: Default is 30.
        *   `ENVIRONMENT`: Set to "development" for development, "production" for production. This affects things like the `seed_database` endpoint.
        *   `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_EMAIL`: Credentials for the initial admin user created by `init_db()`.

5.  **Initialize the Database:**
    *   The application uses `init_db()` on startup (see `backend/app/main.py` and `backend/app/initialization.py`), which should create tables based on your SQLAlchemy models. Ensure your database server is running and accessible.
    *   The `init_db()` function also attempts to create a default admin user if one doesn't exist, using credentials from the environment variables.

## Running the Application

1.  **Start the FastAPI Server:**
    ```bash
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    ```
    *   `--reload` enables auto-reloading for development. Do not use in production.
    *   The API will typically be available at `http://localhost:8000`.
    *   API documentation (Swagger UI) will be at `http://localhost:8000/api/docs`.
    *   Alternative API documentation (ReDoc) will be at `http://localhost:8000/api/redoc`.

## Running Tests

*   The project contains a `tests` directory (`backend/tests/`).
*   To run tests (assuming `pytest` is installed, which should be if it's in `requirements.txt`):
    ```bash
    pytest
    ```
    (You might need to configure a separate test database or ensure tests clean up after themselves).

## Seeding the Database (Development Only)

*   There's an endpoint `/api/seed-database` (POST request) that can be used to populate the database with example data.
*   **Security:** This endpoint is only available if the `ENVIRONMENT` variable is set to "development" and if the request comes from localhost.
*   You can use tools like `curl` or Postman to send a POST request to this endpoint.

## Project Structure Overview

- `app/main.py`: FastAPI application entry point, middleware configuration.
- `app/api/`: Contains API routers.
  - `api.py`: Aggregates all versioned API routers.
  - `routes/`: Individual route modules (e.g., `products.py`, `auth.py`).
- `app/models/`: SQLAlchemy database models.
- `app/schemas/`: Pydantic schemas for request/response validation and serialization.
- `app/services/`: Business logic separated from route handlers (e.g., `reports.py`).
- `app/utils/`: Utility functions (e.g., `security.py`).
- `app/core/`: Core configurations (e.g., `config.py`). (Note: `config.py` is currently directly in `app/`)
- `app/database.py`: Database session setup.
- `app/initialization.py`: Database initialization logic.
- `app/middleware/`: Custom middleware (logging, rate limiting).
- `requirements.txt`: Python dependencies.
- `tests/`: Automated tests.
