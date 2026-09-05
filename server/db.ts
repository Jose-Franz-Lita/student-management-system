import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { attendance, Attendance, grades, Grade, InsertStudent, students, Student, InsertUser, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function listStudents(): Promise<Student[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(students).orderBy(desc(students.createdAt));
}

export async function createStudent(data: InsertStudent) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(students).values(data);
  const result = await db.select().from(students).where(eq(students.studentNumber, data.studentNumber)).limit(1);
  return result[0] ?? null;
}

export async function updateStudent(id: number, data: Partial<InsertStudent>) {
  const db = await getDb();
  if (!db) return null;
  await db.update(students).set(data).where(eq(students.id, id));
  const result = await db.select().from(students).where(eq(students.id, id)).limit(1);
  return result[0] ?? null;
}

export async function deleteStudent(id: number) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(students).where(eq(students.id, id));
  return true;
}

export async function listAttendance(): Promise<Attendance[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(attendance).orderBy(desc(attendance.createdAt));
}

export async function listGrades(): Promise<Grade[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(grades).orderBy(desc(grades.createdAt));
}
