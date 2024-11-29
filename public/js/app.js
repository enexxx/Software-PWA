const boardContainer = document.getElementById('boardContainer');
const listsContainer = document.getElementById('listsContainer');

const sidebar = document.getElementById('sidebar');
const sidebarButton = document.getElementById('sidebarButton');
const sidebarClose = document.getElementById('sidebarClose');

const addListButton = document.getElementById('addListButton');

const boardsList = document.getElementById('boardsList');
const addBoardText = document.getElementById('addBoardText');
const addBoardButton = document.getElementById('addBoardButton');

const saveButton = document.getElementById('saveButton');
const deleteButton = document.getElementById('deleteButton');
/*
const autoSaveButton = document.getElementById('autoSave');
const settingsButton = document.getElementById('settingsButton');

const listContextMenu = document.getElementById('listContextMenu');
const listContextMenuDelete = document.getElementById('listContextMenuDelete');
const listContextMenuClear = document.getElementById('listContextMenuClear');
const listContextMenuDuplicate = document.getElementById('listContextMenuDuplicate');
*/

const alerts = document.getElementById('alerts');

const title = document.getElementById('boardTitle');



var appData = {
  'boards': [],
  'settings': {
      'userName': "User",
      'dataPersistence': true
  },
  'currentBoard': 0,
  'identifier': 0
};

let autoSaveInternalId = setInterval(function (){
  saveData();
}, 5000);


function currentLists() {
  return appData.boards[appData.currentBoard].lists;
}

function currentBoard() {
  return appData.boards[appData.currentBoard];
}


// ========= Functions ========= //

function uniqueID() {
  appData.identifier += 1;
  return 'b' + appData.identifier;
}

function getTaskFromElement(element) {
  /* Get a task object from a list task element. */

  for (let list of currentLists()) {
      for (let task of list.tasks) {
          if (task.id === element.id) {
              return task;
          }
      }
  }
}

function getListFromElement(element) {
  return currentLists().find(e => e.id === element.id);
}

function getBoardFromId(id) {
  return appData.boards.find(b => b.id === id);
}

function listBoards() {
  /* List all the boards in the sidebar. */

  boardsList.innerHTML = '';
  for (let board of appData.boards) {
      let boardTitle = document.createElement('li');
      boardTitle.innerText = board.name;
      boardTitle.id = board.id;
      if (board.id === currentBoard().id) boardTitle.classList.add('active');
      boardTitle.addEventListener('click', () => {
          renderBoard(board);
          listBoards();
      });
      boardsList.appendChild(boardTitle);
  }
}

function renderBoard(board) {
  appData.currentBoard = appData.boards.indexOf(board);
  document.title = currentBoard().name;
  title.innerText = currentBoard().name;
  renderAllLists();
}

function renderAllLists() {
  // Refreshes the whole lists container
  for (let list of listsContainer.querySelectorAll('.taskList')) {
      list.remove();
  }

  for (let list of currentLists()) {
      let newListElement = list.generateElement();
      // Insert before the add list button
      listsContainer.insertBefore(newListElement, listsContainer.childNodes[listsContainer.childNodes.length - 2]);
      list.update();
  }
}

function renderList(listID) {
  let list = currentLists().find(e => e.id === listID);

  // Handle deletions
  if (!list) {
      let listElement = document.getElementById(listID);
      listElement.parentNode.removeChild(listElement);
      return;
  }

  // Get current list element if it exists.
  let listElement = document.getElementById(list.id);
  if (listElement != null) {
      let newListElement = list.generateElement();
      listElement.parentNode.replaceChild(newListElement, listElement);
  }
  else {
      let newListElement = list.generateElement();
      // Insert before the add list button
      listsContainer.insertBefore(newListElement, listsContainer.childNodes[listsContainer.childNodes.length - 2]);
  }

  // Update event listeners
  list.update();
}

function addBoard() {
  let boardTitle = addBoardText.value;
  if (!boardTitle) boardTitle = "Unititled Board"
  addBoardText.value = '';

  let newBoard = new Board(boardTitle, uniqueID());
  appData.boards.push(newBoard);
  listBoards();
}



// ========= Classes ========== //
class Task {

