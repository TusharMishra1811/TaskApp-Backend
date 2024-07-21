import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
  addTask,
  deleteTaskById,
  getTaskById,
  getTasks,
  updateTask,
  updateTaskStatus,
} from "../controllers/task.controllers.js";

const router = Router();

router.route("/add-task").post(verifyJwt, addTask);
router.route("/get-tasks").get(verifyJwt, getTasks);
router.route("/get-task-by-Id/:taskId").get(verifyJwt, getTaskById);
router.route("/delete-task/:taskId").delete(verifyJwt, deleteTaskById);
router.route("/update-task-status").put(verifyJwt, updateTaskStatus);
router.route("/update-task/:taskId").put(verifyJwt, updateTask);

export default router;
