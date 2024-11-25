// rewrite and format all of this when it is working funcitonally





document.getElementById("darkModeToggle").addEventListener("click", () => {
  document.documentElement.classList.toggle("dark-mode");
  const isDarkMode = document.documentElement.classList.contains("dark-mode");
  localStorage.settask("darkMode", isDarkMode ? "enabled" : "disabled");
});

// On page load, apply saved mode
if (localStorage.gettask("darkMode") === "enabled") {
  document.documentElement.classList.add("dark-mode");
}





// ========= Classes ==========
class Task {

  constructor(title, description=null, id, parentListId) {
      this.title = title;
      this.description = description;  // A field for a future version, perhaps v2
      this.id = id;
      this.isDone = false;
      this.parentListId = parentListId;
  }

  getParentList() {
      return document.getElementById(this.parentListId);
  }

  check(chk=true) {
      this.isDone = chk;
      if (chk) {

          // Strikethrough the text if clicked on.
          // NOTE02: Might remove this feature as its not really needed.
          document.getElementById(this.id).style.textDecoration = 'line-through';
      } else {

          // Remove the strikethrough from the text.
          document.getElementById(this.id).style.textDecoration = 'none';
      }
  }

  update() {
      let _element = document.getElementById(this.id);

      _element.getElementsByTagName('p')[0].addEventListener('click', () => {
          if (this.isDone) {
              this.check(false);
          } else {
              this.check(true);
          }
      });

      _element.addEventListener('mousedown', ListDrag_startDragging, false);
      this.check(this.isDone);
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
      for (let _task of this.tasks) {
          _task.update();
      }
  }

  rendertasks() {
      let _newtaskList = document.createElement('ul');
      _newtaskList.id = this.id + '-ul';
      for (let _task of this.tasks) {
          let _newtask = document.createElement('li');
          _newtask.id = _task.id;
          
          // task Title
          let _newtaskTitle = document.createElement('p');
          _newtaskTitle.innerText = _task.title;
          _newtaskTitle.classList.add('task-title', 'text-fix', 'unselectable');
          
          // Housing for the edit and delete buttons.
          let _newtaskButtons = document.createElement('span');

          // Edit button. Allows the user to rename the task.
          let _newtaskEditButton = document.createElement('i');
          _newtaskEditButton.ariaHidden = true;
          _newtaskEditButton.classList.add('fa', 'fa-pencil');
          _newtaskEditButton.addEventListener('click', () => {
              
              // List task editing functionality.
              let _input = document.createElement('textarea');
              _input.value = _newtaskTitle.textContent;
              _input.classList.add('task-title');
              _input.maxLength = 256;
              _newtaskTitle.replaceWith(_input);

              let _save = () => {
                  _task.title = _input.value;
                  renderList(this.id);
              };

              _input.addEventListener('blur', _save, {
                  once: true,
              });
              _input.focus();
          });

          // Delete button. ALlows the user to delete the task from the List.
          let _newtaskDeleteButton = document.createElement('i');
          _newtaskDeleteButton.ariaHidden = true;
          _newtaskDeleteButton.classList.add('fa', 'fa-trash');
          _newtaskDeleteButton.addEventListener('click', () => {
              createConfirmDialog("Are you sure to delete this task?", () => this.removeTask(_task));
          });

          // Add both the buttons to the span tag.
          _newtaskButtons.appendChild(_newtaskEditButton);
          _newtaskButtons.appendChild(_newtaskDeleteButton);

          // Add the title, span tag to the task and the task itself to the list.
          _newtask.appendChild(_newtaskTitle);
          _newtask.appendChild(_newtaskButtons);
          _newtaskList.appendChild(_newtask);
      }

      return _newtaskList;
  }

