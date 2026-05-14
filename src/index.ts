// TODO: Import readline untuk membaca input dari command line

// TODO: Import fungsi-fungsi dari todoService

// TODO: Import fungsi-fungsi dari utils (termasuk type guards)

// TODO: Buat fungsi untuk menampilkan menu utama
// Tampilkan opsi seperti:
// 1. Add new todo
// 2. Mark todo as complete
// 3. Delete todo
// 4. List all todos
// 5. Search todos
// 6. Exit

// TODO: Buat fungsi untuk handle input dari user
// Gunakan readline.question untuk menerima input

// TODO: Buat fungsi main yang akan menjalankan aplikasi secara loop
// Hint: Gunakan recursive function atau while loop

// TODO: Jalankan fungsi main
console.log("Welcome to TypeScript To-Do App!");
console.log("Start building your app here...");

import { Todo } from "./types.js";
import { generateUniqueId, getStatusLabel } from "./utils.js";
import { TodoService } from "./todoService.js";
import { loadTodos, saveTodos } from "./storage.js";

const service = new TodoService(loadTodos());

// USER PROFILE MAINTENANCE
const USER_KEY = "userName";
const DEFAULT_USER = "Guest";

// API FETCH GET & POST
const GET_API_URL =
  "https://my-json-server.typicode.com/tonogw/todo-api/v1_todos";
// const POST_API_URL = "https://jsonplaceholder.typicode.com/posts";
const POST_API_URL = "http://localhost:3000/todos";

