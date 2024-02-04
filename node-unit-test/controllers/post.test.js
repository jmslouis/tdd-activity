import { addPost } from "./postController";
import { jest } from "@jest/globals";
import 'regenerator-runtime/runtime'

describe("make sure addPost is running", () => {
    it("should return 200", async () => {
      expect(addPost.statusCode).toBe(200);
    });
  });

  