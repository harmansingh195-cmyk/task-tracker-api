package com.example.tasktracker.exception;

/**
 * Thrown when a Task with the requested ID does not exist.
 * Mapped to HTTP 404 via GlobalExceptionHandler (RFC7807 Problem Details).
 */
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
