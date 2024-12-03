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
const newTagButton = document.getElementById('newTagButton');
const newTagInput = document.getElementById('newTagInput');
const newTagColour = document.getElementById('newTagColour');

const autoSaveButton = document.getElementById('autoSave');
const settingsButton = document.getElementById('settingsButton');

const listContextMenu = document.getElementById('listContextMenu');
const listContextMenuDelete = document.getElementById('listContextMenuDelete');
const listContextMenuClear = document.getElementById('listContextMenuClear');
const listContextMenuDuplicate = document.getElementById('listContextMenuDuplicate');
*/

const title = document.getElementById('boardTitle');



var appData = {
  'boards': [],
  'currentBoard': 0,
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

function listBoards() {
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
  title.addEventListener('click', (e) => {
    let input = document.createElement('input');
    input.value = title.textContent;
    input.classList.add('boardTitle');
    input.maxLength = 64;
    title.replaceWith(input);

    let save = () => {
        currentBoard().name = input.value;
        document.title = input.value;
        title.innerText = input.value;
        input.replaceWith(title);
        listBoards()
    };

    input.addEventListener('blur', save, {once: true});
    input.focus();
});

  renderAllLists();
}

function renderAllLists() {
  for (let list of listsContainer.querySelectorAll('.taskList')) {
      list.remove();
  }

  for (let list of currentLists()) {
      let newListElement = list.generateElement();
      listsContainer.appendChild(newListElement);
  }


  new Sortable(listsContainer, {
    group: "lists",
    animation: 150,

    onEnd: function (evt) {
      const { oldIndex, newIndex } = evt;

      if (oldIndex !== newIndex) {
        const movedList = currentLists().splice(oldIndex, 1)[0];
        currentLists().splice(newIndex, 0, movedList);

        saveData();
      }
    },
  });
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
}

function addBoard() {
  let boardTitle = addBoardText.value;
  if (!boardTitle) boardTitle = "Unititled Board"
  addBoardText.value = '';

  appData.counter += 1;
  let newBoard = new Board(boardTitle, 'b' + appData.counter);
  appData.boards.push(newBoard);
  listBoards();
}



// ========= Classes ========== //
class Board {

  constructor(name, id, tags = [], counter=0) {
      this.name = name;
      this.id = id;
      this.lists = [];
      this.tags = tags;
      this.counter = counter === null ? Date.now() : counter;
  }

  UniqueID() {
      this.counter += 1;
      return 'e' + this.counter.toString();
  }

  addList() {
      let listTitle = 'Untitled List';
  
      let list = new List(listTitle, this.UniqueID(), this.id);
      this.lists.push(list);

      let listElement = list.generateElement();
      listsContainer.insertBefore(listElement, listsContainer.childNodes[listsContainer.childNodes.length - 2]);
  }

  addTag(tag) {
    if (!this.tags.find(t => t.name === tag.name)) {
        this.tags.push(tag);
    }
  }

  findTag(tagName) {
    return this.tags.find(t => t.name === tagName)
  }

  removeTag(tagName) {
    this.tags = this.tags.filter(tag => tag.name !== tagName);
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


          let taskButtons = document.createElement('span');
          taskButtons.classList.add('taskButtons');

          let taskDeleteButton = document.createElement('i');
          taskDeleteButton.classList.add('taskDeleteButton', 'fa-solid', 'fa-trash');
          taskDeleteButton.addEventListener('click', () => {this.removeTask(task);});

          let taskEditButton = document.createElement('i');
          taskEditButton.classList.add('taskEditButton', 'fa-solid', 'fa-pen');
          taskEditButton.addEventListener('click', () => {
            task.editTask();
          });

          taskButtons.appendChild(taskDeleteButton);
          taskButtons.appendChild(taskEditButton);


          let taskTags = document.createElement('span');
          taskTags.classList.add('taskTags');
          for (let tagName of task.tags) {
              let tag = currentBoard().findTag(tagName);
              let tagElement = document.createElement('span');
              tagElement.classList.add('taskTag');
              tagElement.innerText = tag.name;
              tagElement.style.backgroundColor = tag.colour;

              taskTags.appendChild(tagElement);
          }

          
          let taskBody = document.createElement('p');
          taskBody.innerText = task.body;
          taskBody.classList.add('taskBody');
          

          taskElement.appendChild(taskTitle);
          taskElement.appendChild(taskButtons);
          taskElement.appendChild(taskTags);
          taskElement.appendChild(taskBody);
          
          taskListElement.appendChild(taskElement);
      }

      new Sortable(taskListElement, {
        group: "tasks",
        animation: 150,
    
        onEnd: (evt) => {
          let movedTask = this.tasks[evt.oldIndex];
          movedTask.taskListId = evt.to.parentElement.id;
  
          this.tasks.splice(evt.oldIndex, 1);
  
          currentBoard().lists.find(l => l.id === evt.to.parentElement.id).tasks.splice(evt.newIndex, 0, movedTask);
  
          saveData();
        }
      });
      

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
              if (this.name.length === 0) this.name = 'Untitled List'
              renderList(this.id);
          };

          input.addEventListener('blur', save, {once: true});
          input.focus();
      });
      // Delete list button
      let listDeleteButton = document.createElement('i');
      listDeleteButton.classList.add('listDeleteButton', 'fa-solid', 'fa-trash');
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
          let task = new Task('', '', currentBoard().UniqueID(), [], this.id);
          this.addTask(task);
          setTimeout(() => {  // messy fix but it works
            task.editTask();
          }, 0);
      });
      listFooter.appendChild(listButton);
      

      let listElement = document.createElement('div');
      listElement.id = this.id;
      listElement.classList.add('taskList');
      listElement.appendChild(listHeader);
      if (this.tasks) {
          let taskListElement = this.renderTasks();
          taskListElement.className = "taskListBody";

          listElement.appendChild(taskListElement);
      }
      listElement.appendChild(listFooter);

      return listElement;
  }
}

