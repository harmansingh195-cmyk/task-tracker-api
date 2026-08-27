Feature: RFC7807 Problem Details error responses for Tasks API

  As a client of Task Tracker API
  I want standardized error responses using RFC 7807 Problem Details
  So that I can reliably handle errors across endpoints

  Background:
    Given the Task Tracker API is running

  # ---------------------------------------------------------------------------
  # AC1: 404 Not Found
  # GET /api/tasks/{id} with a non-existent ID → 404 Problem Details
  # ---------------------------------------------------------------------------
  Scenario: Get task by non-existent id returns 404 Problem Details
    When I GET "/api/tasks/999999999"
    Then the response status should be 404
    And the response should be Problem Details
    And the Problem Details field "status" should be 404
    And the Problem Details field "detail" should contain "not"

  # ---------------------------------------------------------------------------
  # AC2: 400 Validation - missing required field
  # POST /api/tasks without title → 400 Problem Details describing the field
  # ---------------------------------------------------------------------------
  Scenario: Create task without title returns 400 validation Problem Details
    When I POST "/api/tasks" with json:
      """
      {"description":"missing title field","status":"TODO"}
      """
    Then the response status should be 400
    And the response should be Problem Details
    And the Problem Details field "status" should be 400
    And the Problem Details should mention validation for field "title"

  # ---------------------------------------------------------------------------
  # AC3: 400 Malformed JSON
  # POST /api/tasks with an unparseable body → 400 Problem Details
  # ---------------------------------------------------------------------------
  Scenario: Create task with malformed JSON returns 400 Problem Details
    When I POST "/api/tasks" with raw body "{" and content type "application/json"
    Then the response status should be 400
    And the response should be Problem Details
    And the Problem Details field "status" should be 400
    And the Problem Details field "detail" should contain "JSON"

  # ---------------------------------------------------------------------------
  # AC4: 500 Unhandled — @skip
  # NOTE: There is no dedicated test endpoint to trigger an unhandled runtime
  # exception without modifying production code.  This scenario documents the
  # requirement and is exercised at unit-test level by:
  #   GlobalExceptionHandlerTest.list_unhandledException_returns500WithoutInternalDetails
  # Re-enable this scenario if a /api/test/trigger-error endpoint is added under
  # a "test" Spring profile.
  # ---------------------------------------------------------------------------
  @skip
  Scenario: Unhandled exception returns 500 Problem Details without leaking internals
    When I GET "/api/tasks/trigger-500"
    Then the response status should be 500
    And the response should be Problem Details
    And the Problem Details field "status" should be 500
    And the response body should not leak internal implementation details

  # ---------------------------------------------------------------------------
  # Extra: RFC7807 content-type compliance
  # All error responses must use application/problem+json (not application/json)
  # ---------------------------------------------------------------------------
  Scenario: Problem Details responses carry application/problem+json content type
    When I GET "/api/tasks/999999998"
    Then the response status should be 404
    And the response content type should include "application/problem+json"
