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

// API FETCH GET 7 POST
const GET = "https://my-json-server.typicode.com/tonogw/todo-api/todos";
const POST = "https://jsonplaceholder.typicode.com/posts";

// DOM ELEMENT
const el = {
  sortTitle: document.getElementById("sort-title"),
  startBtn: document.getElementById("start-btn"),
  coverPage: document.getElementById("page-cover"),
  mainPage: document.getElementById("page-main"),
  inputPage: document.getElementById("page-input"),
  openBtn: document.getElementById("page-input-open"),
  saveBtn: document.getElementById("save-task"),
  cancelBtn: document.getElementById("page-input-cancel-btn"),
  exitBtn: document.getElementById("exit-lbl"),
  list: document.getElementById("todo-list"),
  userName: document.getElementById("user-name"),

  titleInput: document.getElementById("page-input-content-title"),
  descInput: document.getElementById("page-input-desc"),
  dateInput: document.getElementById("page-input-date-input"),
  formTitle: document.querySelector(".page-input-content h2"),
};

const description = (el.descInput as HTMLTextAreaElement).value.trim();

let userName = getUserName();

function init(): void {
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

      setUserName(clickDefaultUser.trim());
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

    if (userName === "Guest") {
      const clickDefaultUser = prompt("Please input your name: ");

      if (clickDefaultUser && clickDefaultUser.trim()) {
        setUserName(clickDefaultUser);
      }
    }
    renderUser();
  });

  el.exitBtn?.addEventListener("click", () => {
    showCover();
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

// function sortTodos(
//     field:
//     | "title"
//     | "description"
//     | "deadline"
//     | "completed",
// )
// function sortTodos(field: string): void {
//   service.sortBy(field);

//   renderTodos(service);
// }
// const el = document();

// sortBy(field) {
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

el.sortTitle?.addEventListener("click", () => {
  service.sortBy("title");
  renderTodos(service);
});

export function renderTodos(service: TodoService) {
  const container = document.getElementById("todo-list")!;
  container.innerHTML = "";

  const todos = service.getAll();

  todos.forEach((todo) => {
    const tr = document.createElement("tr");

    const tdTitle = document.createElement("td");
    tdTitle.textContent = todo.title;

    tdTitle.addEventListener("click", () => {
      service.toggle(todo.id);
      saveTodos(service.getAll());
      renderTodos(service);
    });

    const tdStatus = document.createElement("td");
    tdStatus.textContent = getStatusLabel(todo);

    const tdAction = document.createElement("td");
    const btn = document.createElement("button");
    btn.textContent = "remove";

    btn.onclick = () => {
      service.delete(todo.id);
      saveTodos(service.getAll());
      renderTodos(service);
    };

    tdAction.appendChild(btn);

    tr.append(tdTitle, tdStatus, tdAction);
    container.appendChild(tr);
  });
}

document.getElementById("save-task")!.addEventListener("click", () => {
  const input = document.getElementById("todo-input") as HTMLInputElement;
  const deadlineInput = document.getElementById(
    "deadline-input",
  ) as HTMLInputElement;

  const title = input.value.trim();

  if (!title) return;

  service.add({
    id: generateUniqueId(),
    title,
    description: description,
    completed: false,
    deadline: deadlineInput.value || null,
  });

  saveTodos(service.getAll());
  renderTodos(service);

  input.value = "";
  deadlineInput.value = "";
});

init();
