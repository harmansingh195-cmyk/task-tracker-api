Feature: RFC7807 Problem Details error responses for Tasks API

  As a client of Task Tracker API
  I want standardized error responses using RFC 7807 Problem Details
  So that I can reliably handle errors across endpoints

  Background:
    Given the Task Tracker API is running

  # AC1
  Scenario: Get task by non-existent id returns 404 Problem Details
    When I GET "/api/tasks/999999999"
    Then the response status should be 404
    And the response should be Problem Details
    And the Problem Details field "status" should be 404
    And the Problem Details field "detail" should contain "not"

  # AC2
  Scenario: Create task without title returns 400 validation Problem Details
    When I POST "/api/tasks" with json:
      """
      {"description":"missing title","status":"TODO"}
      """
    Then the response status should be 400
    And the response should be Problem Details
    And the Problem Details field "status" should be 400
    And the Problem Details should mention validation for field "title"

  # AC3
  Scenario: Create task with malformed JSON returns 400 Problem Details
    When I POST "/api/tasks" with raw body "{" and content type "application/json"
    Then the response status should be 400
    And the response should be Problem Details
    And the Problem Details field "status" should be 400
    And the Problem Details field "detail" should contain "JSON"

  # AC4
  Scenario: Unhandled exception returns 500 Problem Details without leaking internals
    When I GET "/api/tasks/trigger-500"
    Then the response status should be 500
    And the response should be Problem Details
    And the Problem Details field "status" should be 500
    And the response body should not leak internal implementation details

  # Extra (non-duplicative): contract shape / content-type
  Scenario: Problem Details responses use application/problem+json content type
    When I GET "/api/tasks/999999998"
    Then the response status should be 404
    And the response content type should include "application/problem+json"
