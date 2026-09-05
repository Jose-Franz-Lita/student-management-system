import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createStudent, deleteStudent, listAttendance, listGrades, listStudents, updateStudent } from "./db";

const studentInput = z.object({
  studentNumber: z.string().min(2).max(32),
  name: z.string().min(2).max(160),
  email: z.string().email(),
  program: z.string().min(2).max(160),
  year: z.string().min(1).max(32),
  status: z.enum(["active", "on-leave", "inactive"]).default("active"),
  avatarColor: z.string().max(24).default("#2563eb"),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  students: router({
    list: publicProcedure.query(() => listStudents()),
    create: publicProcedure.input(studentInput).mutation(({ input }) => createStudent(input)),
    update: publicProcedure.input(z.object({ id: z.number().int(), data: studentInput.partial() })).mutation(({ input }) => updateStudent(input.id, input.data)),
    remove: publicProcedure.input(z.object({ id: z.number().int() })).mutation(({ input }) => deleteStudent(input.id)),
  }),
  attendance: router({
    list: publicProcedure.query(() => listAttendance()),
  }),
  grades: router({
    list: publicProcedure.query(() => listGrades()),
  }),
});

export type AppRouter = typeof appRouter;