  constructor(title, body, id, taskListId) {
      this.title = title;
      this.body = body
      this.id = id;
      this.isDone = false;
      this.taskListId = taskListId;
  }

  getTaskList() {
      return document.getElementById(this.taskListId);
  }

  update() {
      let element = document.getElementById(this.id);

      // no functionality yet
  }
}

class List {

  constructor(name, id, parentBoardId) {
      this.name = name;
      this.tasks = [];
      this.id = id;
      this.parentBoardId = parentBoardId;
  }

  addTask(task) {
      this.tasks.push(task);
      renderList(this.id);
  }

  removeTask(task) {
      this.tasks = this.tasks.filter(val => val !== task);
      renderList(this.id);
  }

  update() {
      for (let task of this.tasks) {
          task.update();
      }
  }

  renderTasks() {
      let taskListElement = document.createElement('ul');
      taskListElement.id = 'list-' + this.id;

      for (let task of this.tasks) {
          let taskElement = document.createElement('li');
          taskElement.id = task.id;
          taskElement.className = "task"


          let taskTitle = document.createElement('p');
          taskTitle.innerText = task.title;
          taskTitle.classList.add('taskTitle');
          taskTitle.addEventListener('click', () => {
            let input = document.createElement('textarea');
            input.value = taskTitle.textContent;
            input.classList.add('taskTitle');
            input.maxLength = 256;
            taskTitle.replaceWith(input);

            let save = () => {
                task.title = input.value;
                renderList(this.id);
            };

            input.addEventListener('blur', save, {once: true});
            input.focus();
          });


          // Button container.
          let taskButtons = document.createElement('span');
          // Delete task button
          let taskDeleteButton = document.createElement('i');
          taskDeleteButton.classList.add('fa-solid', 'fa-trash');
          taskDeleteButton.addEventListener('click', () => {this.removeTask(task);});
          taskButtons.appendChild(taskDeleteButton);


          let taskBody = document.createElement('p');
          taskBody.innerText = task.body;
          taskBody.classList.add('taskBody');
          taskBody.addEventListener('click', () => {
            let input = document.createElement('textarea');
            input.value = taskBody.textContent;
            input.classList.add('taskBody');
            taskBody.replaceWith(input);

            let save = () => {
                task.body = input.value;
                renderList(this.id);
            };

            input.addEventListener('blur', save, {once: true});
            input.focus();
          });

          
          // Add the elements to taskElement and add taskElement to list
          taskElement.appendChild(taskTitle);
          taskElement.appendChild(taskButtons);
          taskElement.appendChild(taskBody);
          
          taskListElement.appendChild(taskElement);
      }

      return taskListElement;
  }

  generateElement() {
      // Header container
      let listHeader = document.createElement('header');
      // List title
      let listTitle = document.createElement('h2');
      listTitle.id = 'title-' + this.id;
      listTitle.innerText = this.name;
      listTitle.classList.add('listTitle');
      listTitle.addEventListener('click', (e) => {
          let input = document.createElement('input');
          input.value = listTitle.textContent;
          input.classList.add('listTitle');
          input.maxLength = 128;
          listTitle.replaceWith(input);

          let save = () => {
              this.name = input.value;
              renderList(this.id);
          };

          input.addEventListener('blur', save, {once: true});
          input.focus();
      });
      // Delete list button
      let listDeleteButton = document.createElement('i');
      listDeleteButton.classList.add('fa-solid', 'fa-trash');
      listDeleteButton.addEventListener('click', () => {
        // Remove the card from the cards list based on its index position.
        currentLists().splice(currentLists().indexOf(this), 1);
        renderList(this.id);
      });
      listHeader.appendChild(listTitle);
      listHeader.appendChild(listDeleteButton);

      // Button container.
      let listFooter = document.createElement('footer');
      // Add task button
      let listButton = document.createElement('button');
      listButton.id = 'button-' + this.id;
      listButton.classList.add("addTaskButton");
      listButton.innerText = '+';
      listButton.addEventListener('click', () => {
          let task = new Task(`Untitled Task`, 'Placeholder', getBoardFromId(this.parentBoardId).IDGenerator(), this.id);   // TO DO remove the placeholder when the dive is styled to have a minimum width so you can still click on it with no text?
          this.addTask(task);
      });
      listFooter.appendChild(listButton);
      

      let listElement = document.createElement('div');
      listElement.id = this.id;
      listElement.classList.add('taskList');
      listElement.appendChild(listHeader);
      if (this.tasks) {
          let taskListElement = this.renderTasks();
          taskListElement.className = "taskListBody"
          listElement.appendChild(taskListElement);
      }
      listElement.appendChild(listFooter);

      return listElement;
  }
}

