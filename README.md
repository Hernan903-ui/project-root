# POS & Inventory Management System

This project is a comprehensive Point of Sale (POS) and Inventory Management System designed to streamline retail operations. It features a FastAPI backend and a React frontend.

## Project Structure

- **/backend**: Contains the FastAPI application providing the API.
- **/frontend**: Contains the React application for the user interface.

## Prerequisites

- Python 3.8+
- Node.js and npm (or yarn)
- PostgreSQL (or another SQLAlchemy-compatible database)

## Setup and Running

Detailed setup instructions for each part are available in their respective README files:

- [Backend Setup](./backend/README.md)
- [Frontend Setup](./frontend/README.md)

### General Workflow

1.  **Set up the Backend:**
    *   Install Python dependencies.
    *   Configure environment variables (database connection, secrets).
    *   Run database migrations (if applicable - current setup uses `init_db()` which creates tables based on models).
    *   Start the FastAPI server.
2.  **Set up the Frontend:**
    *   Install Node.js dependencies.
    *   Configure environment variables (API URL).
    *   Start the React development server.

Once both backend and frontend servers are running, the application should be accessible in your browser (typically `http://localhost:3000` for the frontend).

## Contributing

[Details about contributing to the project, if applicable. E.g., coding standards, pull request process.]

## License

[Specify the project license, e.g., MIT License.]
