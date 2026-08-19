Feature: Task CRUD Operations
  As an API consumer
  I want to create, read, update and delete tasks
  So that I can manage work items in the tracker

  Background:
    Given the Task Tracker API is running

  # ── CREATE ─────────────────────────────────────────────────────────────────

  Scenario: Create task with title and description returns 201
    When I create a task with title "Write BDD tests" and description "Gherkin scenarios"
    Then the response status should be 201
    And the task body should have title "Write BDD tests"
    And the task body should have status "TODO"
    And the task body should have an id

  Scenario: Create task with only title returns 201 with default TODO status
    When I create a task with title "Minimal task"
    Then the response status should be 201
    And the task body should have status "TODO"
    And the task body should have an id

  Scenario: Create task with explicit IN_PROGRESS status returns 201
    When I create a task with title "Active task" and status "IN_PROGRESS"
    Then the response status should be 201
    And the task body should have status "IN_PROGRESS"

  Scenario: Create task with explicit DONE status returns 201
    When I create a task with title "Finished task" and status "DONE"
    Then the response status should be 201
    And the task body should have status "DONE"

  # ── LIST ───────────────────────────────────────────────────────────────────

  Scenario: List all tasks returns 200 with an array
    When I list all tasks
    Then the response status should be 200
    And the response body should be an array

  Scenario: List tasks includes a previously created task
    Given I have created a task with title "Listed task"
    When I list all tasks
    Then the response status should be 200
    And the response body should be an array

  # ── READ ───────────────────────────────────────────────────────────────────

  Scenario: Get an existing task by id returns 200 with task details
    Given I have created a task with title "Fetch this task"
    When I fetch the created task
    Then the response status should be 200
    And the task body should have title "Fetch this task"

  Scenario: Get an existing task by id returns createdAt field
    Given I have created a task with title "Timestamps task"
    When I fetch the created task
    Then the response status should be 200
    And the task body should have field "createdAt"

  # ── UPDATE ─────────────────────────────────────────────────────────────────

  Scenario: Update task title returns 200 with new title
    Given I have created a task with title "Original title"
    When I update the created task with title "Updated title"
    Then the response status should be 200
    And the task body should have title "Updated title"

  Scenario: Update task status to IN_PROGRESS returns 200
    Given I have created a task with title "Task to start"
    When I update the created task with status "IN_PROGRESS"
    Then the response status should be 200
    And the task body should have status "IN_PROGRESS"

  Scenario: Update task status to DONE returns 200
    Given I have created a task with title "Task to complete"
    When I update the created task with status "DONE"
    Then the response status should be 200
    And the task body should have status "DONE"

  # ── DELETE ─────────────────────────────────────────────────────────────────

  Scenario: Delete an existing task returns 204 with no body
    Given I have created a task with title "Disposable task"
    When I delete the created task
    Then the response status should be 204

  Scenario: Fetching a deleted task returns 404 NOT_FOUND
    Given I have created a task with title "Delete and verify"
    And I have deleted the created task
    When I fetch the created task
    Then the response status should be 404
    And the error body errorCode should be "NOT_FOUND"
