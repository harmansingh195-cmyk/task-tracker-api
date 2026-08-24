package com.example.tasktracker.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

  private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  /** 404 — task resource not found */
  @ExceptionHandler(TaskNotFoundException.class)
  public ProblemDetail handleTaskNotFound(TaskNotFoundException ex, HttpServletRequest request) {
    ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
    problem.setType(URI.create("https://example.com/problems/task-not-found"));
    problem.setTitle("Task not found");
    problem.setInstance(URI.create(request.getRequestURI()));
    return problem;
  }

  /** 400 — blank / missing title (manual validation) or other illegal argument */
  @ExceptionHandler(IllegalArgumentException.class)
  public ProblemDetail handleIllegalArgument(IllegalArgumentException ex, HttpServletRequest request) {
    ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
    problem.setType(URI.create("https://example.com/problems/validation-error"));
    problem.setTitle("Invalid request");
    problem.setInstance(URI.create(request.getRequestURI()));
    problem.setProperty("invalidParams",
        List.of(Map.of("name", "title", "reason", "must not be blank")));
    return problem;
  }

  /** 400 — path variable type mismatch (e.g. /api/tasks/abc) */
  @ExceptionHandler(MethodArgumentTypeMismatchException.class)
  public ProblemDetail handleTypeMismatch(MethodArgumentTypeMismatchException ex,
      HttpServletRequest request) {
    String detail = "Parameter '" + ex.getName() + "' must be a number";
    ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, detail);
    problem.setType(URI.create("https://example.com/problems/type-mismatch"));
    problem.setTitle("Bad request");
    problem.setInstance(URI.create(request.getRequestURI()));
    return problem;
  }

  /** 500 — unhandled / unexpected errors; no internal details leaked to client */
  @ExceptionHandler(Exception.class)
  public ProblemDetail handleGeneric(Exception ex, HttpServletRequest request) {
    log.error("Unhandled exception for request {}: {}", request.getRequestURI(), ex.getMessage(), ex);
    ProblemDetail problem = ProblemDetail.forStatusAndDetail(
        HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred");
    problem.setType(URI.create("https://example.com/problems/internal-error"));
    problem.setTitle("Internal server error");
    problem.setInstance(URI.create(request.getRequestURI()));
    return problem;
  }
}
