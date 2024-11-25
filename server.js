/*

const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// SQLite Database connection
const db = new sqlite3.Database("./kanban.db", (err) => {
    if (err) {
        console.error("Failed to connect to SQLite database:", err.message);
    } else {
        console.log("Connected to SQLite database.");
    }
});

// Enable foreign keys in SQLite
db.run("PRAGMA foreign_keys = ON");

// Create tables if they don’t exist
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS boards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS lists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            board_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            position INTEGER NOT NULL,
            FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
        )
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            list_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            position INTEGER NOT NULL,
            FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
        )
    `);
});

// Save a board
app.post("/saveBoard", (req, res) => {
    const { boardName, lists } = req.body;

    // Insert the board into the boards table
    db.run("INSERT INTO boards (name) VALUES (?)", [boardName], function (err) {
        if (err) {
            console.error("Error saving board:", err.message);
            return res.status(500).send("Error saving board.");
        }

        const boardId = this.lastID; // Get the last inserted row ID

        // Insert each list into the lists table
        const listPromises = lists.map((list, index) =>
            new Promise((resolve, reject) => {
                db.run(
                    "INSERT INTO lists (board_id, name, position) VALUES (?, ?, ?)",
                    [boardId, list.name, index],
                    function (err) {
                        if (err) reject(err);
                        resolve(this.lastID); // Get the last inserted list ID
                    }
                );
            })
        );

        Promise.all(listPromises)
            .then(() => res.status(200).send("Board saved successfully."))
            .catch((err) => {
                console.error("Error saving lists:", err.message);
                res.status(500).send("Error saving lists.");
            });
    });
});

// Fetch all boards
app.get("/getBoards", (req, res) => {
    db.all("SELECT id, name FROM boards", (err, rows) => {
        if (err) {
            console.error("Error fetching boards:", err.message);
            return res.status(500).send("Error fetching boards.");
        }
        res.status(200).json(rows);
    });
});

// Fetch lists and tasks for a specific board
app.get("/getBoardDetails", (req, res) => {
    const boardId = req.query.boardId;

    if (!boardId) {
        return res.status(400).send("Board ID is required.");
    }

    const boardDetails = {};

    // Fetch the board details
    db.get("SELECT id, name FROM boards WHERE id = ?", [boardId], (err, board) => {
        if (err) {
            console.error("Error fetching board details:", err.message);
            return res.status(500).send("Error fetching board details.");
        }
        if (!board) {
            return res.status(404).send("Board not found.");
        }

        boardDetails.board = board;

        // Fetch lists for the board
        db.all("SELECT id, name, position FROM lists WHERE board_id = ?", [boardId], (err, lists) => {
            if (err) {
                console.error("Error fetching lists:", err.message);
                return res.status(500).send("Error fetching lists.");
            }

            boardDetails.lists = lists;

            // Fetch tasks for each list
            const taskPromises = lists.map((list) =>
                new Promise((resolve, reject) => {
                    db.all("SELECT id, title, description, position FROM tasks WHERE list_id = ?", [list.id], (err, tasks) => {
                        if (err) reject(err);
                        list.tasks = tasks; // Add tasks to the respective list
                        resolve();
                    });
                })
            );

            Promise.all(taskPromises)
                .then(() => res.status(200).json(boardDetails))
                .catch((err) => {
                    console.error("Error fetching tasks:", err.message);
                    res.status(500).send("Error fetching tasks.");
                });
        });
    });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


*/
