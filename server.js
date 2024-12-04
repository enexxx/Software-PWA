// run npx nodemon server.js

import express from 'express';
import sqlite3 from 'sqlite3';
import bodyParser from 'body-parser';
import path from "path";

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const db = new sqlite3.Database('./database/kanban.db');

app.use(bodyParser.json());
app.use(express.static('public'));


export const fetchAll = async (db, sql, params) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
};
  
export const fetchFirst = async (db, sql, params) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
        if (err) reject(err);
        resolve(row);
        });
    });
};


app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "public/index.html"));
});
  

app.post('/saveData', (req, res) => {
    const appData = req.body;

    db.serialize(() => {
        db.run(`UPDATE AppMetadata SET currentBoard = ?`, [appData.currentBoard]);

        db.run(`DELETE FROM Boards`);
        appData.boards.forEach((board) => {
            db.run(
                `INSERT INTO Boards (id, name, counter) 
                VALUES (?, ?, ?)`,
                [board.id, board.name, board.counter]
            );

            db.run(`DELETE FROM Lists WHERE parentBoardId = ?`, [board.id]);
            board.lists.forEach((list) => {
                db.run(
                    `INSERT INTO Lists (id, name, parentBoardId) 
                     VALUES (?, ?, ?)`,
                    [list.id, list.name, board.id]
                );

                db.run(`DELETE FROM Tasks WHERE taskListId = ?`, [list.id]);
                list.tasks.forEach((task) => {
                    db.run(
                        `INSERT INTO Tasks (id, title, body, taskListId) 
                         VALUES (?, ?, ?, ?)`,
                        [task.id, task.title, task.body, list.id]
                    );

                    db.run(`DELETE FROM TaskTags WHERE taskId = ?`, [task.id]);
                    task.tags.forEach((tagName) => {
                        const tag = board.tags.find((t) => t.name === tagName);
                        if (tag) {
                            db.run(
                                `INSERT INTO TaskTags (taskId, tagId) 
                                 VALUES (?, (SELECT id FROM Tags WHERE name = ? AND boardId = ?))`,
                                [task.id, tag.name, board.id]
                            );
                        }
                    });
                });
            });

            db.run(`DELETE FROM Tags WHERE boardId = ?`, [board.id]);
            board.tags.forEach((tag) => {
                db.run(
                    `INSERT INTO Tags (name, colour, boardId) 
                     VALUES (?, ?, ?)`,
                    [tag.name, tag.colour, board.id]
                );
            });
        });

        res.send('Data saved successfully.');
    });
});


app.get('/loadData', async (req, res) => {
    let appData = { boards: [], currentBoard: 0 };

    let boards = await fetchAll(db, `SELECT * FROM Boards`)
    if (boards.length === 0) return res.json(appData);

    for (let board of boards) {
        let boardElement = {
            name: board.name,
            id: board.id,
            counter: board.counter,
            lists: [],
            tags: []
        };

        let lists = await fetchAll(db, `SELECT * FROM Lists WHERE parentBoardId = ?`, [board.id]);
        for (let list of lists) {
            let listElement = {
                name: list.name,
                id: list.id,
                parentBoardId: list.parentBoardId,
                tasks: []
            };

            let tasks = await fetchAll(db, `SELECT * FROM Tasks WHERE taskListId = ?`, [list.id])
            for (let task of tasks) {
                let taskElement = {
                    title: task.title,
                    body: task.body,
                    id: task.id,
                    tags: [],
                    taskListId: task.taskListId
                };

                let tags = await fetchAll(
                    db,
                    `SELECT Tags.name FROM TaskTags 
                    INNER JOIN Tags ON TaskTags.tagId = Tags.id 
                    WHERE TaskTags.taskId = ?`,
                    [task.id],
                );
                taskElement.tags = tags.map((tag) => tag.name);

                listElement.tasks.push(taskElement);
            };

            boardElement.lists.push(listElement);
        };

        let tags = await fetchAll(db, `SELECT * FROM Tags WHERE boardId = ?`, [board.id]);
        boardElement.tags = tags.map((tag) => ({ name: tag.name, colour: tag.colour }));
        
        appData.boards.push(boardElement);
    };

    let metadata = await fetchFirst(db, `SELECT * FROM Metadata LIMIT 1`)
    appData.currentBoard = metadata.currentBoard >= 0 ? metadata.currentBoard : 0;
    
    res.json(appData);
});

app.listen(3000, () => {
    console.log(`Server running on http://localhost:3000`);
});