class Board {

  constructor(name, id, settings, identifier=0) {
      this.name = name;
      this.id = id;
      this.settings = settings;
      this.lists = [];  // All the Lists that are currently in the container as List objects.
      this.identifier = identifier === null ? Date.now() : identifier;  // All elements within this board will carry an unqiue id.
  }

  IDGenerator() {
      this.identifier += 1;
      return 'e' + this.identifier.toString();
  }

  addList() {
      let listTitle = `Untitled List ${this.lists.length + 1}`;
  
      let list = new List(listTitle, this.IDGenerator(), this.id);
      this.lists.push(list);

      let listElement = list.generateElement();
      listsContainer.insertBefore(listElement, listsContainer.childNodes[listsContainer.childNodes.length - 2]);
  }
}

/* < ========= Data Storage ============ > */
function saveData() {
  window.localStorage.setItem('kanbanAppData', JSON.stringify(appData));
}

function getDataFromLocalStorage() {
  return window.localStorage.getItem('kanbanAppData');
}

function loadData() {
  let data = window.localStorage.getItem('kanbanAppData');
  if (data) {
      let savedAppData = JSON.parse(data);

      appData.settings = savedAppData.settings;
      appData.currentBoard = savedAppData.currentBoard >= 0 ? savedAppData.currentBoard : 0;
      appData.identifier = savedAppData.identifier !== null ? savedAppData.identifier : 0;
      
      // Fill the data with boards.
      for (let board of savedAppData.boards) {
          let boardElement = new Board(board.name, board.id, board.settings, board.identifier);

          for (let list of board.lists) {
              let listElement = new List(list.name, list.id, boardElement.id);
              for (let task of list.tasks) {
                  let taskElement = new Task(task.title, task.body, task.id, list.id);
                  listElement.tasks.push(taskElement);
              }
              boardElement.lists.push(listElement);
          }
          appData.boards.push(boardElement);
      }

      renderBoard(appData.boards[appData.currentBoard]);
  } 
  else {
      appData.currentBoard = 0;
      let newBoard = new Board("Untitled Board", 'b0');
      appData.boards.push(newBoard);
  }
  listBoards();
}

function clearData() {
  window.localStorage.clear();
}

loadData();


// <=========== Other Events ============>
  

addListButton.addEventListener('click', () => currentBoard().addList());

addBoardText.addEventListener('keyup', (e) => {
  if (e.code === "Enter") addBoard();
});

addBoardButton.addEventListener('click', addBoard);

saveButton.addEventListener('click', () => {saveData(); createAlert("Data successfully saved.")});

deleteButton.addEventListener('click', () => {
    let boardName = currentBoard().name;

    // Delete the current board.
    appData.boards.splice(appData.currentBoard, 1);
    if (appData.currentBoard !== 0) {
        appData.currentBoard--;
    }

    if (appData.boards.length === 0) {
        let newBoard = new Board("Untitled Board", 'b0', {'theme': null});
        appData.boards.push(newBoard);
        appData.currentBoard = 0;
    }

    listBoards();
    renderBoard(appData.boards[appData.currentBoard]);

    createAlert(`Deleted board "${boardName}"`)
});

window.onbeforeunload = function () {
  if (JSON.stringify(appData) !== getDataFromLocalStorage()) {
      return confirm();
  }
}

// rewrite and format all of this when it is working funcitonally

document.getElementById("darkModeToggle").addEventListener("click", () => {
  document.documentElement.classList.toggle("dark-mode");
  const isDarkMode = document.documentElement.classList.contains("dark-mode");
  localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");
});

// On page load, apply saved mode
if (localStorage.getItem("darkMode") === "enabled") {
  document.documentElement.classList.add("dark-mode");
}


// <========== Sidebar ===========>

