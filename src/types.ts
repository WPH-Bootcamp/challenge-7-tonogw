// TODO: Definisikan tipe data untuk To-Do item di sini
// Hint: To-Do sebaiknya memiliki id, text, dan status completed

// import { getStatusLabel } from "./utils";

// TODO: Buat interface untuk To-Do item

// TODO: Buat tipe untuk status To-Do (active/done)

// TODO: Buat tipe untuk fungsi-fungsi yang akan digunakan

export interface Todo {
  id: string;
  title: string;
  description: string;
  deadline?: string | null;
  completed: boolean;
  createdAt: string;
}

export type sortField = "id" | "title" | "deadline" | "completed";
