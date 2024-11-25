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
                <span>Title</span>
                <button class="deleteTaskButton">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
            </div>
            <div class="boardTaskTags">
                <span class='boardTaskTag boardTaskTag--tag-1'>Art</span>
            </div>
        </div>
        <p>Hello World</p>
    `;

    // Edit task
    
    task.querySelector(".editTaskButton").addEventListener("click", () => {
      const title = prompt("Enter new title:", task.querySelector(".boardTaskTitle span").textContent);
      const description = prompt("Enter new description:", task.querySelector("p").textContent);
      if (title) task.querySelector(".boardTaskTitle span").textContent = title;
      if (description) task.querySelector("p").textContent = description;
    });

    // Delete task
    task.querySelector(".deleteTaskButton").addEventListener("click", () => {
      task.remove();
    });

    return task;
  };


// Add task
document.querySelectorAll(".addTaskButton").forEach((button) => {
  button.addEventListener("click", () => {
    const listBody = button.closest(".boardList").querySelector(".boardListBody");
    listBody.appendChild(createTaskElement());
  });
});

// Drag-and-drop
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

  boardContainer.insertBefore(newList, boardContainer.lastElementChild);

  // Task addition for new list
  newList.querySelector(".addTaskButton").addEventListener("click", () => {
    const listBody = newList.querySelector(".boardListBody");
    listBody.appendChild(createTaskElement());
  });

  // List deletion
  newList.querySelector(".deleteListBtn").addEventListener("click", () => {
    newList.remove();
  });
});
});






/*

document.addEventListener('DOMContentLoaded', (event) => {

  var dragSrcEl = null;
  
  function handleDragStart(e) {
    this.style.opacity = '0.1';
    this.style.border = '3px dashed #c4cad3';
    
    dragSrcEl = this;

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
  }

  function handleDragOver(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }

    e.dataTransfer.dropEffect = 'move';
    
    return false;
  }

  function handleDragEnter(e) {
    this.classList.add('task-hover');
  }

  function handleDragLeave(e) {
    this.classList.remove('task-hover');
  }

  function handleDrop(e) {
    if (e.stopPropagation) {
      e.stopPropagation(); // stops the browser from redirecting.
    }
    
    if (dragSrcEl != this) {
      dragSrcEl.innerHTML = this.innerHTML;
      this.innerHTML = e.dataTransfer.getData('text/html');
    }
    
    return false;
  }

  function handleDragEnd(e) {
    this.style.opacity = '1';
    this.style.border = 0;
    
    items.forEach(function (item) {
      item.classList.remove('task-hover');
    });
  }
  
  
  let items = document.querySelectorAll('.task'); 
  items.forEach(function(item) {
    item.addEventListener('dragstart', handleDragStart, false);
    item.addEventListener('dragenter', handleDragEnter, false);
    item.addEventListener('dragover', handleDragOver, false);
    item.addEventListener('dragleave', handleDragLeave, false);
    item.addEventListener('drop', handleDrop, false);
    item.addEventListener('dragend', handleDragEnd, false);
  });
});

*/