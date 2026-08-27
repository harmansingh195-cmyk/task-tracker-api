package com.example.tasktracker;

import com.example.tasktracker.controller.TaskController;
import com.example.tasktracker.service.TaskService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.containsString;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Unit-level web tests for GlobalExceptionHandler.
 *
 * Acceptance Criteria covered:
 *   AC4 - 500 Unhandled Exception (no internal stack trace or detail leak)
 */
@WebMvcTest(TaskController.class)
class GlobalExceptionHandlerTest {

    @Autowired
    MockMvc mvc;

    @MockBean
    TaskService taskService;

    // ---------------------------------------------------------------
    // AC4: Unhandled exception → 500 Problem Detail, no internal leak
    // ---------------------------------------------------------------
    @Test
    void list_unhandledException_returns500WithoutInternalDetails() throws Exception {
        given(taskService.list())
                .willThrow(new RuntimeException(
                        "Sensitive DB error: NullPointerException at com.example.internal.DbConnector:42"));

        mvc.perform(get("/api/tasks"))
                .andExpect(status().isInternalServerError())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(500))
                .andExpect(jsonPath("$.title").value("Internal Server Error"))
                // Generic message — no internal class names or stack traces
                .andExpect(jsonPath("$.detail").value("An unexpected error occurred."))
                // Explicitly assert sensitive details are NOT leaked
                .andExpect(jsonPath("$.detail", not(containsString("NullPointerException"))))
                .andExpect(jsonPath("$.detail", not(containsString("DbConnector"))))
                .andExpect(jsonPath("$.detail", not(containsString("Sensitive"))));
    }

    // ---------------------------------------------------------------
    // AC1 variant: TaskNotFoundException via mock → 404
    // ---------------------------------------------------------------
    @Test
    void getTask_notFound_returns404ProblemDetail() throws Exception {
        given(taskService.get(42L))
                .willThrow(new com.example.tasktracker.exception.TaskNotFoundException(42L));

        mvc.perform(get("/api/tasks/42"))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.title").value("Task Not Found"))
                .andExpect(jsonPath("$.detail").value("Task not found: 42"));
    }
}
