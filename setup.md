# Setup Manual: Hackathon Registration Backend

This document provides step-by-step instructions for setting up and running the backend for the Tech Hackathon 2025 Registration System.

## 1. Prerequisites

Ensure you have the following software installed on your machine:
- **Node.js:** (v14.x or later) and **npm**. You can download them from the official Node.js website.
- **MySQL Server:** A running instance of MySQL or a compatible database like MariaDB.

## 2. File Placement

Organize your project files according to the following structure. This is crucial for the Express static file server and scripts to work correctly[3][13].

/ (your project root folder)
├── public/
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   ├── admin.html
│   ├── admin.css
│   └── admin.js
├── scripts/
│   └── init-database.js
├── .env                  (You will create this file)
├── package.json
├── package-lock.json
└── server.js


## 3. Installation

Navigate to the root of your project folder in your terminal and run the following command. This will download and install all the project dependencies listed in `package.json` into a `node_modules` folder[1][13].

npm install


## 4. Database Configuration

1.  In the project's root directory, create a new file named `.env`.
2.  Open the `.env` file and add the following lines. Replace `your_mysql_password` with your actual MySQL root password or the password for the user you've configured[3][4].

    ```
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_mysql_password
    DB_NAME=hackathon_db
    DB_PORT=3306
    PORT=3000
    ```
    *   **Note:** The `server.js` and `init-database.js` files are configured to read these values[3][4].

## 5. Initialize the Database

With your MySQL server running, execute the following command in your terminal. This script connects to MySQL, creates the `hackathon_db` database if it doesn't exist, creates the necessary tables (`teams`, `team_members`, etc.), and adds some sample data[1][4].

npm run init-db


You should see success messages in your console indicating that the database and tables were created.

## 6. Run the Application Server

You can start the server in two ways[1]:

-   **Development Mode:** This uses `nodemon` to automatically restart the server whenever you save a file change. This is ideal for development.
    ```
    npm run dev
    ```

-   **Production Mode:** This runs the server using `node`.
    ```
    npm start
    ```

After running either command, you'll see a message like `🚀 Server running on http://localhost:3000`. You can now access the application in your web browser[3]:
-   **Registration Page:** `http://localhost:3000/`
-   **Admin Dashboard:** `http://localhost:3000/admin`

## Troubleshooting

-   **`ER_ACCESS_DENIED_ERROR`:** Double-check your `DB_USER` and `DB_PASSWORD` in the `.env` file. Ensure the MySQL user has privileges to create databases and tables.
-   **`ECONNREFUSED`:** Make sure your MySQL server is running.
-   **`nodemon` command not found:** Ensure `nodemon` is listed in your `devDependencies` in `package.json` and that you have run `npm install`[1].

