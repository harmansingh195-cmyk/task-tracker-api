package com.example.tasktracker.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

  private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);
  private static final MediaType PROBLEM_JSON = MediaType.valueOf("application/problem+json");

  @ExceptionHandler(TaskNotFoundException.class)
  public ResponseEntity<Map<String, Object>> handleNotFound(
      TaskNotFoundException ex, HttpServletRequest req) {
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("type", "https://example.com/problems/task-not-found");
    body.put("title", "Task not found");
    body.put("status", 404);
    body.put("detail", ex.getMessage());
    body.put("instance", req.getRequestURI());
    body.put("taskId", ex.getTaskId());

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(PROBLEM_JSON);
    return new ResponseEntity<>(body, headers, HttpStatus.NOT_FOUND);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, Object>> handleValidation(
      MethodArgumentNotValidException ex, HttpServletRequest req) {
    Map<String, List<String>> errors = new LinkedHashMap<>();
    ex.getBindingResult().getFieldErrors().forEach(fe ->
        errors.computeIfAbsent(fe.getField(), k -> new ArrayList<>()).add(fe.getDefaultMessage())
    );

    Map<String, Object> body = new LinkedHashMap<>();
    body.put("type", "https://example.com/problems/validation-error");
    body.put("title", "Validation failed");
    body.put("status", 400);
    body.put("detail", "Request validation failed");
    body.put("instance", req.getRequestURI());
    body.put("errors", errors);

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(PROBLEM_JSON);
    return new ResponseEntity<>(body, headers, HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<Map<String, Object>> handleUnexpected(
      Exception ex, HttpServletRequest req) {
    // Log internally but do not expose internal details in response
    log.error("Unexpected error processing request {}", req.getRequestURI(), ex);

    Map<String, Object> body = new LinkedHashMap<>();
    body.put("type", "https://example.com/problems/internal-server-error");
    body.put("title", "Internal Server Error");
    body.put("status", 500);
    body.put("detail", "An unexpected error occurred");
    body.put("instance", req.getRequestURI());

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(PROBLEM_JSON);
    return new ResponseEntity<>(body, headers, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
