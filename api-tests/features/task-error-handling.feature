Feature: Global Exception Handling - Standardized API Error Contract
  As an API consumer
  I want to receive standardized error responses for all error conditions
  So that I can handle errors predictably regardless of which endpoint is called

  Background:
    Given the Task Tracker API is running

  # ── NOT_FOUND scenarios ────────────────────────────────────────────────────

  Scenario: GET non-existent task returns 404 with NOT_FOUND error code
    When I request task with id 99999
    Then the response status should be 404
    And the error body status should be 404
    And the error body errorCode should be "NOT_FOUND"
    And the error body message should be "Task not found: 99999"
    And the error body path should be "/api/tasks/99999"
    And the error body should have a valid timestamp

  Scenario: PUT non-existent task returns 404 with NOT_FOUND error code
    When I update task with id 99999 with title "Ghost task"
    Then the response status should be 404
    And the error body status should be 404
    And the error body errorCode should be "NOT_FOUND"
    And the error body path should be "/api/tasks/99999"
    And the error body should have a valid timestamp

  Scenario: DELETE non-existent task returns 404 with NOT_FOUND error code
    When I delete task with id 99999
    Then the response status should be 404
    And the error body status should be 404
    And the error body errorCode should be "NOT_FOUND"
    And the error body path should be "/api/tasks/99999"
    And the error body should have a valid timestamp

  # ── VALIDATION_ERROR scenarios ─────────────────────────────────────────────

  Scenario: POST task without title returns 400 with VALIDATION_ERROR
    When I create a task without a title
    Then the response status should be 400
    And the error body status should be 400
    And the error body errorCode should be "VALIDATION_ERROR"
    And the error body message should be "title is required"
    And the error body path should be "/api/tasks"
    And the error body should have a valid timestamp

  Scenario: POST task with blank title returns 400 with VALIDATION_ERROR
    When I create a task with title "   "
    Then the response status should be 400
    And the error body errorCode should be "VALIDATION_ERROR"
    And the error body message should be "title is required"

  Scenario: POST task with empty string title returns 400 with VALIDATION_ERROR
    When I create a task with title ""
    Then the response status should be 400
    And the error body errorCode should be "VALIDATION_ERROR"

  # ── MALFORMED_JSON scenarios ───────────────────────────────────────────────

  Scenario: POST with malformed JSON body returns 400 with MALFORMED_JSON
    When I send malformed JSON to the create task endpoint
    Then the response status should be 400
    And the error body status should be 400
    And the error body errorCode should be "MALFORMED_JSON"
    And the error body message should be "Malformed JSON request"
    And the error body path should be "/api/tasks"
    And the error body should have a valid timestamp

  # ── Correlation-ID propagation ─────────────────────────────────────────────

  Scenario: Error response echoes the X-Correlation-Id request header
    Given I set request header "X-Correlation-Id" to "corr-abc-xyz-999"
    When I request task with id 99999
    Then the response status should be 404
    And the error body correlationId should be "corr-abc-xyz-999"

  Scenario: Error response has null correlationId when header is absent
    When I request task with id 99999
    Then the response status should be 404
    And the error body correlationId should be null

  Scenario: Correlation ID is echoed on PUT 404 responses
    Given I set request header "X-Correlation-Id" to "put-corr-id-42"
    When I update task with id 99999 with title "No task"
    Then the response status should be 404
    And the error body correlationId should be "put-corr-id-42"

  # ── Error contract completeness ────────────────────────────────────────────

  Scenario: 404 error response contains all required contract fields
    When I request task with id 99999
    Then the response status should be 404
    And the error body should have field "status"
    And the error body should have field "errorCode"
    And the error body should have field "message"
    And the error body should have field "path"
    And the error body should have field "timestamp"
    And the error body should have field "correlationId"

  Scenario: 400 VALIDATION_ERROR response contains all required contract fields
    When I create a task without a title
    Then the response status should be 400
    And the error body should have field "status"
    And the error body should have field "errorCode"
    And the error body should have field "message"
    And the error body should have field "path"
    And the error body should have field "timestamp"

  # ── Boundary ID tests ──────────────────────────────────────────────────────

  Scenario: GET with boundary ID zero returns 404 with NOT_FOUND
    When I request task with id 0
    Then the response status should be 404
    And the error body errorCode should be "NOT_FOUND"

  Scenario: GET with large boundary ID returns 404 with NOT_FOUND
    When I request task with id 2147483647
    Then the response status should be 404
    And the error body errorCode should be "NOT_FOUND"
