# Task Tracker API (Spring Boot + H2 + Maven) + Playwright API tests

# Project Overview (Capstone: AI-Assistant–Driven SDLC with HITL)
This repository contains a small Spring Boot REST application (Task Tracker API) used as the base application for the capstone project: AI-Assistant–Driven SDLC with Human-in-the-Loop (HITL) & Tooling.


# What this repo includes
Backend API (Java + Spring Boot + Maven):

CRUD endpoints for tasks (/api/tasks)

In-memory database using H2

# Automated tests (Playwright):

API tests using Playwright’s request client

HTML report generation (playwright-report/ after execution)

## Run API
mvn spring-boot:run

API: http://localhost:8080/api/tasks
H2 Console: http://localhost:8080/h2 (JDBC URL: jdbc:h2:mem:tasks)

## Build
mvn clean package

## Run Playwright tests
Terminal 1:
mvn spring-boot:run

Terminal 2:
cd api-tests
npm i
npx playwright install
npm test