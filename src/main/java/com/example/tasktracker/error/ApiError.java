package com.example.tasktracker.error;

import java.time.Instant;

public class ApiError {

    private final Instant timestamp;
    private final int status;
    private final String errorCode;
    private final String message;
    private final String path;
    private final String correlationId;

    public ApiError(int status, ErrorCode errorCode, String message, String path, String correlationId) {
        this.timestamp = Instant.now();
        this.status = status;
        this.errorCode = errorCode.name();
        this.message = message;
        this.path = path;
        this.correlationId = correlationId;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public int getStatus() {
        return status;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public String getMessage() {
        return message;
    }

    public String getPath() {
        return path;
    }

    public String getCorrelationId() {
        return correlationId;
    }
}
