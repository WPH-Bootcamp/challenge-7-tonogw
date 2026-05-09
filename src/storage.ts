// import * as fs from "fs";
// import * as path from "path";

// TODO: Definisikan path file untuk menyimpan data To-Do

// TODO: Buat fungsi untuk membaca To-Do dari file
// Hint: Gunakan try-catch untuk handle error saat membaca file

// TODO: Buat fungsi untuk menyimpan To-Do ke file
// Hint: Jangan lupa konversi ke JSON string sebelum disimpan

// TODO: Buat fungsi untuk inisialisasi storage (buat file kosong jika belum ada)

import { Todo } from "./types.js";

const STORAGE_KEY = "todo-app-data";

export function saveTodos(todos: Todo[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

export function loadTodos(): Todo[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];

  const parsed: unknown = JSON.parse(data);

  if (!Array.isArray(parsed)) return [];

  return parsed as Todo[];
}