function toggleSidebar() {
  if (('toggled' in sidebar.dataset)) {
      delete sidebar.dataset.toggled;
      sidebar.style.width = "0";
      sidebar.style.boxShadow = "unset";

      // Remove listen click outside of side
      document.removeEventListener('click', listenClickOutside);
  }
  else {
      sidebar.dataset.toggled = '';
      sidebar.style.width = "250px";
      sidebar.style.boxShadow = "100px 100px 0 100vw rgb(0 0 0 / 50%)";
      // Listen click outside of sidebar
      setTimeout(() => {
          document.addEventListener('click', listenClickOutside);
      }, 300);
  }
}

sidebarButton.addEventListener('click', toggleSidebar);
sidebarClose.addEventListener('click', toggleSidebar);

function listenClickOutside(event) {
  const withinBoundaries = event.composedPath().includes(sidebar);
  if (!withinBoundaries && sidebar.style.width === "250px") {
      toggleSidebar();
  }
}

function createAlert(text) {
  let div = document.createElement('div');
  let p = document.createElement('p');
  p.innerText = text;
  div.classList.add('alert');
  div.appendChild(p);

  alerts.appendChild(div);
  setTimeout(function(){
    div.classList.add('animateHidden');
  }, 3500);
  setTimeout(function(){
    div.parentNode.removeChild(div);
  }, 4500);
}


/*
document.addEventListener("DOMContentLoaded", () => {  
  // Task ID counter
  let taskIdCounter = 0;

  // Create a new task element
  const createTaskElement = () => {
    const task = document.createElement("div");
    task.className = "boardTask";
    task.draggable = true;
    task.id = `task-${taskIdCounter++}`;
    task.innerHTML = `
        <div class="boardTaskHead">
            <div class="boardTaskTitle">
                <span contenteditable="true">Title</span>
                <button class="deleteTaskButton">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
            <div class="boardTaskTags">
                <span class='boardTaskTag boardTaskTag--tag-1' contenteditable="true">Art</span>
            </div>
        </div>
        <p contenteditable="true">Hello World</p>
    `;

    // Delete task
    task.querySelector(".deleteTaskButton").addEventListener("click", () => {
      task.remove();
    });

    return task;
  };


// Add tasks
document.querySelectorAll(".addTaskButton").forEach((button) => {
  button.addEventListener("click", () => {
    const listBody = button.closest(".boardList").querySelector(".boardListBody");
    listBody.appendChild(createTaskElement());
  });
});

// Move tasks
document.querySelectorAll(".boardListBody").forEach((listBody) => {
  listBody.addEventListener("dragover", (e) => e.preventDefault());

  listBody.addEventListener("drop", (e) => {
    const taskId = e.dataTransfer.getData("text/plain");
    const task = document.getElementById(taskId);
    listBody.appendChild(task);
  });
});

document.addEventListener("dragstart", (e) => {
  if (e.target.classList.contains("boardTask")) {
    e.dataTransfer.setData("text/plain", e.target.id);
  }
});



// Add List
document.getElementById("addListButton").addEventListener("click", () => {
  const boardContainer = document.querySelector(".boardContainer");
  const taskListElement = document.createElement("div");
  taskListElement.className = "boardList";
  //taskListElement.draggable = true;
  taskListElement.innerHTML = `
    <header>
      <h2 contenteditable="true">New List</h2>
      <button class="deleteListButton"><i class="fa-solid fa-trash"></i></button>
    </header>

    <div class="boardListBody"></div>
    
    <footer>
      <button class="addTaskButton"><i class="fa-solid fa-plus"></i>Add Task</button>
    </footer>
  `;

  boardContainer.appendChild(taskListElement);


  const listBody = taskListElement.querySelector(".boardListBody");

  // Task adding
  taskListElement.querySelector(".addTaskButton").addEventListener("click", () => {
    listBody.appendChild(createTaskElement());
  });
  // Moving tasks
  listBody.addEventListener("dragover", (e) => e.preventDefault());
  listBody.addEventListener("drop", (e) => {
    const taskId = e.dataTransfer.getData("text/plain");
    const task = document.getElementById(taskId);
    listBody.appendChild(task);
  });
  

  // List deletion
  taskListElement.querySelector(".deleteListButton").addEventListener("click", () => {
    taskListElement.remove();
  });
});
});

*/
