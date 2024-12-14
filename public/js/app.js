// Service worker registration

if (navigator.online && "serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/serviceworker.js")
    .then((registration) => {
      console.log("Service Worker registered with scope:", registration.scope);
    })
    .catch((error) => {
      console.error("Service Worker registration failed:", error);
    });
}


//Global variables

const boardContainer = document.getElementById("boardContainer");
const listsContainer = document.getElementById("listsContainer");
const title = document.getElementById("boardTitle");

const boardsList = document.getElementById("boardsList");
const addBoardText = document.getElementById("addBoardText");
const addBoardButton = document.getElementById("addBoardButton");

const boardDeleteButton = document.getElementById("boardDeleteButton");

const addListButton = document.getElementById("addListButton");

const darkModeInput = document.getElementById("darkModeInput");

const sidebar = document.getElementById("sidebar");
const sidebarButton = document.getElementById("sidebarButton");
const sidebarClose = document.getElementById("sidebarClose");


let globalCounter = 0;
let appData = {
  boards: [],
  currentBoard: 0,
};
function currentLists() { return appData.boards[appData.currentBoard].lists; }
function currentBoard() { return appData.boards[appData.currentBoard]; }



// Events

addBoardText.addEventListener("keyup", (e) => {
  if (e.code === "Enter") addBoard();
});

addBoardButton.addEventListener("click", addBoard);


boardDeleteButton.addEventListener("click", () => {
  appData.boards.splice(appData.currentBoard, 1);
  if (appData.currentBoard !== 0) {
    appData.currentBoard--;
  }

  if (appData.boards.length === 0) {
    let newBoard = new Board("Untitled Board", "b0");
    appData.boards.push(newBoard);
    appData.currentBoard = 0;
  }

  createBoardsList();
  renderBoard(currentBoard());
});

addListButton.addEventListener("click", () => {
  currentBoard().addList();
  boardContainer.scrollTo({ left: boardContainer.scrollWidth });
});


if (!localStorage.getItem("darkMode") && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  localStorage.setItem("darkMode", "enabled");
}

darkModeInput.addEventListener("change", () => {
  document.documentElement.classList.toggle("darkMode", darkModeInput.checked);
  localStorage.setItem("darkMode", darkModeInput.checked ? "enabled" : "disabled");
});

if (localStorage.getItem("darkMode") === "enabled") {
  darkModeInput.checked = true;
  document.documentElement.classList.add("darkMode");
}
else {
  darkModeInput.checked = false;
  document.documentElement.classList.remove("darkMode");
}



function toggleSidebar() {
  if (sidebar.dataset.toggled === "true") {
    sidebar.dataset.toggled = "false";

    document.removeEventListener("click", listenClickOutside);
  } else {
    sidebar.dataset.toggled = "true";

    setTimeout(() => {
      document.addEventListener("click", listenClickOutside);
    }, 300);
  }
}

sidebarButton.addEventListener("click", toggleSidebar);
sidebarClose.addEventListener("click", toggleSidebar);

function listenClickOutside(event) {
  const withinBoundaries = event.composedPath().includes(sidebar);
  if (!withinBoundaries && sidebar.style.width != "0px") {
    toggleSidebar();
  }
}



// Classes

class Board {
  constructor(name, id, tags = [], counter = 0) {
    this.name = name;
    this.id = id;
    this.lists = [];
    this.tags = tags;
    this.counter = counter;
  }

  UniqueID() {
    this.counter += 1;
    return `${this.id}-` + this.counter.toString();
  }

  addList() {
    let listTitle = "Untitled List";

    let list = new List(listTitle, this.UniqueID(), this.id);
    this.lists.push(list);

    let listElement = list.createListElement();
    listsContainer.appendChild(listElement);
  }

  addTag(tag) {
    if (!this.tags.find((t) => t.name === tag.name)) {
      this.tags.push(tag);
    }
  }

  findTag(tagName) {
    return this.tags.find((t) => t.name === tagName);
  }

  removeTag(tagName) {
    this.tags = this.tags.filter((tag) => tag.name !== tagName);
  }
}