  generateElement() {

      /* The structure of the List element. */

      //  <div class="parent-List">
      //    <span>
      //        <h2>
      //            {this.name}
      //        </h2>
      //        <i class="fa fa-bars" aria-hidden="true"></i>
      //    </span>
      //    <ul>
      //        <li><p>{this.tasks[0]}</p> <span></span>
      //        {more_tasks...}
      //    </ul>  
      //  </div>

      // This was somewhat of a bad idea...
      // Editing the style of the Lists or tasks are made quite difficult.
      // I should've wrote all this as HTML and put it in the .innerHTML
      // But this gives me more flexibility, so I had to make a choice.

      let _newListHeader = document.createElement('span');
      let _newListHeaderTitle = document.createElement('h2');
      _newListHeaderTitle.id = this.id + '-h2';
      _newListHeaderTitle.innerText = this.name;
      _newListHeaderTitle.classList.add('text-fix', 'List-title');

      // A better, more flexible alternative to contentEditable.
      // We replace the text element with an input element.
      _newListHeaderTitle.addEventListener('click', (e) => {
          let _input = document.createElement('input');
          _input.value = _newListHeaderTitle.textContent;
          _input.classList.add('List-title');
          _input.maxLength = 128;
          _newListHeaderTitle.replaceWith(_input);

          let _save = () => {
              this.name = _input.value;
              renderList(this.id);
          };

          _input.addEventListener('blur', _save, {
              once: true,
          });
          _input.focus();
      });

      // Hamburger menu icon next to List title to enter List's context menu.
      // *Feature not complete yet.*
      let _newListHeaderMenu = document.createElement('i');
      _newListHeaderMenu.ariaHidden = true;
      _newListHeaderMenu.classList.add("fa", "fa-bars");
      _newListHeader.append(_newListHeaderTitle);
      _newListHeader.append(_newListHeaderMenu);
      _newListHeaderMenu.addEventListener('click', ListContextMenu_show);

      // Input area for typing in the name of new tasks for the List.
      let _newInput = document.createElement('input');
      _newInput.id = this.id + '-input';
      _newInput.maxLength = 256;
      _newInput.type = 'text';
      _newInput.name = "add-todo-text";
      _newInput.placeholder = "Add Task...";
      _newInput.addEventListener('keyup', (e) => {
          if (e.code === "Enter") _newButton.click();
      });

      // Button next to input to convert the text from the _newInput into an actual task in the List.
      let _newButton = document.createElement('button');
      _newButton.id = this.id + '-button';
      _newButton.classList.add("plus-button");
      _newButton.innerText = '+';
      _newButton.addEventListener('click', () => {
          let _inputValue = _newInput.value;
          if (!_inputValue) return createAlert("Type a name for the task!");
          let _task = new task(_inputValue, null, getBoardFromId(this.parentBoardId).uniqueID(), this.id);
          this.addTask(_task);
          _newInput.value = '';
          _newInput.focus(); // wont because the List is being re-rendered
      });

      let _newList = document.createElement('div');
      _newList.id = this.id;
      _newList.classList.add('parent-List');
      _newList.appendChild(_newListHeader);

      if (this.tasks) {
          // If the List has tasks in it.

          // Render the tasks of the List.
          let _newtaskList = this.rendertasks();

          // Add the list to the List.
          _newList.appendChild(_newtaskList);
      }

      // Add the input and button to add new task at the end.
      _newList.appendChild(_newInput);
      _newList.appendChild(_newButton);

      return _newList;
  }
}

class Board {

  constructor(name, id, settings, identifier=0) {
      this.name = name;
      this.id = id;
      this.settings = settings;
      this.Lists = [];  // All the Lists that are currently in the container as List objects.
      this.identifier = identifier === null ? Date.now() : identifier;  // All elements within this board will carry an unqiue id.
  }

  uniqueID() {
      this.identifier += 1;
      return 'e' + this.identifier.toString();
  }

  addList() {
      let _ListTitle = e_addListText.value;
      e_addListText.value = '';
  
      // If the user pressed the button without typing any name, we'll default to "Untitled List {Lists length +1}"
      if (!_ListTitle) _ListTitle = `Untitled List ${this.Lists.length + 1}`;
  
      let _List = new List(_ListTitle, this.uniqueID(), this.id);
      this.Lists.push(_List);

      let _newList = _List.generateElement();
      e_ListsContainer.insertBefore(_newList, e_ListsContainer.childNodes[e_ListsContainer.childNodes.length - 2]);
  }
}






const sidebar = document.getElementById('sidebar');
const sidebarButton = document.getElementById('sidebarButton');
const sidebarClose = document.getElementById('sidebarClose');


document.addEventListener("DOMContentLoaded", () => {  
  
  
  
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
        // Listen click outside of sidebar
        setTimeout(() => {
            document.addEventListener('click', listenClickOutside);
        }, 300);
    }
  }

  sidebarButton.addEventListener('click', toggleSidebar);
  sidebarClose.addEventListener('click', toggleSidebar);
  
  function listenClickOutside(event) {
    const _withinBoundaries = event.composedPath().includes(sidebar);
    if (!_withinBoundaries && sidebar.style.width === "250px") {
        toggleSidebar();
    }
}
  
  
  
  
  
  
  
  
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
  const newList = document.createElement("div");
  newList.className = "boardList";
  //newList.draggable = true;
  newList.innerHTML = `
    <header>
      <h2 contenteditable="true">New List</h2>
      <button class="deleteListButton"><i class="fa-solid fa-trash"></i></button>
    </header>

    <div class="boardListBody"></div>
    
    <footer>
      <button class="addTaskButton"><i class="fa-solid fa-plus"></i>Add Task</button>
    </footer>
  `;

  boardContainer.appendChild(newList);


  const listBody = newList.querySelector(".boardListBody");

  // Task adding
  newList.querySelector(".addTaskButton").addEventListener("click", () => {
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
  newList.querySelector(".deleteListButton").addEventListener("click", () => {
    newList.remove();
  });
});
});
