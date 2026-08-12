package com.example.tasktracker.service;

import com.example.tasktracker.model.Task;
import com.example.tasktracker.repo.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {
  private final TaskRepository repo;

  public TaskService(TaskRepository repo) {
    this.repo = repo;
  }

  public List<Task> list() { return repo.findAll(); }

  public Task get(long id) {
    return repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Task not found: " + id));
  }

  public Task create(Task task) {
    task.setStatus(task.getStatus() == null ? Task.Status.TODO : task.getStatus());
    return repo.save(task);
  }

  public Task update(long id, Task patch) {
    Task existing = get(id);
    if (patch.getTitle() != null) existing.setTitle(patch.getTitle());
    if (patch.getDescription() != null) existing.setDescription(patch.getDescription());
    if (patch.getStatus() != null) existing.setStatus(patch.getStatus());
    return repo.save(existing);
  }

  public void delete(long id) {
    repo.delete(get(id));
  }
}