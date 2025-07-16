import { describe, it, expect } from "vitest";
import { auth, db, storage } from "@/config/firebase";
import { getApp, getApps } from "firebase/app";

describe("Firebase Initialization", () => {
  it("should initialize the Firebase app", () => {
    expect(getApps().length).toBeGreaterThan(0);
    expect(getApp().options.projectId).toBeDefined();
  });

  it("should initialize Auth service", () => {
    expect(auth).toBeDefined();
    expect(auth.app).toBeDefined();
  });

  it("should initialize Firestore service", () => {
    expect(db).toBeDefined();
    expect(db.app).toBeDefined();
  });

  it("should initialize Storage service", () => {
    expect(storage).toBeDefined();
    expect(storage.app).toBeDefined();
  });
});
