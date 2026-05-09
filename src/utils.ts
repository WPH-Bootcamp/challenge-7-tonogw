// TODO: Implementasikan type guards di sini
// Hint: Type guard berguna untuk memastikan tipe data saat runtime

// TODO: Buat fungsi untuk memvalidasi apakah suatu objek adalah To-Do yang valid

// TODO: Buat fungsi helper untuk menampilkan tanggal/waktu dengan format yang bagus

// TODO: Buat fungsi untuk memastikan input dari user adalah string yang valid

// import { ftruncateSync } from "fs";
import { Todo, TodoStatus } from "./types.js";

export function isTodo(value: unknown): value is Todo {
  if (typeof value !== "object") {
    return false;
  }

  if (value === null) {
    return false;
  }

  const todo = value as Todo;

  return (
    typeof todo.id === "string" &&
    typeof todo.title === "string" &&
    typeof todo.description === "string" &&
    typeof todo.completed === "boolean"
  );
}

// export function isTodoArray(value: unknown): value is Todo[] {
//   return Array.isArray(value) && value.every(isTodo);
// }

export function isTodoArray(value: unknown): value is Todo[] {
  return Array.isArray(value) && value.every(isTodo);
}

let sequence = 0;
let lastDayKey = "";

function getDayKey(date: Date): string {
  const year = date.getFullYear().toString().slice(-2);

  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86400000)
    .toString()
    .padStart(3, "0");

  return `${year} ${dayOfYear}`;
}

export function generateUniqueId(): string {
  const now = new Date();
  const dayKey = getDayKey(now);

  // RESET DAILY: IF NEXT DAY THEN RESET SEQUENCE NUMBER
  if (dayKey !== lastDayKey) {
    sequence = 0;
    lastDayKey = dayKey;
  }

  // MODULO FOR SEQ NUMB RECYLING AFTER 99 THEN RESTART 01
  sequence = (sequence + 1) % 100;

  const seq = sequence.toString().padStart(2, "0");
  return `${dayKey}${seq}`;
}

// TASK OVERDUE
export function isOverdue(todo: Todo): boolean {
  if (!todo.deadline) return false;

  return !todo.completed && new Date(todo.deadline) < new Date();
}

export function getStatusLabel(todo: Todo): string {
  if (isOverdue(todo)) return "OVERDUE";
  if (todo.completed) return "DONE";
  return "ACTIVE";
}
