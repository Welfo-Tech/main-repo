import { Hono } from "hono";
import { validate } from "../../../lib/validate.js";
import { requireAuth } from "../../../middleware/auth.js";
import { requireRole } from "../../../middleware/require-role.js";
import * as userService from "../../../services/user.service.js";
import { CreateUserSchema, ListUsersQuerySchema, UpdateUserSchema } from "./schema.js";

export const usersRouter = new Hono();

usersRouter.use(requireAuth);
usersRouter.use(requireRole("ADMIN"));

usersRouter.get(
  "/",
  validate("query", ListUsersQuerySchema),
  async (c) => {
    const query = c.req.valid("query");
    const users = await userService.listUsers(query, c.get("user"));
    return c.json(users, 200);
  },
);

usersRouter.get("/:id", async (c) => {
  const user = await userService.getUser(c.req.param("id")!, c.get("user"));
  return c.json(user, 200);
});

usersRouter.post(
  "/",
  validate("json", CreateUserSchema),
  async (c) => {
    const data = c.req.valid("json");
    const user = await userService.createStaffUser(data, c.get("user"));
    return c.json(user, 201);
  },
);

usersRouter.patch(
  "/:id",
  validate("json", UpdateUserSchema),
  async (c) => {
    const data = c.req.valid("json");
    const user = await userService.editUser(c.req.param("id")!, data, c.get("user"));
    return c.json(user, 200);
  },
);
