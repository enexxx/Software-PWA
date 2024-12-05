// run 'npx nodemon server.js'

import express from 'express';
import sqlite3 from 'sqlite3';
import bodyParser from 'body-parser';
import path from "path";

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const db = new sqlite3.Database('./database/appData.db');

app.use(bodyParser.json());
app.use(express.static('public'));


export const allQuery = async (db, sql, params) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            resolve(rows);
      });
    });
};
  
export const getQuery = async (db, sql, params) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            resolve(row);
        });
    });
};

export const runQuery = async (db, sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            resolve();
        });
    });
};


app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "public/index.html"));
});
  

app.post('/saveData', async (req, res) => {
    let appData = req.body;

    await runQuery(db, `UPDATE Metadata SET currentBoard = ?`, [appData.currentBoard]);

    await runQuery(db, 'PRAGMA foreign_keys = ON');
    await runQuery(db, `DELETE FROM Boards`);   // should work to delete eveyrthing with ON DELETE CASCADE, foreign_keys is disable by defeualt though.
    
    /*  // order should be like this otherwise tables will search for a parent and not find them. Shouldnt need to do though if ON DELETE CASCADE works
        db.run(`DELETE FROM TaskTags`);
        db.run(`DELETE FROM Tasks`);
        db.run(`DELETE FROM Lists`);
        db.run(`DELETE FROM Tags`);
        db.run(`DELETE FROM Boards`);
        db.run(`DELETE FROM Metadata`);
    */

    for (let board of appData.boards) {
        await runQuery(db, 
            `INSERT OR REPLACE INTO Boards (id, name, counter) 
            VALUES (?, ?, ?)`,
            [board.id, board.name, board.counter]
        );

        for (let list of board.lists) {
            await runQuery(db, 
                `INSERT OR REPLACE INTO Lists (id, name, parentBoardId) 
                VALUES (?, ?, ?)`,
                [list.id, list.name, board.id]
            );

            for (let task of list.tasks) {
                await runQuery(db, 
                    `INSERT OR REPLACE INTO Tasks (id, title, body, taskListId) 
                    VALUES (?, ?, ?, ?)`,
                    [task.id, task.title, task.body, list.id]
                );

                for (let tagName of task.tags) {
                    let tag = board.tags.find((t) => t.name === tagName);
                    if (tag) {
                        await runQuery(db, 
                            `INSERT OR REPLACE INTO TaskTags (taskId, tagId) 
                            VALUES (?, (SELECT id FROM Tags WHERE name = ? AND boardId = ?))`,
                            [task.id, tag.name, board.id]
                        );
                    }
                }
            }
        }

        for (let tag of board.tags) {
            await runQuery(db, 
                `INSERT OR REPLACE INTO Tags (name, colour, boardId) 
                VALUES (?, ?, ?)`,
                [tag.name, tag.colour, board.id]
            );
        }
    }

    res.status(200).send({ message: 'Data saved successfully.' });
});



app.get('/loadData', async (req, res) => {
    let appData = { boards: [], currentBoard: 0 };

    let boards = await allQuery(db, `SELECT * FROM Boards`)
    if (boards.length == 0) return res.status(500).json(appData);

    for (let board of boards) {
        let boardElement = {
            name: board.name,
            id: board.id,
            counter: board.counter,
            lists: [],
            tags: []
        };

        let lists = await allQuery(db, `SELECT * FROM Lists WHERE parentBoardId = ?`, [board.id]);
        for (let list of lists) {
            let listElement = {
                name: list.name,
                id: list.id,
                parentBoardId: list.parentBoardId,
                tasks: []
            };

            let tasks = await allQuery(db, `SELECT * FROM Tasks WHERE taskListId = ?`, [list.id]);
            for (let task of tasks) {
                let taskElement = {
                    title: task.title,
                    body: task.body,
                    id: task.id,
                    tags: [],
                    taskListId: task.taskListId
                };

                let tags = await allQuery(
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

        let tags = await allQuery(db, `SELECT * FROM Tags WHERE boardId = ?`, [board.id]);
        boardElement.tags = tags.map((tag) => ({ name: tag.name, colour: tag.colour }));
        
        appData.boards.push(boardElement);
    };

    let metadata = await getQuery(db, `SELECT * FROM Metadata LIMIT 1`);
    appData.currentBoard = metadata != null ? metadata.currentBoard : 0;

    console.log(appData);
    
    res.status(200).json(appData);
});


app.get('/clearData', async (req, res) => {
    db.serialize(() => {
      db.run(`DELETE FROM Metadata`);
      db.run(`DELETE FROM Boards`);
      db.run(`DELETE FROM Lists`);
      db.run(`DELETE FROM Tasks`);
      db.run(`DELETE FROM Tags`);
      db.run(`DELETE FROM TaskTags`);
    });
});



app.listen(3000, () => {
    console.log(`Server running on http://localhost:3000`);
});
