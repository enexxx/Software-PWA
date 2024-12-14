### How to run:

run 'npm install' to instsall dependencies
run 'npx nodemon server.js' to start the server. (You can also run index.html directly with working data persistence if you wish, just ignore the CORS error.)
- If you're on a school connection, please make sure you're autheticated, else you may not be able to connect to fontawesome for the icons, making the page not function as intended.



### How to use:

This is a Kanban / 'To-do list' Progessive Web App. You can create boards, which contian lists of tasks.

## Boards
If no saved data exists, a board is automatically created. You can change the name of the board by clicking the board name on it in the navbar.
To open the side menu and view all the boards and create new ones, pres sthe menu button. To create a board, enter a name in the input field and press 'Add Board'.
In the navbar is also a dark mode toggle, and a delete button to delete the current board.

## Lists
To create a list, press the 'plus' button inside the board. You can change the title of the list by clicking the list title.
To delete a list, hover (or tap on mobile) the list header, and a trash button will appear. Click this to delete the list and its' contents.
To rearrange the lists, click and hold the header, and drag it to the desired position.
If a large amount of lists are added, a scrollbar will appear.

## Tasks
To add a task, press the 'plus' button at the bottom of the list. This will open the task editing dialogue, where you can add a title, body, and tags. If no title is provided, it will be named 'Untitled Task'.
To bring up the edit dialogue after closing it, hover (or tap on mobile) the task, and the edit button will appear, along with the delete button.
To move tasks, click and hold, and drag to the desired position (it can be dragged in the same list or in other lists as well). The border will turn grey if you are moving it to it's original positon.
If a large number of tasks are added to a list, a scrollbar will appear.

## Tags
To add a tag, open the task dialogue and press the 'plus' button. This will show all the current tags on the board that can be selected, and options to add a new tag as well.
You can type a name, and change the colour, before pressing 'plus' to add it to the task and the board. A tag is unique, once added to a board, a tag with the same name can not be added.
To change the colour, press the box on the tag in the task edit mode. This will change the colour of all tags on the board. To remove a tag from a task, press the 'x' button in the task edit mode.
