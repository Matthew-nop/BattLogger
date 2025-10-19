# BattLogger Project Summary

## Development

When making changes to the application, it is important to run the build, tests, and linter to ensure that the changes are correct and do not introduce any regressions. The following commands can be used for this purpose:

*   **`npm run build`**: Compiles the TypeScript code and builds the frontend and backend of the application.
*   **`npm run lint`**: Lints the code to check for any style issues or potential errors.
*   **`npm run test`**: Runs the unit and integration tests for the backend API.

It is recommended to run these commands in the order listed above after making any changes to the codebase.

## Project Overview

BattLogger is a web application designed for logging and tracking battery data. It features a frontend built with HTML, SCSS, and TypeScript, and a backend powered by Node.js, Express, and a SQLite database.

## Directory Structure

### `src/` - Source Code

This is the main directory containing the application's source code, divided into frontend, backend, and shared interfaces.

*   **`src/backend/`**: The backend of the application.
    *   **`handlers/`**: Contains Express route handlers that are responsible for processing incoming API requests and sending responses. Each handler corresponds to a specific data model (e.g., `batteryHandler.ts`, `modelHandler.ts`).
    *   **`utils/`**: A collection of utility modules for the backend. This includes database interaction helpers (`dbUtils.ts`), API route definitions (`apiRoutes.ts`), application bootstrapping (`bootstrap.ts`), and database table creation (`createTables.ts`).
    *   **Manager Classes (`*.ts`)**: These are singleton classes that encapsulate the business logic for different data models, such as `BatteryManager.ts`, `ChemistryManager.ts`, and `ModelManager.ts`. They are responsible for interacting with the database and providing data to the handlers.
    *   **`server.ts`**: The entry point for the backend application. It initializes the Express server, connects to the database, and starts listening for requests.

*   **`src/frontend/`**: The user-facing part of the application.
    *   **`components/`**: A collection of reusable UI components, each with its own HTML, SCSS, and TypeScript file. These components are used to build the different pages of the application.
    *   **`index.html`**: The main HTML file that serves as the entry point for the frontend.
    *   **`main.ts`**: The primary TypeScript file for the frontend. It handles the main application logic, including UI interactions, data fetching, and rendering.
    *   **`style.scss`**: The main stylesheet for the application, written in SCSS.

*   **`src/interfaces/`**: Contains all the TypeScript interfaces used throughout the application, ensuring type safety and consistency.
    *   **`api/`**: Defines the interfaces for the data structures used in API requests and responses.
    *   **`tables/`**: Defines the interfaces that represent the structure of the database tables.

### `tests/` - Automated Tests

This directory contains all the automated tests for the application, ensuring code quality and correctness.

*   **`e2e/`**: End-to-end tests written using Playwright. These tests simulate user interactions with the application in a real browser environment.
*   **`jest/`**: Unit and integration tests for the backend API, written using Jest and Supertest. These tests verify the functionality of the API endpoints and business logic.
*   **`utils/`**: Utility functions to support the tests, such as setting up and tearing down the test database and environment.

### `data/` - Static Data

This directory contains JSON files with built-in data that is used to populate the database with initial values, such as a list of common battery chemistries and form factors.

### `build/` - Build Scripts

This directory contains scripts related to the build process of the application.

### `.github/` - CI/CD

This directory contains the configuration for GitHub Actions workflows, which are used for continuous integration and deployment.

### Root Directory

The root directory of the project contains various configuration files, including:

*   **`package.json`**: Defines the project's dependencies, scripts, and other metadata.
*   **`tsconfig.json`**: The configuration file for the TypeScript compiler.
*   **`eslint.config.js`**: The configuration file for the ESLint linter.
*   **`jest.config.ts`**: The configuration file for the Jest testing framework.
*   **`playwright.config.ts`**: The configuration file for the Playwright end-to-end testing framework.
