package com.example.tasktracker.dto;

import com.example.tasktracker.model.Task;
import jakarta.validation.constraints.NotBlank;

public class CreateTaskRequest {

  @NotBlank(message = "title must not be blank")
  private String title;

  private String description;

  private Task.Status status;

  public String getTitle() { return title; }
  public void setTitle(String title) { this.title = title; }

  public String getDescription() { return description; }
  public void setDescription(String description) { this.description = description; }

  public Task.Status getStatus() { return status; }
  public void setStatus(Task.Status status) { this.status = status; }
}
