package com.example.tasktracker;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class TaskControllerIT {

  @Autowired
  private MockMvc mockMvc;

  @Test
  void contextLoads() { }

  @Test
  void getUnknownTaskReturns404ProblemDetails() throws Exception {
    mockMvc.perform(get("/api/tasks/999999"))
        .andExpect(status().isNotFound())
        .andExpect(header().string("Content-Type", containsString("application/problem+json")))
        .andExpect(jsonPath("$.status").value(404))
        .andExpect(jsonPath("$.title").value("Task not found"))
        .andExpect(jsonPath("$.detail").value("Task not found: 999999"))
        .andExpect(jsonPath("$.taskId").value(999999));
  }

  @Test
  void createTaskWithoutTitleReturns400ProblemDetails() throws Exception {
    mockMvc.perform(post("/api/tasks")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"description\":\"No title\"}"))
        .andExpect(status().isBadRequest())
        .andExpect(header().string("Content-Type", containsString("application/problem+json")))
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.title").value("Validation failed"))
        .andExpect(jsonPath("$.errors.title").isArray())
        .andExpect(jsonPath("$.errors.title", hasSize(greaterThan(0))));
  }

  @Test
  void createTaskWithBlankTitleReturns400ProblemDetails() throws Exception {
    mockMvc.perform(post("/api/tasks")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"title\":\"   \"}"))
        .andExpect(status().isBadRequest())
        .andExpect(header().string("Content-Type", containsString("application/problem+json")))
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.title").value("Validation failed"))
        .andExpect(jsonPath("$.errors.title").isArray())
        .andExpect(jsonPath("$.errors.title[0]").value("title must not be blank"));
  }

  @Test
  void createTaskSuccessfully() throws Exception {
    mockMvc.perform(post("/api/tasks")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"title\":\"Test Task\",\"description\":\"A test\",\"status\":\"TODO\"}"))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").isNumber())
        .andExpect(jsonPath("$.title").value("Test Task"));
  }
}
