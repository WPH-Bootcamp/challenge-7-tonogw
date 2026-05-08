"use strict";

class Todo {
  constructor({ id, title, deadline = null, completed = false }) {
    if (!title || title.trim() === "") {
      throw new Error("Title can't be empty");
    }
    this.id = id || generateUniqueId();
    this.title = title;
    this.completed = completed;
    this.createAt = new Date().toISOString();
    this.deadline = deadline; // just string datetime only
  }
  //   markCompleted() {
  //     this.completed = true;
  toggle() {
    this.completed = !this.completed;
  }
}

class TodoList {
  constructor() {
    this.todos = [];
  }

  addTodo(todo) {
    this.todos.push(todo);
  }

  deleteTodo(id) {
    this.todos = this.todos.filter((todo) => todo.id !== id);
  }

  markTodoCompleted(id) {
    const todo = this.todos.find((todo) => todo.id === id);
    if (!todo) throw new Error("Todo not found");
    todo.toggle();
  }

  listTodos() {
    return this.todos;
  }
}

const STORAGE_KEY = "todo-app-data";

function saveToLocalStorage(todo) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todo));
}

function loadFromLocalStorage() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
}

function generateUniqueId() {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

async function fetchTodos() {
  try {
    const response = await fetch(
      "https://my-json-server.typicode.com/tonogw/todo-api/todos",
    );

    if (!response.ok) {
      throw new Error("Data fetch failed");
    }
    return await response.json();
  } catch (error) {
    console.error("Error:", error.message);
    return [];
  }
}

const todoList = new TodoList();

async function initApp() {
  //   const data = await fetchTodos();
  const localData = loadFromLocalStorage();

  if (localData && localData.length > 0) {
    localData.forEach((item) => {
      const todo = new Todo({
        id: item.id,
        title: item.title,
        deadline: item.deadline,
        completed: item.completed,
      });
      todoList.addTodo(todo);
    });
  } else {
    const data = await fetchTodos();

    data.forEach((item) => {
      const todo = new Todo({
        id: item.id,
        title: item.title,
        completed: item.completed,
      });

      todoList.addTodo(todo);
    });

    saveToLocalStorage(todoList.listTodos());
  }
  renderTodos();
}

function renderTodos() {
  const container = document.getElementById("todo-list");
  container.innerHTML = "";

  const todos = todoList.listTodos();

  if (todos.length === 0) {
    container.innerHTML = "<tr><td colspan='4'>No tasks available</td></tr>   ";
    return;
  }

  todos.forEach((todo) => {
    const tr = document.createElement("tr");

    // ====== TASK NAME ======
    const tdTitle = document.createElement("td");
    tdTitle.textContent = todo.title;

    // toggle klik di title
    tdTitle.style.cursor = "pointer";
    tdTitle.addEventListener("click", () => {
      todoList.markTodoCompleted(todo.id);
      saveToLocalStorage(todoList.listTodos());
      renderTodos();
    });

    // ======= DEADLINE =======
    const tdDeadline = document.createElement("td");
    tdDeadline.textContent = todo.deadline
      ? new Date(todo.deadline).toLocaleString()
      : "-";

    // ======= STATUS =======
    const tdStatus = document.createElement("td");
    tdStatus.textContent = getStatusLabel(todo);

    // Giving color on status task
    if (isOverdue(todo)) {
      tdStatus.classList.add("Overdue");
    } else if (todo.completed) {
      tdStatus.classList.add("Completed");
    } else {
      tdStatus.classList.add("Ongoing");
    }

    // ===== ACTION =====
    const tdAction = document.createElement("td");
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";

    deleteBtn.addEventListener("click", () => {
      const confirmDelete = confirm("Delete this task?");
      if (!confirmDelete) return;

      todoList.deleteTodo(todo.id);
      saveToLocalStorage(todoList.listTodos());
      renderTodos();
    });

    tdAction.appendChild(deleteBtn);

    // append all
    tr.appendChild(tdTitle);
    tr.appendChild(tdDeadline);
    tr.appendChild(tdStatus);
    tr.appendChild(tdAction);

    container.appendChild(tr);
  });
}

//     const status = getStatusLabel(todo);
//     // li.textContent = `${todo.title} | ${status}`;

//     //    li.textContent = `${todo.title} - ${todo.completed ? "✔" : "❌"}`;

//     let text = `${todo.title}`;

//     if (todo.deadline) {
//       text += ` |  ${new Date(todo.deadline).toLocaleString()}`;
//     }
//     text += ` | ${getStatusLabel(todo)}`;

//     li.textContent = text;

//     // toggle when click
//     li.addEventListener("click", () => {
//       todoList.markTodoCompleted(todo.id);
//       saveToLocalStorage(todoList.listTodos());
//       renderTodos();
//     });

//     container.appendChild(li);
//   });
// }

function isOverdue(todo) {
  if (!todo.deadline) return false;

  const now = new Date();
  const deadline = new Date(todo.deadline);

  return !todo.completed && deadline < now;
}

function getStatusLabel(todo) {
  if (isOverdue(todo)) return "! OVERDUE";
  if (todo.completed) return " ✔ COMPLETED";
  return " ⏳ ONGOING";
}

// Event Listener (Add Todo)
document.getElementById("add-btn").addEventListener("click", () => {
  try {
    const input = document.getElementById("todo-input");
    const deadlineInput = document.getElementById("deadline-input");

    const value = input.value.trim();

    if (!value) {
      alert("Title can't be empty");
      return;
    }

    const deadlineValue = deadlineInput.value || null;

    //const todo = new Todo(null, value, false, deadlineValue);
    const todo = new Todo({
      title: value,
      deadline: deadlineValue,
    });

    todoList.addTodo(todo);
    saveToLocalStorage(todoList.listTodos());

    renderTodos();
    input.value = "";
    deadlineInput.value = "";
  } catch (error) {
    alert(error.message);
  }
});

initApp();