function renderBoard(board) {
  appData.currentBoard = appData.boards.indexOf(board);
  document.title = "Kanban | " + currentBoard().name;
  title.innerText = currentBoard().name;
  title.addEventListener("click", (e) => {
    let input = document.createElement("input");
    input.value = title.textContent;
    input.classList.add("boardTitle", "editableInput");
    input.placeholder = "Board Title";
    input.maxLength = 64;

    let style = window.getComputedStyle(title);
    input.style.fontSize = style.fontSize;

    title.replaceWith(input);

    let save = () => {
      if (input.value.length === 0) input.value = "Untitled Board";
      currentBoard().name = input.value;      
      document.title = 'Kanban | ' + input.value;
      title.innerText = input.value;
      input.replaceWith(title);
      createBoardsList();
    };

    input.addEventListener("blur", save, { once: true });
    input.focus();
  });

  renderAllLists();
}
function createBoardsList() {
  boardsList.innerHTML = "";
  for (let board of appData.boards) {
    let boardTitle = document.createElement("li");
    boardTitle.innerText = board.name;
    boardTitle.id = board.id;
    if (board.id === currentBoard().id) boardTitle.classList.add("active");
    boardTitle.addEventListener("click", () => {
      renderBoard(board);
      createBoardsList();
    });
    boardsList.appendChild(boardTitle);
  }
}
function addBoard() {
  let boardTitle = addBoardText.value;
  if (!boardTitle) boardTitle = "Unititled Board";
  addBoardText.value = "";

  globalCounter += 1;
  let newBoard = new Board(boardTitle, "Board" + globalCounter.toString());
  appData.boards.push(newBoard);
  createBoardsList();
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
    this.tasks = this.tasks.filter((val) => val !== task);
    renderList(this.id);
  }

  createTaskElements() {
    let taskListElement = document.createElement("ul");
    taskListElement.id = "list-" + this.id;

    for (let task of this.tasks) {
      let taskElement = document.createElement("li");
      taskElement.id = "task-" + task.id;
      taskElement.className = "task";

      let taskTitleContainer = document.createElement("div");
      taskTitleContainer.classList.add("taskTitleContainer");

      let taskTitle = document.createElement("p");
      taskTitle.innerText = task.title;
      taskTitle.classList.add("taskTitle");

      let taskButtons = document.createElement("span");
      taskButtons.classList.add("taskButtons");

      let taskEditButton = document.createElement("i");
      taskEditButton.classList.add("taskEditButton", "fa-solid", "fa-pen");
      taskEditButton.addEventListener("click", () => {
        task.editTask();
      });

      let taskDeleteButton = document.createElement("i");
      taskDeleteButton.classList.add(
        "taskDeleteButton",
        "fa-solid",
        "fa-trash",
      );
      taskDeleteButton.addEventListener("click", () => {
        currentLists()
          .find((l) => l.id === task.taskListId)
          .removeTask(task);
      });

      taskButtons.appendChild(taskEditButton);
      taskButtons.appendChild(taskDeleteButton);

      taskTitleContainer.appendChild(taskTitle);
      taskTitleContainer.appendChild(taskButtons);

      let taskTags = document.createElement("span");
      taskTags.classList.add("taskTags");
      for (let tagName of task.tags) {
        let tag = currentBoard().findTag(tagName);
        let tagElement = document.createElement("span");
        tagElement.id = "tag-" + task.id;
        tagElement.classList.add("taskTag");

        let tagText = document.createElement('span');
        tagText.classList.add('tagText');
        tagText.textContent = tag.name;

        let tagColour = tag.colour.replace('#', '');
        let r = parseInt(tagColour.slice(0, 2), 16);
        let g = parseInt(tagColour.slice(2, 4), 16);
        let b = parseInt(tagColour.slice(4, 6), 16);
        let luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        luminance > 0.5 ? tagText.style.color = 'black' : tagText.style.color = 'white';

        tagElement.appendChild(tagText);

        tagElement.style.backgroundColor = tag.colour;

        taskTags.appendChild(tagElement);
      }

      let taskBody = document.createElement("p");
      taskBody.innerText = task.body;
      taskBody.classList.add("taskBody");

      taskElement.appendChild(taskTitleContainer);
      taskElement.appendChild(taskTags);
      taskElement.appendChild(taskBody);

      taskListElement.appendChild(taskElement);
    }

    new Sortable(taskListElement, {
      group: "tasks",
      animation: 150,
      swapThreshold: 0.95,
      revertOnSpill: true,
      ghostClass: "ghostTask",
      chosenClass: "chosenTask",

      onStart: (evt) => {
        document.body.classList.add("disableTaskHover");
      },
      onEnd: (evt) => {
        document.body.classList.remove("disableTaskHover");

        let movedTask = this.tasks[evt.oldIndex];
        movedTask.taskListId = evt.to.parentElement.id;

        this.tasks.splice(evt.oldIndex, 1);

        currentLists()
          .find((l) => l.id === evt.to.parentElement.id)
          .tasks.splice(evt.newIndex, 0, movedTask);

        saveData();
      },
    });

    return taskListElement;
  }

  createListElement() {
    let listHeader = document.createElement("header");
    listHeader.classList.add("taskListHeader");

    let listTitle = document.createElement("h2");
    listTitle.id = "title-" + this.id;
    listTitle.innerText = this.name;
    listTitle.classList.add("listTitle");
    listTitle.addEventListener("click", (e) => {
      let input = document.createElement("input");
      input.value = listTitle.textContent;
      input.classList.add("listTitle", "editableInput");
      input.placeholder = "List Title";
      input.maxLength = 128;

      let style = window.getComputedStyle(listTitle);
      input.style.fontSize = style.fontSize;

      listTitle.replaceWith(input);

      let save = () => {
        if (input.value.length === 0) input.value = "Untitled List";
        this.name = input.value;
        renderList(this.id);
      };

      input.addEventListener("blur", save, { once: true });
      input.focus();
    });

    let listDeleteButton = document.createElement("i");
    listDeleteButton.classList.add("listDeleteButton", "fa-solid", "fa-trash");
    listDeleteButton.addEventListener("click", () => {
      currentLists().splice(currentLists().indexOf(this), 1);
      renderList(this.id);
    });
    listHeader.appendChild(listTitle);
    listHeader.appendChild(listDeleteButton);

    let listFooter = document.createElement("footer");
    listHeader.classList.add("taskListFooter");

    let listButton = document.createElement("div");
    listButton.id = "button-" + this.id;
    listButton.classList.add("addTaskButton");
    listButton.innerText = "+";
    listButton.addEventListener("click", () => {
      let task = new Task("", "", currentBoard().UniqueID(), [], this.id);
      this.addTask(task);
      setTimeout(() => {
        task.editTask();
      }, 0);
    });
    listFooter.appendChild(listButton);

    let listElement = document.createElement("div");
    listElement.id = this.id;
    listElement.classList.add("taskList");
    listElement.appendChild(listHeader);
    if (this.tasks) {
      let taskListElement = this.createTaskElements();
      taskListElement.className = "taskListBody";

      listElement.appendChild(taskListElement);
    }
    listElement.appendChild(listFooter);

    return listElement;
  }
}

