package com.example.tasktracker.exception;

public class TaskNotFoundException extends RuntimeException {

  private final long taskId;

  public TaskNotFoundException(long id) {
    super("Task not found: " + id);
    this.taskId = id;
  }

  public long getTaskId() {
    return taskId;
  }
}
