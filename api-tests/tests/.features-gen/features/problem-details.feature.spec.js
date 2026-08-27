// Generated from: features\problem-details.feature
import { test } from "../../support/fixtures.ts";

test.describe('RFC7807 Problem Details error responses for Tasks API', () => {

  test.beforeEach('Background', async ({ Given, baseURL, request }, testInfo) => { if (testInfo.error) return;
    await Given('the Task Tracker API is running', null, { baseURL, request }); 
  });
  
  test('Get task by non-existent id returns 404 Problem Details', async ({ When, Then, And, api, ctx }) => { 
    await When('I GET "/api/tasks/999999999"', null, { api, ctx }); 
    await Then('the response status should be 404', null, { ctx }); 
    await And('the response should be Problem Details', null, { ctx }); 
    await And('the Problem Details field "status" should be 404', null, { ctx }); 
    await And('the Problem Details field "detail" should contain "not"', null, { ctx }); 
  });

  test('Create task without title returns 400 validation Problem Details', async ({ When, Then, And, api, ctx }) => { 
    await When('I POST "/api/tasks" with json:', {"docString":{"content":"{\"description\":\"missing title field\",\"status\":\"TODO\"}"}}, { api, ctx }); 
    await Then('the response status should be 400', null, { ctx }); 
    await And('the response should be Problem Details', null, { ctx }); 
    await And('the Problem Details field "status" should be 400', null, { ctx }); 
    await And('the Problem Details should mention validation for field "title"', null, { ctx }); 
  });

  test('Create task with malformed JSON returns 400 Problem Details', async ({ When, Then, And, api, ctx }) => { 
    await When('I POST "/api/tasks" with raw body "{" and content type "application/json"', null, { api, ctx }); 
    await Then('the response status should be 400', null, { ctx }); 
    await And('the response should be Problem Details', null, { ctx }); 
    await And('the Problem Details field "status" should be 400', null, { ctx }); 
    await And('the Problem Details field "detail" should contain "JSON"', null, { ctx }); 
  });

  test.skip('Unhandled exception returns 500 Problem Details without leaking internals', { tag: ['@skip'] }, async ({ When, Then, And }) => { 
    await When('I GET "/api/tasks/trigger-500"'); 
    await Then('the response status should be 500'); 
    await And('the response should be Problem Details'); 
    await And('the Problem Details field "status" should be 500'); 
    await And('the response body should not leak internal implementation details'); 
  });

  test('Problem Details responses carry application/problem+json content type', async ({ When, Then, And, api, ctx }) => { 
    await When('I GET "/api/tasks/999999998"', null, { api, ctx }); 
    await Then('the response status should be 404', null, { ctx }); 
    await And('the response content type should include "application/problem+json"', null, { ctx }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('features\\problem-details.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":10,"pickleLine":14,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"Given the Task Tracker API is running","isBg":true,"stepMatchArguments":[]},{"pwStepLine":11,"gherkinStepLine":15,"keywordType":"Action","textWithKeyword":"When I GET \"/api/tasks/999999999\"","stepMatchArguments":[{"group":{"start":6,"value":"\"/api/tasks/999999999\"","children":[{"start":7,"value":"/api/tasks/999999999","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":12,"gherkinStepLine":16,"keywordType":"Outcome","textWithKeyword":"Then the response status should be 404","stepMatchArguments":[{"group":{"start":30,"value":"404"},"parameterTypeName":"int"}]},{"pwStepLine":13,"gherkinStepLine":17,"keywordType":"Outcome","textWithKeyword":"And the response should be Problem Details","stepMatchArguments":[]},{"pwStepLine":14,"gherkinStepLine":18,"keywordType":"Outcome","textWithKeyword":"And the Problem Details field \"status\" should be 404","stepMatchArguments":[{"group":{"start":26,"value":"\"status\"","children":[{"start":27,"value":"status","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":45,"value":"404"},"parameterTypeName":"int"}]},{"pwStepLine":15,"gherkinStepLine":19,"keywordType":"Outcome","textWithKeyword":"And the Problem Details field \"detail\" should contain \"not\"","stepMatchArguments":[{"group":{"start":26,"value":"\"detail\"","children":[{"start":27,"value":"detail","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":50,"value":"\"not\"","children":[{"start":51,"value":"not","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":18,"pickleLine":25,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"Given the Task Tracker API is running","isBg":true,"stepMatchArguments":[]},{"pwStepLine":19,"gherkinStepLine":26,"keywordType":"Action","textWithKeyword":"When I POST \"/api/tasks\" with json:","stepMatchArguments":[{"group":{"start":7,"value":"\"/api/tasks\"","children":[{"start":8,"value":"/api/tasks","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":20,"gherkinStepLine":30,"keywordType":"Outcome","textWithKeyword":"Then the response status should be 400","stepMatchArguments":[{"group":{"start":30,"value":"400"},"parameterTypeName":"int"}]},{"pwStepLine":21,"gherkinStepLine":31,"keywordType":"Outcome","textWithKeyword":"And the response should be Problem Details","stepMatchArguments":[]},{"pwStepLine":22,"gherkinStepLine":32,"keywordType":"Outcome","textWithKeyword":"And the Problem Details field \"status\" should be 400","stepMatchArguments":[{"group":{"start":26,"value":"\"status\"","children":[{"start":27,"value":"status","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":45,"value":"400"},"parameterTypeName":"int"}]},{"pwStepLine":23,"gherkinStepLine":33,"keywordType":"Outcome","textWithKeyword":"And the Problem Details should mention validation for field \"title\"","stepMatchArguments":[{"group":{"start":56,"value":"\"title\"","children":[{"start":57,"value":"title","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":26,"pickleLine":39,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"Given the Task Tracker API is running","isBg":true,"stepMatchArguments":[]},{"pwStepLine":27,"gherkinStepLine":40,"keywordType":"Action","textWithKeyword":"When I POST \"/api/tasks\" with raw body \"{\" and content type \"application/json\"","stepMatchArguments":[{"group":{"start":7,"value":"\"/api/tasks\"","children":[{"start":8,"value":"/api/tasks","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":34,"value":"\"{\"","children":[{"start":35,"value":"{","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":55,"value":"\"application/json\"","children":[{"start":56,"value":"application/json","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":28,"gherkinStepLine":41,"keywordType":"Outcome","textWithKeyword":"Then the response status should be 400","stepMatchArguments":[{"group":{"start":30,"value":"400"},"parameterTypeName":"int"}]},{"pwStepLine":29,"gherkinStepLine":42,"keywordType":"Outcome","textWithKeyword":"And the response should be Problem Details","stepMatchArguments":[]},{"pwStepLine":30,"gherkinStepLine":43,"keywordType":"Outcome","textWithKeyword":"And the Problem Details field \"status\" should be 400","stepMatchArguments":[{"group":{"start":26,"value":"\"status\"","children":[{"start":27,"value":"status","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":45,"value":"400"},"parameterTypeName":"int"}]},{"pwStepLine":31,"gherkinStepLine":44,"keywordType":"Outcome","textWithKeyword":"And the Problem Details field \"detail\" should contain \"JSON\"","stepMatchArguments":[{"group":{"start":26,"value":"\"detail\"","children":[{"start":27,"value":"detail","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":50,"value":"\"JSON\"","children":[{"start":51,"value":"JSON","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":34,"pickleLine":56,"skipped":true,"tags":["@skip"],"steps":[{"pwStepLine":7,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"Given the Task Tracker API is running","isBg":true},{"pwStepLine":35,"gherkinStepLine":57,"keywordType":"Action","textWithKeyword":"When I GET \"/api/tasks/trigger-500\""},{"pwStepLine":36,"gherkinStepLine":58,"keywordType":"Outcome","textWithKeyword":"Then the response status should be 500"},{"pwStepLine":37,"gherkinStepLine":59,"keywordType":"Outcome","textWithKeyword":"And the response should be Problem Details"},{"pwStepLine":38,"gherkinStepLine":60,"keywordType":"Outcome","textWithKeyword":"And the Problem Details field \"status\" should be 500"},{"pwStepLine":39,"gherkinStepLine":61,"keywordType":"Outcome","textWithKeyword":"And the response body should not leak internal implementation details"}]},
  {"pwTestLine":42,"pickleLine":67,"tags":[],"steps":[{"pwStepLine":7,"gherkinStepLine":8,"keywordType":"Context","textWithKeyword":"Given the Task Tracker API is running","isBg":true,"stepMatchArguments":[]},{"pwStepLine":43,"gherkinStepLine":68,"keywordType":"Action","textWithKeyword":"When I GET \"/api/tasks/999999998\"","stepMatchArguments":[{"group":{"start":6,"value":"\"/api/tasks/999999998\"","children":[{"start":7,"value":"/api/tasks/999999998","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":44,"gherkinStepLine":69,"keywordType":"Outcome","textWithKeyword":"Then the response status should be 404","stepMatchArguments":[{"group":{"start":30,"value":"404"},"parameterTypeName":"int"}]},{"pwStepLine":45,"gherkinStepLine":70,"keywordType":"Outcome","textWithKeyword":"And the response content type should include \"application/problem+json\"","stepMatchArguments":[{"group":{"start":41,"value":"\"application/problem+json\"","children":[{"start":42,"value":"application/problem+json","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
]; // bdd-data-end