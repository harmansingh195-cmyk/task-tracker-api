package com.example.tasktracker.error;

import com.example.tasktracker.exception.TaskNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
    }

    private MockHttpServletRequest buildRequest(String uri) {
        MockHttpServletRequest req = new MockHttpServletRequest();
        req.setRequestURI(uri);
        return req;
    }

    @Test
    void taskNotFound_returns404WithNotFoundErrorCode() {
        MockHttpServletRequest req = buildRequest("/api/tasks/99");
        TaskNotFoundException ex = new TaskNotFoundException(99L);

        ResponseEntity<ApiError> response = handler.handleTaskNotFound(ex, req);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(404, response.getBody().getStatus());
        assertEquals("NOT_FOUND", response.getBody().getErrorCode());
        assertEquals("Task not found: 99", response.getBody().getMessage());
        assertEquals("/api/tasks/99", response.getBody().getPath());
        assertNull(response.getBody().getCorrelationId());
        assertNotNull(response.getBody().getTimestamp());
    }

    @Test
    void taskNotFound_echoesCorrelationIdHeader() {
        MockHttpServletRequest req = buildRequest("/api/tasks/99");
        req.addHeader("X-Correlation-Id", "test-corr-123");
        TaskNotFoundException ex = new TaskNotFoundException(99L);

        ResponseEntity<ApiError> response = handler.handleTaskNotFound(ex, req);

        assertEquals("test-corr-123", response.getBody().getCorrelationId());
    }

    @Test
    void illegalArgument_returns400WithValidationErrorCode() {
        MockHttpServletRequest req = buildRequest("/api/tasks");
        IllegalArgumentException ex = new IllegalArgumentException("title is required");

        ResponseEntity<ApiError> response = handler.handleIllegalArgument(ex, req);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(400, response.getBody().getStatus());
        assertEquals("VALIDATION_ERROR", response.getBody().getErrorCode());
        assertEquals("title is required", response.getBody().getMessage());
        assertEquals("/api/tasks", response.getBody().getPath());
        assertNotNull(response.getBody().getTimestamp());
    }

    @Test
    void httpMessageNotReadable_returns400WithMalformedJsonErrorCode() {
        MockHttpServletRequest req = buildRequest("/api/tasks");
        HttpMessageNotReadableException ex = new HttpMessageNotReadableException("bad json");

        ResponseEntity<ApiError> response = handler.handleNotReadable(ex, req);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(400, response.getBody().getStatus());
        assertEquals("MALFORMED_JSON", response.getBody().getErrorCode());
        assertEquals("Malformed JSON request", response.getBody().getMessage());
        assertEquals("/api/tasks", response.getBody().getPath());
    }

    @Test
    void genericException_returns500WithInternalErrorCode() {
        MockHttpServletRequest req = buildRequest("/api/tasks");
        RuntimeException ex = new RuntimeException("something unexpected");

        ResponseEntity<ApiError> response = handler.handleGeneral(ex, req);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(500, response.getBody().getStatus());
        assertEquals("INTERNAL_ERROR", response.getBody().getErrorCode());
        assertEquals("Internal server error", response.getBody().getMessage());
        assertEquals("/api/tasks", response.getBody().getPath());
    }
}
