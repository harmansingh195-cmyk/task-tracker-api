package com.example.tasktracker;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests validating RFC 7807 Problem Details error contract.
 *
 * Acceptance Criteria covered:
 *   AC1 - 404 Not Found
 *   AC2 - 400 Validation Error (missing title)
 *   AC3 - 400 Malformed JSON
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
class TaskControllerIT {

    @Autowired
    MockMvc mvc;

    @Test
    void contextLoads() {
    }

    // ---------------------------------------------------------------
    // AC1: GET /api/tasks/{id} with non-existent ID → 404 Problem Detail
    // ---------------------------------------------------------------
    @Test
    void get_nonExistentTask_returns404ProblemDetail() throws Exception {
        mvc.perform(get("/api/tasks/99999"))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.title").value("Task Not Found"))
                .andExpect(jsonPath("$.detail").value("Task not found: 99999"));
    }

    // ---------------------------------------------------------------
    // AC2: POST /api/tasks with missing title → 400 Problem Detail
    // ---------------------------------------------------------------
    @Test
    void createTask_missingTitle_returns400ProblemDetail() throws Exception {
        mvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"description\":\"no title here\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.title").value("Validation Error"))
                .andExpect(jsonPath("$.detail").value("title is required"));
    }

    // ---------------------------------------------------------------
    // AC3: POST /api/tasks with invalid JSON → 400 Problem Detail
    // ---------------------------------------------------------------
    @Test
    void createTask_malformedJson_returns400ProblemDetail() throws Exception {
        mvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{not valid json at all"))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.title").value("Bad Request"))
                .andExpect(jsonPath("$.detail").value("Malformed or unreadable JSON request body."));
    }

    // ---------------------------------------------------------------
    // Positive path: valid task creation
    // ---------------------------------------------------------------
    @Test
    void createTask_validPayload_returns201() throws Exception {
        mvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Write tests\",\"description\":\"RFC 7807 coverage\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.title").value("Write tests"))
                .andExpect(jsonPath("$.status").value("TODO"));
    }

    // ---------------------------------------------------------------
    // PUT/DELETE on non-existent ID should also return 404
    // ---------------------------------------------------------------
    @Test
    void update_nonExistentTask_returns404ProblemDetail() throws Exception {
        mvc.perform(put("/api/tasks/99998")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Updated\"}"))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    void delete_nonExistentTask_returns404ProblemDetail() throws Exception {
        mvc.perform(delete("/api/tasks/99997"))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(404));
    }
}
