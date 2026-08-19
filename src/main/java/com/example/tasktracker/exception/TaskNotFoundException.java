package com.example.tasktracker.exception;

public class TaskNotFoundException extends RuntimeException {

    private final long taskId;

    public TaskNotFoundException(long taskId) {
        super("Task not found: " + taskId);
        this.taskId = taskId;
    }

    public long getTaskId() {
        return taskId;
    }
}
