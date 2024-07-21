import { Task } from "../models/task.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

const addTask = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    throw new ApiError(400, "Title is required");
  }

  if (!description) {
    throw new ApiError(400, "Description is required");
  }

  const createdTask = await Task.create({
    title,
    description,
    createdBy: req.user?._id,
  });

  if (!createdTask) {
    throw new ApiError(400, "Error while creating the task");
  }

  res
    .status(200)
    .json(new ApiResponse(201, createdTask, "Task is created successfully"));
});

const getTasks = asyncHandler(async (req, res) => {
  const { sortBy } = req.query;
  const sortOptions = {};

  if (sortBy) {
    const sortByArray = sortBy.split(",");
    sortByArray.forEach((sortParam) => {
      const [field, order] = sortParam.split("_");
      if (field === "name") {
        sortOptions["title"] = order === "desc" ? -1 : 1;
      } else if (field === "date") {
        sortOptions["createdAt"] = order === "desc" ? -1 : 1;
      }
    });
  }

  const tasks = await Task.find({
    createdBy: req.user?._id,
  }).sort(sortOptions);

  if (!tasks) {
    throw new ApiError(404, "No tasks are found for this user");
  }

  res
    .status(200)
    .json(new ApiResponse(200, tasks, "Tasks are fetched successfully"));
});

const getTaskById = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "No tasks exist.");
  }

  res
    .status(200)
    .json(new ApiResponse(200, task, "Task is fetched successfully"));
});

const deleteTaskById = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const isDeleted = await Task.findOneAndDelete({
    _id: taskId,
    createdBy: req.user?._id,
  });

  if (!isDeleted) {
    throw new ApiError(404, "Error while deleting the task");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isDeleted: true },
        "The task is deleted successfully"
      )
    );
});

const updateTaskStatus = asyncHandler(async (req, res) => {
  const { updatedStatus, taskId } = req.body;

  console.log(updatedStatus, taskId);

  if (!updatedStatus) {
    throw new ApiError(400, "Updated status is required");
  }
  if (!taskId) {
    throw new ApiError(400, "Task ID is required");
  }

  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "No task found");
  }

  const updatedTask = await Task.findByIdAndUpdate(taskId, {
    status: updatedStatus,
  });

  if (!updatedTask) {
    throw new ApiError(400, "Task status is not updated successfully");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedTask, "Task status is updated successfully")
    );
});

const updateTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { title, description } = req.body;

  if (!taskId) {
    throw new ApiError(400, "Task id is not provided");
  }
  if (!title && !description) {
    throw new ApiError(400, "Title or description is required");
  }

  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(400, "The task is not present");
  }

  if (title) task.title = title;
  if (description) task.description = description;

  await task.save();

  res
    .status(200)
    .json(new ApiResponse(200, task, "The task is updated successfully"));
});

export {
  addTask,
  getTasks,
  getTaskById,
  deleteTaskById,
  updateTaskStatus,
  updateTask,
};