class Task {

  constructor(title, body, id, tags, taskListId) {
      this.title = title;
      this.body = body
      this.id = id;
      this.tags = tags;
      this.taskListId = taskListId;
  }

  getTaskList() {
      return document.getElementById(this.taskListId);
  }

  editTask() {
    let taskElement = document.getElementById(this.id);
    taskElement.querySelector('.taskTitle')

    // Replace task title with input field
    let titleInput = document.createElement('textarea');
    titleInput.value = this.title;
    titleInput.classList.add('taskTitle');
    titleInput.maxLength = 256;
    taskElement.querySelector('.taskTitle').replaceWith(titleInput);

    // Replace task body with textarea
    let bodyInput = document.createElement('textarea');
    bodyInput.value = this.body;
    bodyInput.classList.add('taskBody');
    taskElement.querySelector('.taskBody').replaceWith(bodyInput);


    let taskTags = taskElement.querySelector('.taskTags')

    let createTagEditables = function(tagElement, task) { 
      let tagName = tagElement.textContent
      let tag = currentBoard().findTag(tagName);

      /* // Bugs somewhere, probably unnecessary anyway since you can always just make a new tag I guess.
      let tagInput = document.createElement('input');
      tagInput.maxLength = 10;
      tagInput.classList.add('dropdownTagInput');
      tagInput.addEventListener('change', () => {
        if (tagInput.value.length === 0) tagInput.value = 'New';
        tag.name = tagInput.value;
        renderAllLists();
      });
      */

      let tagColourPicker = document.createElement('input');
      tagColourPicker.type = 'color';
      tagColourPicker.value = '#ffffff';
      tagColourPicker.classList.add('tagColourPicker');
      tagColourPicker.addEventListener('change', (e) => {
        tag.colour = e.target.value;  // changing all of their bg colours is too janky as it doesnt update the lists, and I have to get the current element too. Find a different way to stop it from closing the menu
        renderAllLists();
        document.removeEventListener('click', listenClickOutside);
        task.editTask();   // I think maybe I need to remove the close eventlistner?
      });
  
      let tagRemoveButton = document.createElement('i');
      tagRemoveButton.classList.add('fa-solid', 'fa-times');
      tagRemoveButton.addEventListener('click', () => {
        task.removeTag(tagName);
        for (let tag in taskElement.childNodes) {
          if (tag.textContent == tagName) {
            tagElement = tag;
            break;
          }
        }
        taskTags.removeChild(tagElement);
      });
  
      //tagElement.appendChild(tagInput);
      tagElement.appendChild(tagColourPicker);
      tagElement.appendChild(tagRemoveButton);
    };

    for (let tagElement of taskTags.childNodes) {
      createTagEditables(tagElement, this)
    }


    let tagDropdown = document.createElement('ul');
    tagDropdown.classList.add('tagDropdown');
    tagDropdown.style.display = 'none';

    let boardTags = currentBoard().tags;
    for (let tag of boardTags) {
        let tagElement = document.createElement('li');
        tagElement.classList.add('taskTag');
        tagElement.innerText = tag.name;
        tagElement.style.backgroundColor = tag.colour;
        tagElement.addEventListener('click', () => {
          if (this.tags.includes(tag.name) != true) {
            this.addTag(tag.name);

            let newTagElement = tagElement.cloneNode(true)
            createTagEditables(newTagElement, this);
            taskTags.insertBefore(newTagElement, taskTags.childNodes[taskTags.childNodes.length - 1]);            
          }
        });

        tagDropdown.appendChild(tagElement);
    }

    let newTagOption = document.createElement('li');

    let dropdownTagInput = document.createElement('input');
    dropdownTagInput.maxLength = 10;
    dropdownTagInput.classList.add('dropdownTagInput');
    let dropdownTagColour = document.createElement('input');
    dropdownTagColour.type = 'color';
    dropdownTagColour.value = '#ffffff';
    dropdownTagColour.classList.add('dropdownTagColour');
    let newTagButton = document.createElement('i');
    newTagButton.classList.add('newTagButton', 'fa-solid', 'fa-plus');
    newTagButton.addEventListener('click', () => {
      let tagName = dropdownTagInput.value;
      if (tagName.length === 0) tagName = 'New';
      let tagColour = dropdownTagColour.value;

      let newTag = { name: tagName, colour: tagColour };

      if (currentBoard().tags.map(a=>a.name).includes(tagName) != true) {
        currentBoard().addTag(newTag);
        this.addTag(tagName);

        let tagElement = document.createElement('span');
        tagElement.classList.add('taskTag');
        tagElement.innerText = tagName;
        tagElement.style.backgroundColor = tagColour;
        createTagEditables(tagElement, this);
        taskTags.insertBefore(tagElement, taskTags.childNodes[taskTags.childNodes.length - 1]);        
      }
    });
    newTagOption.appendChild(dropdownTagInput);
    newTagOption.appendChild(dropdownTagColour);
    newTagOption.appendChild(newTagButton);

    tagDropdown.appendChild(newTagOption);


    let tagButton = document.createElement('i');
    tagButton.classList.add('tagButton', 'fa-solid', 'fa-plus');
    tagButton.addEventListener('click', () => {
      tagDropdown.style.display = 'inline-block';
    });

    tagButton.appendChild(tagDropdown);
    taskTags.appendChild(tagButton);


    let cancelButton = document.createElement('i');
    cancelButton.classList.add('taskDeleteButton', 'fa-solid', 'fa-times');
    cancelButton.addEventListener('click', () => {
      save();
    });
    taskElement.querySelector('.taskEditButton').replaceWith(cancelButton);

    let save = () => {
      this.title = titleInput.value;
      if (this.title.length === 0) this.title = 'Untitled Task'
      this.body = bodyInput.value;
      renderList(this.taskListId);
    };

    function listenClickOutside(e) {
      let withinBoundaries = e.composedPath().includes(taskElement);
      if (!withinBoundaries) {
          save();
          document.removeEventListener('click', listenClickOutside);
      }
    }

    document.addEventListener('click', listenClickOutside);
  }

