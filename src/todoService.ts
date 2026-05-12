// TODO: Import tipe-tipe yang sudah didefinisikan di types.ts

// TODO: Import fungsi storage untuk baca/tulis file

// TODO: Buat fungsi untuk menambahkan To-Do baru
// - Generate id yang unik (bisa pakai timestamp atau counter)
// - Pastikan text tidak kosong
// - Set default status sebagai active

// TODO: Buat fungsi untuk menandai To-Do sebagai selesai
// - Cari To-Do berdasarkan id
// - Ubah statusnya menjadi completed
// - Handle kasus jika id tidak ditemukan

// TODO: Buat fungsi untuk menghapus To-Do
// - Filter To-Do berdasarkan id
// - Handle kasus jika id tidak ditemukan

// TODO: Buat fungsi untuk menampilkan semua To-Do
// - Tampilkan dengan format yang rapi
// - Tambahkan status [ACTIVE] atau [DONE] di depan setiap To-Do
// - Berikan nomor urut untuk memudahkan user memilih

// TODO: Buat fungsi untuk mencari To-Do berdasarkan keyword

import { Todo, TodoStatus, sortField } from "./types.js";
import { saveTodos, loadTodos } from "./storage.js";

export class TodoService {
  //   private todos: Todo[] = [];
  private todos: Todo[];

  constructor(initial: Todo[] = []) {
    this.todos = initial;
  }

  // SHOW ALL TO DO LIST
  getAll(): Todo[] {
    return this.todos;
  }

  //   ADD OR INSERT NEW TODO
  add(todo: Todo): void {
    this.todos.push(todo);
  }

  //   delete(id: string): void {
  //     const todos = this.todos.find((t) => t.id !== id);
  //   }

  //   toggle(id: string): void {
  //     const todo = this.todos.find((t) => t.id === id);
  //     if (!todo) throw new Error("Todo not found");

  //     todo.completed = !todo.completed;
  //   }

  //   DELETE A TODO LIST
  delete(id: string): void {
    const before = this.todos.length;

    this.todos = this.todos.filter((t) => t.id !== id);

    if (this.todos.length === before) {
      throw new Error("Todo not found");
    }
  }

  //   TO SEARCH AND SORT TODO LIST
  toggle(id: string): void {
    const todo = this.todos.find((t) => t.id === id);

    if (!todo) {
      throw Error("Todo not found");
    }
    todo.completed = !todo.completed;
  }

  sortBy(field: sortField | "id" | "title" | "deadline" | "completed"): void {
    this.todos.sort((a, b) => {
      // SORT BY UNIQ ID
      if (field === "id") {
        return a.id.localeCompare(b.id);
      }

      // SORT BY TITLE
      if (field === "title") {
        return a.title.localeCompare(b.title);
      }

      // SORT BY END DATE
      if (field === "deadline") {
        return (
          new Date(a.deadline || 0).getTime() -
          new Date(b.deadline || 0).getTime()
        );
      }

      return Number(a.completed) - Number(b.completed);
    });
  }
}