function renderAllLists() {
  for (let list of listsContainer.querySelectorAll(".taskList")) {
    list.remove();
  }

  for (let list of currentLists()) {
    let newListElement = list.createListElement();
    listsContainer.appendChild(newListElement);
  }

  let sortableInstance = Sortable.get(listsContainer);
  if (sortableInstance) { sortableInstance.destroy(); }
  new Sortable(listsContainer, {
    group: "lists",
    animation: 250,
    swapThreshold: 0.70,
    handle: ".taskListHeader",

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
  let list = currentLists().find((e) => e.id === listID);

  if (!list) {
    let listElement = document.getElementById(listID);
    if (listElement == null) return;
    listElement.parentNode.removeChild(listElement);
    return;
  }

  let listElement = document.getElementById(list.id);
  if (listElement != null) {
    let newListElement = list.createListElement();
    listElement.parentNode.replaceChild(newListElement, listElement);
  } else {
    let newListElement = list.createListElement();
    listsContainer.appendChild(newListElement);
  }
}



class Task {
  constructor(title, body, id, tags, taskListId) {
    this.title = title;
    this.body = body;
    this.id = id;
    this.tags = tags;
    this.taskListId = taskListId;
  }
  
  editTask() {
    let taskElement = document.getElementById("task-" + this.id);
    taskElement.querySelector(".taskTitle");

    let titleInput = document.createElement("textarea");
    titleInput.value = this.title;
    titleInput.classList.add("taskTitle", "taskTitleInput");
    titleInput.placeholder = "Title";
    titleInput.maxLength = 16;
    taskElement.querySelector(".taskTitle").replaceWith(titleInput);

    let bodyInput = document.createElement("textarea");
    bodyInput.value = this.body;
    bodyInput.classList.add("taskBody", "taskBodyInput");
    bodyInput.placeholder = "Body";
    taskElement.querySelector(".taskBody").replaceWith(bodyInput);

    let taskTags = taskElement.querySelector(".taskTags");

    let createTagEditables = function (tagElement, task) {
      let tagName = tagElement.querySelector('.tagText').textContent;
      let tag = currentBoard().findTag(tagName);

      let tagColourPicker = document.createElement("input");
      tagColourPicker.type = "color";
      tagColourPicker.value = "#ffffff";
      tagColourPicker.classList.add("tagColourPicker");
      tagColourPicker.addEventListener("change", (e) => {
        tag.colour = e.target.value;

        renderAllLists();
        document.removeEventListener("click", listenClickOutside);
        task.editTask();
      });

      let tagRemoveButton = document.createElement("i");
      tagRemoveButton.classList.add("fa-solid", "fa-times");
      tagRemoveButton.classList.add("tagRemoveButton");
      tagRemoveButton.addEventListener("click", () => {
        task.removeTag(tagName);
        for (let tag in taskElement.childNodes) {
          if (tag.textContent == tagName) {
            tagElement = tag;
            break;
          }
        }
        taskTags.removeChild(tagElement);
      });

      tagElement.appendChild(tagColourPicker);
      tagElement.appendChild(tagRemoveButton);
    };
    for (let tagElement of taskTags.childNodes) {
      createTagEditables(tagElement, this);
    }

    let setTagColour = function (tagText, colour) {
      let tagColour = colour.replace('#', '');

      let r = parseInt(tagColour.slice(0, 2), 16);
      let g = parseInt(tagColour.slice(2, 4), 16);
      let b = parseInt(tagColour.slice(4, 6), 16);

      let luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      luminance > 0.5 ? tagText.style.color = 'black' : tagText.style.color = 'white';
    }


    let tagDropdown = document.createElement("ul");
    tagDropdown.classList.add("tagDropdown");
    tagDropdown.style.display = "none";

    let boardTags = currentBoard().tags;
    for (let tag of boardTags) {
      let tagElement = document.createElement("li");
      tagElement.classList.add("taskTag");

      let tagText = document.createElement('span');
      tagText.classList.add('tagText');
      tagText.textContent = tag.name;
      setTagColour(tagText, tag.colour);
      tagElement.appendChild(tagText);

      tagElement.style.backgroundColor = tag.colour;
      tagElement.addEventListener("click", () => {
        if (this.tags.includes(tag.name) != true) {
          this.addTag(tag.name);

          let newTagElement = tagElement.cloneNode(true);
          createTagEditables(newTagElement, this);
          taskTags.insertBefore(
            newTagElement,
            taskTags.childNodes[taskTags.childNodes.length - 2],
          );
        }
      });

      tagDropdown.appendChild(tagElement);
    }

    let newTagOption = document.createElement("li");
    newTagOption.classList.add("newTagOption");

    let dropdownTagInput = document.createElement("input");
    dropdownTagInput.classList.add("dropdownTagInput");
    dropdownTagInput.placeholder = "Tag Name";
    dropdownTagInput.maxLength = 10;

    let dropdownTagColour = document.createElement("input");
    dropdownTagColour.type = "color";
    dropdownTagColour.value = "#ffffff";
    dropdownTagColour.classList.add("dropdownTagColour");

    let newTagButton = document.createElement("i");
    newTagButton.classList.add("newTagButton", "fa-solid", "fa-plus");
    newTagButton.addEventListener("click", () => {
      let tagName = dropdownTagInput.value;
      if (tagName.length === 0) tagName = "New";
      let tagColour = dropdownTagColour.value;

      let newTag = { name: tagName, colour: tagColour };

      if (
        currentBoard()
          .tags.map((a) => a.name)
          .includes(tagName) != true
      ) {
        currentBoard().addTag(newTag);
        this.addTag(tagName);

        let tagElement = document.createElement("span");
        tagElement.classList.add("taskTag");

        let tagText = document.createElement('span');
        tagText.classList.add('tagText');
        tagText.textContent = tagName;
        setTagColour(tagText, tagColour);
        tagElement.appendChild(tagText);

        tagElement.style.backgroundColor = tagColour;
        createTagEditables(tagElement, this);
        taskTags.insertBefore(
          tagElement,
          taskTags.childNodes[taskTags.childNodes.length - 2],
        );
      }
    });
    newTagOption.appendChild(dropdownTagInput);
    newTagOption.appendChild(dropdownTagColour);
    newTagOption.appendChild(newTagButton);

    tagDropdown.appendChild(newTagOption);

    let tagButton = document.createElement("i");
    tagButton.classList.add("tagButton", "fa-solid", "fa-plus");
    tagButton.addEventListener("click", () => {
      tagDropdown.style.display = "inline-flex";
    });

    taskTags.appendChild(tagButton);
    taskTags.appendChild(tagDropdown);

    let cancelButton = document.createElement("i");
    cancelButton.classList.add("taskDeleteButton", "fa-solid", "fa-times");
    cancelButton.addEventListener("click", () => {
      save();
    });
    taskElement.querySelector(".taskEditButton").replaceWith(cancelButton);

    let save = () => {
      this.title = titleInput.value;
      if (this.title.length === 0) this.title = "Untitled Task";
      this.body = bodyInput.value;
      renderList(this.taskListId);
      document.removeEventListener("click", listenClickOutside);
    };

    function listenClickOutside(e) {
      let withinBoundaries = e.composedPath().includes(taskElement);
      if (!withinBoundaries) {
        save();
      }
    }

    document.addEventListener("click", listenClickOutside);

    window.addEventListener("beforeunload", () => {
      save();
      saveData();
    });
  }

  addTag(tagName) {
    if (!this.tags.includes(tagName)) {
      this.tags.push(tagName);
    }
  }

  removeTag(tagName) {
    this.tags = this.tags.filter((tag) => tag !== tagName);
  }
}



// Data Persistence

setInterval(function () {
  saveData();
}, 5000);
window.addEventListener("beforeunload", (event) => {
  saveData();
});

async function saveData() {
  if (navigator.online) {
    let response = await fetch("http://localhost:3000/saveData", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(appData),
    });

    if (!response.ok) {
      console.error("Failed to save data");
    }
  } else {
    window.localStorage.removeItem("appData");
    window.localStorage.setItem("appData", JSON.stringify(appData));
  }
}

async function loadData() {
  let loadingSpinner = document.createElement("div");
  loadingSpinner.classList.add("loadingSpinner");
  boardContainer.appendChild(loadingSpinner);

  let data;
  if (navigator.online) {
    let response = await fetch("http://localhost:3000/loadData");
    data = await response.json();
  } else {
    data = JSON.parse(window.localStorage.getItem("appData"));
  }

  if (data && data.boards.length != 0) {
    appData = { boards: [], currentBoard: 0 };
    appData.currentBoard = data.currentBoard;

    for (let board of data.boards) {
      let boardElement = new Board(
        board.name,
        board.id,
        board.tags,
        board.counter,
      );

      for (let list of board.lists) {
        let listElement = new List(
          list.name,
          list.id,
          boardElement.id
        
        );
        for (let task of list.tasks) {
          let taskElement = new Task(
            task.title,
            task.body,
            task.id,
            task.tags,
            list.id,
          );
          listElement.tasks.push(taskElement);
        }
        boardElement.lists.push(listElement);
      }
      appData.boards.push(boardElement);
    }
  } else {
    let newBoard = new Board("Untitled Board", "b0");
    appData.boards.push(newBoard);
  }

  loadingSpinner.remove();

  createBoardsList();
  renderBoard(appData.boards[appData.currentBoard]);
}

loadData();
