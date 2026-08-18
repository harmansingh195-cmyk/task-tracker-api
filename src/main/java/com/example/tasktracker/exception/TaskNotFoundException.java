package com.example.tasktracker.exception;

public class TaskNotFoundException extends RuntimeException {

    public TaskNotFoundException(long id) {
        super("Task not found: " + id);
    }
}
