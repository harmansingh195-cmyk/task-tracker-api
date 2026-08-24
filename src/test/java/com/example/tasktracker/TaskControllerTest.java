package com.example.tasktracker;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
class TaskControllerTest {

  @Autowired
  MockMvc mvc;

  @Test
  void contextLoads() { }

  // -----------------------------------------------------------------------
  // Happy-path
  // -----------------------------------------------------------------------

  @Test
  void createTask_returns201() throws Exception {
    mvc.perform(post("/api/tasks")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"title\":\"Test task\"}"))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").isNotEmpty())
        .andExpect(jsonPath("$.title").value("Test task"));
  }

  @Test
  void getTask_returns200() throws Exception {
    String response = mvc.perform(post("/api/tasks")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"title\":\"Fetch me\"}"))
        .andExpect(status().isCreated())
        .andReturn().getResponse().getContentAsString();

    // Extract id from response
    long id = com.fasterxml.jackson.databind.json.JsonMapper.builder().build()
        .readTree(response).get("id").asLong();

    mvc.perform(get("/api/tasks/" + id))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.title").value("Fetch me"));
  }

  @Test
  void listTasks_returnsArray() throws Exception {
    mvc.perform(get("/api/tasks"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$").isArray());
  }

  // -----------------------------------------------------------------------
  // Error contract — ProblemDetails (RFC 7807)
  // -----------------------------------------------------------------------

  @Test
  void getTask_nonExistentId_returns404ProblemDetails() throws Exception {
    mvc.perform(get("/api/tasks/99999"))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.type").value("https://example.com/problems/task-not-found"))
        .andExpect(jsonPath("$.title").value("Task not found"))
        .andExpect(jsonPath("$.status").value(404))
        .andExpect(jsonPath("$.detail").value("Task not found: 99999"))
        .andExpect(jsonPath("$.instance").value("/api/tasks/99999"));
  }

  @Test
  void createTask_blankTitle_returns400ProblemDetails() throws Exception {
    mvc.perform(post("/api/tasks")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"title\":\"\"}"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.type").value("https://example.com/problems/validation-error"))
        .andExpect(jsonPath("$.title").value("Invalid request"))
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.detail").value("title is required"))
        .andExpect(jsonPath("$.instance").value("/api/tasks"))
        .andExpect(jsonPath("$.invalidParams[0].name").value("title"));
  }

  @Test
  void createTask_missingTitle_returns400ProblemDetails() throws Exception {
    mvc.perform(post("/api/tasks")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"description\":\"no title here\"}"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.type").value("https://example.com/problems/validation-error"))
        .andExpect(jsonPath("$.title").value("Invalid request"))
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.instance").value("/api/tasks"));
  }

  @Test
  void getTask_nonNumericId_returns400ProblemDetails() throws Exception {
    mvc.perform(get("/api/tasks/abc"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.type").value("https://example.com/problems/type-mismatch"))
        .andExpect(jsonPath("$.title").value("Bad request"))
        .andExpect(jsonPath("$.status").value(400))
        .andExpect(jsonPath("$.detail").value("Parameter 'id' must be a number"))
        .andExpect(jsonPath("$.instance").value("/api/tasks/abc"));
  }

  @Test
  void updateTask_nonExistentId_returns404ProblemDetails() throws Exception {
    mvc.perform(put("/api/tasks/99999")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"title\":\"Updated\"}"))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.type").value("https://example.com/problems/task-not-found"))
        .andExpect(jsonPath("$.title").value("Task not found"))
        .andExpect(jsonPath("$.status").value(404));
  }

  @Test
  void deleteTask_nonExistentId_returns404ProblemDetails() throws Exception {
    mvc.perform(delete("/api/tasks/99999"))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.type").value("https://example.com/problems/task-not-found"))
        .andExpect(jsonPath("$.title").value("Task not found"))
        .andExpect(jsonPath("$.status").value(404));
  }

  @Test
  void errorResponse_doesNotContainStackTrace() throws Exception {
    String body = mvc.perform(get("/api/tasks/99999"))
        .andExpect(status().isNotFound())
        .andReturn().getResponse().getContentAsString();

    // Verify no stack trace or internal exception details are present
    assert !body.contains("at com.") : "Response must not contain stack trace";
    assert !body.contains("Exception") || !body.contains("at ") : "Response must not contain exception details";
  }
}