export async function getTodosFromAPI(): Promise<Todo[]> {
  try {
    const res = await fetch(GET_API_URL);

    if (!res.ok) {
      throw new Error("Failed to fetch data");
    }

    const data: unknown = await res.json();

    if (!Array.isArray(data)) {
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

// POST DATA TO API
export async function postTodoToAPI(todo: Todo): Promise<void> {
  try {
    await fetch(POST_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(todo),
    });
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
  list: document.getElementById("todo-list"),
  sortId: document.getElementById("sort-id"),
  sortTitle: document.getElementById("sort-title"),
  sortDeadline: document.getElementById("sort-deadline"),
  sortStatus: document.getElementById("sort-status"),

  // FORM PAGE TITLE TO TOGGLE ADD OR EDIT
  formTitle: document.querySelector(".page-input-content h2"),
  titleInput: document.getElementById("page-input-content-title"),

  // FORM INPUT
  searchInput: document.getElementById("search-input"),
  inputPage: document.getElementById("page-input"),
  descInput: document.getElementById("page-input-desc"),
  dateInput: document.getElementById("page-input-date-input"),
  saveBtn: document.getElementById("save-task"),
  cancelBtn: document.getElementById("page-input-cancel-btn"),
  // deleteBtn: document.getElementById("delete-btn"),

  // FORM EDIT
  // editPage: document.getElementById("page-edit"),
  // editFieldDesc: document.getElementById("edit-field"),
  // editFieldDate: document.getElementById("edit-field"),
  // saveEditBtn: document.getElementById("update-task"),
  // cancelEditBtn: document.getElementById("cancel-edit"),
};

// const description = (el.descInput as HTMLTextAreaElement).value.trim();

// let userName = getUserName();
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

function renderUser(): void {
  const clickDefaultUser = getUserName();

  if (!el.userName) {
    return;
    // el.userName.textContent = getUserName();
  }

  el.userName.textContent = clickDefaultUser;

  if (clickDefaultUser === DEFAULT_USER) {
    el.userName.style.cursor = "pointer";
    el.userName.classList.add("profile-btn");
    // el.userName.style.color = "blue";

    el.userName.onclick = () => {
      const replaceGuest = prompt("Input your name to replace Guest");

      if (!replaceGuest || !replaceGuest.trim()) {
        return;
      }

      setUserName(replaceGuest.trim());
      renderUser();
    };
  } else {
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

let sortWay = {
  id: true,
  title: true,
  deadline: true,
  completed: true,
};

function bindEvents(): void {
  el.startBtn?.addEventListener("click", () => {
    showMain();

    if (getUserName() === DEFAULT_USER) {
      const clickDefaultUser = prompt("Please input your name: ");

      if (clickDefaultUser && clickDefaultUser.trim()) {
        setUserName(clickDefaultUser);
      }
    }
    renderUser();
  });

  // HINT TO CHANGE GUEST INTO USER NAME
  if (getUserName() === DEFAULT_USER) {
    el.userName?.setAttribute("title", "Click to change your name");
  } else {
    // el.userName?.remove();
  }

  // EXIT BUTTON TO SIGN OUT FROM TODO APP
  el.exitBtn?.setAttribute("tooltip", "Logout");
  el.exitBtn?.addEventListener("click", () => {
    showCover();
  });

  // OPEN FORM BUTTON TO ADD NEW TASK OR TODO
  el.openBtn?.addEventListener("click", () => {
    openAddForm();
  });

  // CANCEL BUTTON ON FORM TODO
  el.cancelBtn?.addEventListener("click", () => {
    closeForm();
  });

  // // DELETE BUTTON ON TODO LIST
  // el.deleteBtn?.classList.value("delete-btn");

  el.searchInput?.addEventListener("input", () => {
    const searchKey = (el.searchInput as HTMLInputElement).value.toLowerCase();

    renderTodos(service, searchKey);
  });

  el.sortId?.setAttribute("data-tooltip", "A-Z | Z-A");
  el.sortId?.addEventListener("click", () => {
    service.sortBy("id", sortWay.id);
    sortWay.id = !sortWay.id;
    renderTodos(service);
  });

  el.sortTitle?.setAttribute("data-tooltip", "Sort A-Z | Z-A");
  el.sortTitle?.addEventListener("click", () => {
    service.sortBy("title", sortWay.title);
    sortWay.title = !sortWay.title;
    renderTodos(service);
  });

  el.sortDeadline?.setAttribute("data-tooltip", "Sort A-Z | Z-A");
  el.sortDeadline?.addEventListener("click", () => {
    service.sortBy("deadline", sortWay.deadline);
    sortWay.deadline = !sortWay.deadline;
    renderTodos(service);
  });

  el.sortStatus?.setAttribute("data-tooltip", "A-Z | Z-A");
  el.sortStatus?.addEventListener("click", () => {
    service.sortBy("completed", sortWay.completed);
    sortWay.completed = !sortWay.completed;
    renderTodos(service);
  });

  // SAVE ADD TODO OR TASK
  el.saveBtn?.addEventListener("click", async () => {
    const title = (el.titleInput as HTMLInputElement).value.trim();

    const description = (el.descInput as HTMLTextAreaElement).value.trim();

    const deadline = (el.dateInput as HTMLInputElement).value.trim();

    const todo = {
      id: generateUniqueId(service.getAll()),
      title,
      description,
      completed: false,
      deadline,
      // createdAt: new Date().toISOString(),
      createdAt: new Date().toLocaleString(),
    };

    if (!title) {
      alert("Title is required");
      return;
    }

    if (editTodoId) {
      service.update(editTodoId, {
        title,
        description,
        deadline,
      });
    } else {
      service.add(todo);
      await postTodoToAPI(todo);
    }

    saveTodos(service.getAll());
    renderTodos(service);

    (el.titleInput as HTMLInputElement).value = "";
    (el.descInput as HTMLTextAreaElement).value = "";
    (el.dateInput as HTMLInputElement).value = "";
    closeForm();
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

  el.formTitle!.textContent = "Add Todo";

  (el.titleInput as HTMLInputElement).value = "";
  (el.descInput as HTMLTextAreaElement).value = "";
  (el.dateInput as HTMLInputElement).value = "";

  el.inputPage?.classList.remove("hidden");
}

function openEditForm(todo: Todo): void {
  editTodoId = todo.id;

  el.formTitle!.textContent = "Edit Todo";

  (el.titleInput as HTMLInputElement).value = todo.title;
  (el.descInput as HTMLTextAreaElement).value = todo.description;
  (el.dateInput as HTMLInputElement).value = todo.deadline || "";

  el.inputPage?.classList.remove("hidden");
}

// EXIT FROM FORM INPUT
function closeForm(): void {
  // el.mainPage!.classList = "page-input-cancel-btn";

  el.inputPage?.classList.add("hidden");
  // el.mainPage?.classList.remove("hidden");
}

export function renderTodos(service: TodoService, searchKey = "") {
  const container = document.getElementById("todo-list")!;
  container.innerHTML = "";

  const todos: Todo[] = service
    .getAll()
    .filter(
      (todo: Todo) =>
        todo.id.includes(searchKey) ||
        todo.title.toLowerCase().includes(searchKey) ||
        todo.description.toLowerCase().includes(searchKey) ||
        todo.deadline?.includes(searchKey),
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

    // tdDeadline.textContent = todo.deadline || "-";
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

    tdTitle.addEventListener("click", toggleTodo);
    tdTitle.style.cursor = "pointer";
    tdTitle.title = "Click to toggle ACTIVE / DONE";

    tdStatus.addEventListener("click", toggleTodo);
    tdStatus.style.cursor = "pointer";
    tdStatus.title = "Click to toggle ACTIVE / DONE";

    editBtn.onclick = () => {
      openEditForm(todo);
    };

    deleteBtn.onclick = () => {
      service.delete(todo.id);
      saveTodos(service.getAll());
      renderTodos(service);
    };

    if (todo.completed) {
      tr.classList.add("row-completed");
    } else if (todo.deadline && new Date(todo.deadline) < new Date()) {
      tr.classList.add("row-overdue");
    }

    tdAction.append(editBtn, deleteBtn);

    tr.append(tdId, tdTitle, tdDesc, tdDeadline, tdStatus, tdAction);

    container.appendChild(tr);
  });
}

init();
