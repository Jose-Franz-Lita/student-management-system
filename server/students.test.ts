import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => undefined } as TrpcContext["res"],
  };
}

describe("student management procedures", () => {
  it("returns an empty list when the optional database is unavailable", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.students.list()).resolves.toEqual([]);
  });

  it("rejects incomplete student profiles", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.students.create({
      studentNumber: "S1",
      name: "A",
      email: "not-an-email",
      program: "",
      year: "Year 1",
      status: "active",
      avatarColor: "#2563eb",
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
