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

// import { document } from "postcss";
// import { renderTodos } from "./dom";
import { loadTodos, saveTodos } from "./storage.js";
import { TodoService } from "./todoService.js";
// import { renderTodos } from "./dom";
import { generateUniqueId } from "./utils.js";
// import { document } from "postcss";
// import { TodoService } from "./todoService";
// import { saveTodos } from "./storage";
import { getStatusLabel } from "./utils.js";
// import { document } from "postcss";
import { sortField, Todo, TodoStatus } from "./types.js";

const service = new TodoService(loadTodos());

// USER PROFILE MAINTENANCE
const USER_KEY = "userName";
const DEFAULT_USER = "Guest";

// API FETCH GET & POST
const GET = "https://my-json-server.typicode.com/tonogw/todo-api/v1_todos";
const POST = "https://jsonplaceholder.typicode.com/posts";

export async function getTodosFromAPI(): Promise<Todo[]> {
  try {
    const res = await fetch(GET);

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
    await fetch(POST, {
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

  // FORM PAGE TITLE TO TOGGLE ADD OR EDIT
  formTitle: document.querySelector(".page-input-content h2"),
  titleInput: document.getElementById("page-input-content-title"),

  // FORM INPUT
  inputPage: document.getElementById("page-input"),
  descInput: document.getElementById("page-input-desc"),
  dateInput: document.getElementById("page-input-date-input"),
  saveBtn: document.getElementById("save-task"),
  cancelBtn: document.getElementById("page-input-cancel-btn"),

  // FORM EDIT
  editPage: document.getElementById("page-edit"),
  editFieldDesc: document.getElementById("edit-field"),
  editFieldDate: document.getElementById("edit-field"),
  saveEditBtn: document.getElementById("update-task"),
  cancelEditBtn: document.getElementById("cancel-edit"),
};

const description = (el.descInput as HTMLTextAreaElement).value.trim();

let userName = getUserName();
let editTodoId: string | null = null;

// function init(): void {
//   bindEvents();
//   renderUser();
//   renderTodos(service);
// }

// INITIALIZATION APP
async function init() {
  let todos = loadTodos();

  if (todos.length === 0) {
    todos = await getTodosFromAPI();

    saveTodos(todos);
  }

  service.getAll();

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

    el.userName.onclick = () => {
      const replaceGuest = prompt("Input your name to replace Guest");

      if (!replaceGuest || !replaceGuest.trim()) {
        return;
      }

      setUserName(replaceGuest.trim());
      renderUser();
    };
  } else {
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
  el.userName?.setAttribute("title", "Click to change your name");

  // EXIT BUTTON TO SIGN OUT FROM TODO APP
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

  el.sortId?.addEventListener("click", () => {
    service.sortBy("id");
    renderTodos(service);
  });

  el.sortTitle?.addEventListener("click", () => {
    service.sortBy("title");
    renderTodos(service);
  });

  // SAVE ADD TODO OR TASK
  el.saveBtn?.addEventListener("click", () => {
    const title = (el.titleInput as HTMLInputElement).value.trim();

    const description = (el.descInput as HTMLInputElement).value.trim();

    const deadline = (el.dateInput as HTMLInputElement).value.trim();

    const todo = {
      id: generateUniqueId(),
      title,
      description,
      completed: false,
      deadline,
      createdAt: new Date().toISOString(),
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
    }

    // service.add({
    //   id: generateUniqueId(),
    //   title,
    //   description,
    //   deadline,
    //   completed: false,
    // });

    saveTodos(service.getAll());
    renderTodos(service);

    (((el.titleInput as HTMLInputElement).value = ""),
      ((el.descInput as HTMLTextAreaElement).value = ""),
      ((el.dateInput as HTMLInputElement).value = ""),
      openAddForm());
  });
}

// SHOW MAIN PAGE DISPLAY SCREEN
function showMain(): void {
  // el.mainPage!.classList = "cancel-edit";
  el.mainPage!.classList = "form";
  // el.mainPage!.classList = "page-input-cancel-btn";
  el.coverPage?.classList.add("hidden");
  el.mainPage?.classList.remove("hidden");
}

// EXIT APP / LOGOUT
function showCover(): void {
  el.coverPage?.classList.remove("hidden");
  el.mainPage?.classList.add("hidden");
}

// FORM TO INPUT OR ADD TODO/ TASK
// function openAddForm(): void {
//   el.formTitle!.textContent = "Add Task";

//   (el.titleInput as HTMLInputElement).value = "";
//   (el.descInput as HTMLInputElement).value = "";
//   (el.dateInput as HTMLInputElement).value = "";

//   el.inputPage?.classList.remove("hidden");
// }

// SWITCH FORM ADD OR EDIT
function openAddForm(): void {
  editTodoId = null;

  el.formTitle!.textContent = "Add Task";

  (el.titleInput as HTMLInputElement).value = "";
  (el.descInput as HTMLTextAreaElement).value = "";
  (el.dateInput as HTMLInputElement).value = "";

  el.inputPage?.classList.remove("hidden");
}

function openEditForm(todo: Todo): void {
  editTodoId = todo.id;

  el.formTitle!.textContent = "Edit Task";

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

// // SAVE TODO
// function saveTodos(): void {

// }

// function sortTodos(
//     field:
//     | "id"
//     | "title"
//     | "description"
//     | "deadline"
//     | "completed",
// )

// function sortTodos(field: string): void {
//   // service.sortBy(field);

//   // renderTodos(service);

//   // const el = document();

//   service.sortBy(field); void {
//     this.todos.sort((a, b) => {
//       if (field === "deadline") {
//         return new Date(a.deadline || 0) - new Date(b.deadline || 0);
//       }
//       if (field === "title") {
//         return a.title.localeCompare(b.title);
//       }
//       if (field === "completed") {
//         return Number(a.completed) - Number(b.completed);
//       }
//     });
//   }
// }

export function renderTodos(service: TodoService) {
  const container = document.getElementById("todo-list")!;
  container.innerHTML = "";

  const todos = service.getAll();

  todos.forEach((todo) => {
    const tr = document.createElement("tr");

    const tdId = document.createElement("td");
    tdId.textContent = todo.id;

    const tdTitle = document.createElement("td");
    tdTitle.textContent = todo.title;

    const tdDesc = document.createElement("td");
    tdDesc.textContent = todo.description;

    const tdDeadline = document.createElement("td");
    tdDeadline.textContent = todo.deadline || "-";

    tdTitle.addEventListener("click", () => {
      service.toggle(todo.id);
      saveTodos(service.getAll());
      renderTodos(service);
    });

    const tdStatus = document.createElement("td");
    tdStatus.textContent = getStatusLabel(todo);

    const tdAction = document.createElement("td");
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";

    editBtn.onclick = () => {
      openEditForm(todo);
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "remove";

    deleteBtn.onclick = () => {
      service.delete(todo.id);
      saveTodos(service.getAll());
      renderTodos(service);
    };

    tdAction.append(editBtn, deleteBtn);

    tr.append(tdId, tdTitle, tdDesc, tdDeadline, tdStatus, tdAction);
    container.appendChild(tr);
  });
}

// document.getElementById("save-task")!.addEventListener("click", () => {
//   const input = document.getElementById("todo-input") as HTMLInputElement;
//   const deadlineInput = document.getElementById(
//     "deadline-input",
//   ) as HTMLInputElement;

//   const title = input.value.trim();

//   if (!title) return;

//   service.add({
//     id: generateUniqueId(),
//     title,
//     description: description,
//     completed: false,
//     deadline: deadlineInput.value || null,
//   });

//   saveTodos(service.getAll());
//   renderTodos(service);

//   input.value = "";
//   deadlineInput.value = "";
// });

init();
