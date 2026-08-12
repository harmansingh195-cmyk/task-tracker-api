package com.example.tasktracker.controller;

import com.example.tasktracker.model.Task;
import com.example.tasktracker.service.TaskService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

  private final TaskService service;

  public TaskController(TaskService service) {
    this.service = service;
  }

  @GetMapping
  public List<Task> list() {
    return service.list();
  }

  @GetMapping("/{id}")
  public Task get(@PathVariable long id) {
    return service.get(id);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public Task create(@RequestBody Task task) {
    if (task.getTitle() == null || task.getTitle().isBlank()) {
      throw new IllegalArgumentException("title is required");
    }
    return service.create(task);
  }

  @PutMapping("/{id}")
  public Task update(@PathVariable long id, @RequestBody Task patch) {
    return service.update(id, patch);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable long id) {
    service.delete(id);
  }
}