const boardContainer = document.getElementById('boardContainer');
const listsContainer = document.getElementById('listsContainer');

const sidebar = document.getElementById('sidebar');
const sidebarButton = document.getElementById('sidebarButton');
const sidebarClose = document.getElementById('sidebarClose');

const addListInput = document.getElementById('addListInput');
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
  for (let list of listsContainer.querySelectorAll('.parentList')) {
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

  constructor(title, description=null, id, parentListId) {
      this.title = title;
      this.description = description;
      this.id = id;
      this.isDone = false;
      this.parentListId = parentListId;
  }

  getParentList() {
      return document.getElementById(this.parentListId);
  }

  update() {
      let element = document.getElementById(this.id);

      //no functionality yet
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
      taskListElement.id = this.id + '-ul';
      for (let task of this.tasks) {
          let taskElement = document.createElement('li');
          taskElement.id = task.id;
          

          // Task title
          let taskElementTitle = document.createElement('p');
          taskElementTitle.innerText = task.title;
          taskElementTitle.classList.add('taskTitle');

/*
          // Housing for the edit and delete buttons.
          let taskElementButtons = document.createElement('span');

          // Edit button.
          let taskElementEditButton = document.createElement('i');
          taskElementEditButton.classList.add('fa', 'fa-pencil');
          // Edit functionality
          taskElementEditButton.addEventListener('click', () => {
              // List task editing functionality.
              let input = document.createElement('textarea');
              input.value = taskElementTitle.textContent;
              input.classList.add('taskTitle');
              input.maxLength = 256;
              taskElementTitle.replaceWith(input);

              let save = () => {
                  task.title = input.value;
                  renderList(this.id);
              };

              input.addEventListener('blur', save, {once: true});
              input.focus();
          });

          // Delete button. ALlows the user to delete the task from the List.
          let taskElementDeleteButton = document.createElement('i');
          taskElementDeleteButton.classList.add('fa', 'fa-trash');
          
          taskElementDeleteButton.addEventListener('click', () => {
              createConfirmDialog("Are you sure to delete this task?", () => this.removeTask(task));
          });


          // Add both the buttons to the span tag.
          taskElementButtons.appendChild(taskElementEditButton);
          taskElementButtons.appendChild(taskElementDeleteButton);
*/

          // Add the elements to taskElemente and add taskElement to list
          taskElement.appendChild(taskElementTitle);
          //taskElement.appendChild(taskElementButtons);
          taskListElement.appendChild(taskElement);
      }

      return taskListElement;
  }

  generateElement() {

/*
    let listElement = document.createElement("div");
    listElement.className = "boardList";
    listElement.innerHTML = `
          <span>
              <h2>
                  ${this.name}
              </h2>
              <i class="fa fa-bars"></i>
          </span>
          <ul>
              <li>${this.tasks[0]} // make it add all tasks
          </ul>  
        `;
*/

      // This was somewhat of a bad idea...
      // Editing the style of the Lists or tasks are made quite difficult.
      // I should've wrote all this as HTML and put it in the .innerHTML
      // But this gives me more flexibility, so I had to make a choice.

      let listElementHeader = document.createElement('span');
      let listElementHeaderTitle = document.createElement('h2');
      listElementHeaderTitle.id = this.id + '-h2';
      listElementHeaderTitle.innerText = this.name;
      listElementHeaderTitle.classList.add('ListTitle');

      // Replace the text element with an input element. Better tahn contentEditable
      listElementHeaderTitle.addEventListener('click', (e) => {
          let input = document.createElement('input');
          input.value = listElementHeaderTitle.textContent;
          input.classList.add('ListTitle');
          input.maxLength = 128;
          listElementHeaderTitle.replaceWith(input);

          let save = () => {
              this.name = input.value;
              renderList(this.id);
          };

          input.addEventListener('blur', save, {once: true});
          input.focus();
      });

           
      
      // Input area for typing in the name of new tasks for the List.
      let listInputElement = document.createElement('input');
      listInputElement.id = this.id + '-input';
      listInputElement.maxLength = 256;
      listInputElement.type = 'text';
      listInputElement.name = "addTaskName";
      listInputElement.placeholder = "Add Task...";
      listInputElement.addEventListener('keyup', (e) => {
          if (e.code === "Enter") listButtonElement.click();
      });

      // Button next to input to convert the text from the listInputElement into an actual task in the List.
      let listButtonElement = document.createElement('button');
      listButtonElement.id = this.id + '-button';
      listButtonElement.classList.add("addButton");
      listButtonElement.innerText = '+';
      listButtonElement.addEventListener('click', () => {
          let inputValue = listInputElement.value;
          if (!inputValue) return createAlert("Type a name for the task!");
          let task = new Task(inputValue, null, getBoardFromId(this.parentBoardId).IDGenerator(), this.id);
          this.addTask(task);
          listInputElement.value = '';
          listInputElement.focus(); // wont because the List is being re-rendered
      });
      

      let listElement = document.createElement('div');
      listElement.id = this.id;
      listElement.classList.add('parentList');
      listElement.appendChild(listElementHeader);

      if (this.tasks) {
          // If the List has tasks in it.

          // Render the tasks of the List.
          let taskListElement = this.renderTasks();

          // Add the list to the List.
          listElement.appendChild(taskListElement);
      }

      // Add the input and button to add new task at the end.
      listElement.appendChild(listInputElement);
      listElement.appendChild(listButtonElement);

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
      let listTitle = addListInput.value;  //add list input field's text value
      addListInput.value = '';
  
      // If the user created without typing any name
      if (!listTitle) listTitle = `Untitled List ${this.lists.length + 1}`;
  
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
                  let taskElement = new Task(task.title, task.description, task.id, list.id);
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

  addListInput.addEventListener('keyup', (e) => {
  if (e.code === "Enter") currentBoard().addList();
});

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