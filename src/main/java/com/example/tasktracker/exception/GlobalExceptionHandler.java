package com.example.tasktracker.exception;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.net.URI;

/**
 * Global exception handler using RFC 7807 Problem Details for all error responses.
 *
 * Covers all four acceptance criteria:
 *   AC1 - 404 Not Found      → TaskNotFoundException
 *   AC2 - 400 Validation     → IllegalArgumentException
 *   AC3 - 400 Malformed JSON → HttpMessageNotReadableException (overridden)
 *   AC4 - 500 Unhandled      → Exception (no internal detail leak)
 */
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    // ---------------------------------------------------------------
    // AC1: Task not found → 404
    // ---------------------------------------------------------------
    @ExceptionHandler(TaskNotFoundException.class)
    ResponseEntity<ProblemDetail> handleNotFound(TaskNotFoundException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        pd.setTitle("Task Not Found");
        pd.setType(URI.create("https://problems.task-tracker-api.example.com/task-not-found"));
        return problemResponse(HttpStatus.NOT_FOUND, pd);
    }

    // ---------------------------------------------------------------
    // AC2: Validation failure (manual guard in controller) → 400
    // ---------------------------------------------------------------
    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<ProblemDetail> handleValidation(IllegalArgumentException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
        pd.setTitle("Validation Error");
        pd.setType(URI.create("https://problems.task-tracker-api.example.com/validation-error"));
        return problemResponse(HttpStatus.BAD_REQUEST, pd);
    }

    // ---------------------------------------------------------------
    // AC3: Malformed JSON / unreadable body → 400
    // ---------------------------------------------------------------
    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST, "Malformed or unreadable JSON request body.");
        pd.setTitle("Bad Request");
        pd.setType(URI.create("https://problems.task-tracker-api.example.com/bad-request"));
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_PROBLEM_JSON_VALUE)
                .body(pd);
    }

    // ---------------------------------------------------------------
    // AC4: Catch-all — 500 without leaking internal details
    // ---------------------------------------------------------------
    @ExceptionHandler(Exception.class)
    ResponseEntity<ProblemDetail> handleUnhandled(Exception ex) {
        // Intentionally suppress ex.getMessage() to avoid leaking internals
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(
                HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred.");
        pd.setTitle("Internal Server Error");
        pd.setType(URI.create("https://problems.task-tracker-api.example.com/internal-error"));
        return problemResponse(HttpStatus.INTERNAL_SERVER_ERROR, pd);
    }

    // ---------------------------------------------------------------
    // Shared helper — ensures Content-Type: application/problem+json
    // ---------------------------------------------------------------
    private static ResponseEntity<ProblemDetail> problemResponse(HttpStatus status, ProblemDetail pd) {
        return ResponseEntity
                .status(status)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_PROBLEM_JSON_VALUE)
                .body(pd);
    }
}
