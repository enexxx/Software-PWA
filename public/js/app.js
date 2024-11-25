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
          

          // task Title
          let taskElementTitle = document.createElement('p');
          taskElementTitle.innerText = task.title;
          taskElementTitle.classList.add('taskTitle');
          

          // Housing for the edit and delete buttons.
          let taskElementButtons = document.createElement('span');


          // Edit button. Allows the user to rename the task.
          let taskElementEditButton = document.createElement('i');
          taskElementEditButton.ariaHidden = true;
          taskElementEditButton.classList.add('fa', 'fa-pencil');
          
          taskElementEditButton.addEventListener('click', () => {
              
              // List task editing functionality.
              let input = document.createElement('textarea');
              input.value = taskElementTitle.textContent;
              input.classList.add('task-title');
              input.maxLength = 256;
              taskElementTitle.replaceWith(input);

              let _save = () => {
                  task.title = input.value;
                  renderList(this.id);
              };

              input.addEventListener('blur', _save, {
                  once: true,
              });
              input.focus();
          });


          // Delete button. ALlows the user to delete the task from the List.
          let taskElementDeleteButton = document.createElement('i');
          taskElementDeleteButton.ariaHidden = true;
          taskElementDeleteButton.classList.add('fa', 'fa-trash');
          
          taskElementDeleteButton.addEventListener('click', () => {
              createConfirmDialog("Are you sure to delete this task?", () => this.removeTask(task));
          });


          // Add both the buttons to the span tag.
          taskElementButtons.appendChild(taskElementEditButton);
          taskElementButtons.appendChild(taskElementDeleteButton);

          // Add the title, span tag to the task and the task itself to the list.
          taskElement.appendChild(taskElementTitle);
          taskElement.appendChild(taskElementButtons);
          taskListElement.appendChild(taskElement);
      }

      return taskListElement;
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
      //        {moretasks...}
      //    </ul>  
      //  </div>

      // This was somewhat of a bad idea...
      // Editing the style of the Lists or tasks are made quite difficult.
      // I should've wrote all this as HTML and put it in the .innerHTML
      // But this gives me more flexibility, so I had to make a choice.

      let listElementHeader = document.createElement('span');
      let listElementHeaderTitle = document.createElement('h2');
      listElementHeaderTitle.id = this.id + '-h2';
      listElementHeaderTitle.innerText = this.name;
      listElementHeaderTitle.classList.add('text-fix', 'List-title');

      // A better, more flexible alternative to contentEditable.
      // We replace the text element with an input element.
      listElementHeaderTitle.addEventListener('click', (e) => {
          let input = document.createElement('input');
          input.value = listElementHeaderTitle.textContent;
          input.classList.add('List-title');
          input.maxLength = 128;
          listElementHeaderTitle.replaceWith(input);

          let _save = () => {
              this.name = input.value;
              renderList(this.id);
          };

          input.addEventListener('blur', _save, {
              once: true,
          });
          input.focus();
      });

      /*
      // Hamburger menu icon next to List title to enter List's context menu.
      // *Feature not complete yet.*
      let listElementHeaderMenu = document.createElement('i');
      listElementHeaderMenu.ariaHidden = true;
      listElementHeaderMenu.classList.add("fa", "fa-bars");
      listElementHeader.append(listElementHeaderTitle);
      listElementHeader.append(listElementHeaderMenu);
      listElementHeaderMenu.addEventListener('click', ListContextMenu_show);
      */

      // Input area for typing in the name of new tasks for the List.
      let listInputElement = document.createElement('input');
      listInputElement.id = this.id + '-input';
      listInputElement.maxLength = 256;
      listInputElement.type = 'text';
      listInputElement.name = "add-todo-text";
      listInputElement.placeholder = "Add Task...";
      listInputElement.addEventListener('keyup', (e) => {
          if (e.code === "Enter") listButtonElement.click();
      });

      // Button next to input to convert the text from the listInputElement into an actual task in the List.
      let listButtonElement = document.createElement('button');
      listButtonElement.id = this.id + '-button';
      listButtonElement.classList.add("plus-button");
      listButtonElement.innerText = '+';
      listButtonElement.addEventListener('click', () => {
          let inputValue = listInputElement.value;
          if (!inputValue) return createAlert("Type a name for the task!");
          let task = new task(inputValue, null, getBoardFromId(this.parentBoardId).uniqueID(), this.id);
          this.addTask(task);
          listInputElement.value = '';
          listInputElement.focus(); // wont because the List is being re-rendered
      });

      let listElement = document.createElement('div');
      listElement.id = this.id;
      listElement.classList.add('parent-List');
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
      this.Lists = [];  // All the Lists that are currently in the container as List objects.
      this.identifier = identifier === null ? Date.now() : identifier;  // All elements within this board will carry an unqiue id.
  }

  uniqueID() {
      this.identifier += 1;
      return 'e' + this.identifier.toString();
  }

  addList() {
      let listTitle = addListText.value;  //add list input field's text value
      addListText.value = '';
  
      // If the user created without typing any name
      if (!listTitle) listTitle = `Untitled List ${this.Lists.length + 1}`;
  
      let list = new List(listTitle, this.uniqueID(), this.id);
      this.Lists.push(list);

      let listElement = list.generateElement();
      listsContainer.insertBefore(listElement, listsContainer.childNodes[listsContainer.childNodes.length - 2]);
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
  const listElement = document.createElement("div");
  listElement.className = "boardList";
  //listElement.draggable = true;
  listElement.innerHTML = `
    <header>
      <h2 contenteditable="true">New List</h2>
      <button class="deleteListButton"><i class="fa-solid fa-trash"></i></button>
    </header>

    <div class="boardListBody"></div>
    
    <footer>
      <button class="addTaskButton"><i class="fa-solid fa-plus"></i>Add Task</button>
    </footer>
  `;

  boardContainer.appendChild(listElement);


  const listBody = listElement.querySelector(".boardListBody");

  // Task adding
  listElement.querySelector(".addTaskButton").addEventListener("click", () => {
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
  listElement.querySelector(".deleteListButton").addEventListener("click", () => {
    listElement.remove();
  });
});
});