  addTag(tagName) {
    if (!this.tags.includes(tagName)) {
        this.tags.push(tagName);
    }
  }

  removeTag(tagName) {
      this.tags = this.tags.filter(tag => tag !== tagName);
  }
}


// <=========== Other Events ============>

  addListButton.addEventListener('click', () => currentBoard().addList());

  addBoardText.addEventListener('keyup', (e) => {
    if (e.code === "Enter") addBoard();
  });
  
  addBoardButton.addEventListener('click', addBoard);
  
  deleteButton.addEventListener('click', () => {
      appData.boards.splice(appData.currentBoard, 1);
      if (appData.currentBoard !== 0) {
          appData.currentBoard--;
      }
  
      if (appData.boards.length === 0) {
          let newBoard = new Board("Untitled Board", 'b0');
          appData.boards.push(newBoard);
          appData.currentBoard = 0;
      }
  
      listBoards();
      renderBoard(currentBoard());
  });
  
  window.onbeforeunload = function () {
    if (JSON.stringify(appData) !== getDataFromLocalStorage()) {
        return confirm();
    }
  }
  
  /*  // probably dont need.
  newTagButton.addEventListener('click', () => {
    let tagName = newTagInput.value;
    if (tagName.length === 0) tagName = 'New';
    let tagColour = newTagColour.value;
  
    let newTag = { name: tagName, colour: tagColour };
    currentBoard().addTag(newTag);
  
    newTagInput.value = '';
  });
  */
  
  
  document.getElementById("darkModeToggle").addEventListener("click", () => {
    document.documentElement.classList.toggle("dark-mode");
    const isDarkMode = document.documentElement.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDarkMode ? "enabled" : "disabled");
  });
  
  if (localStorage.getItem("darkMode") === "enabled") {
    document.documentElement.classList.add("dark-mode");
  }
  


  
  
  // <========== Sidebar ===========>
  // TODO rewrite this
  
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
      console.log(data);

      appData.settings = savedAppData.settings;
      appData.currentBoard = savedAppData.currentBoard >= 0 ? savedAppData.currentBoard : 0;
      
      for (let board of savedAppData.boards) {
          let boardElement = new Board(board.name, board.id, board.tags, board.counter);
          
          for (let list of board.lists) {
              let listElement = new List(list.name, list.id, boardElement.id);
              for (let task of list.tasks) {
                  let taskElement = new Task(task.title, task.body, task.id, task.tags, list.id);
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
