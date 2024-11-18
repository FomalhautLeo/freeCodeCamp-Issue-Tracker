const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  this.timeout(5000);
  const url = "/api/issues/test_project/";

  let savedObj1;
  let savedObj2;

  test("Create an issue with every field", function (done) {
    const newIssueObj = {
      issue_title: "title1",
      issue_text: "text1",
      created_by: "tester1",
      assigned_to: "tester1",
      status_text: "status1",
    };
    const testDate = new Date();
    chai
      .request(server)
      .post(url)
      .send(newIssueObj)
      .end(function (err, res) {
        if (err) return done(err);
        const body = res.body;
        savedObj1 = body;
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.type, "application/json");
        assert.strictEqual(body.assigned_to, newIssueObj.assigned_to);
        assert.strictEqual(body.status_text, newIssueObj.status_text);
        assert.strictEqual(body.open, true);
        assert.match(body._id, /^[0-9a-fA-F]+$/);
        assert.strictEqual(body.issue_title, newIssueObj.issue_title);
        assert.strictEqual(body.issue_text, newIssueObj.issue_text);
        assert.strictEqual(body.created_by, newIssueObj.created_by);
        assert.isAbove(new Date(body.created_on), testDate);
        assert.isAbove(new Date(body.updated_on), testDate);
        done();
      });
  });
  test("Create an issue with only required fields", function (done) {
    const newIssueObj = {
      issue_title: "title2",
      issue_text: "text2",
      created_by: "tester2",
    };
    const testDate = new Date();
    chai
      .request(server)
      .post(url)
      .send(newIssueObj)
      .end(function (err, res) {
        if (err) return done(err);
        const body = res.body;
        savedObj2 = res.body;
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.type, "application/json");
        assert.strictEqual(body.assigned_to, "");
        assert.strictEqual(body.status_text, "");
        assert.strictEqual(body.open, true);
        assert.match(body._id, /^[0-9a-fA-F]+$/);
        assert.strictEqual(body.issue_title, newIssueObj.issue_title);
        assert.strictEqual(body.issue_text, newIssueObj.issue_text);
        assert.strictEqual(body.created_by, newIssueObj.created_by);
        assert.isAbove(new Date(body.created_on), testDate);
        assert.isAbove(new Date(body.updated_on), testDate);
        done();
      });
  });
  test("Create an issue with missing required fields", function (done) {
    const newIssueObj = {
      issue_title: "title3",
      issue_text: "text3",
    };
    chai
      .request(server)
      .post(url)
      .send(newIssueObj)
      .end(function (err, res) {
        if (err) return done(err);
        const body = res.body;
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.type, "application/json");
        assert.strictEqual(body.error, "required field(s) missing");
        done();
      });
  });
  test("View issues on a project", function (done) {
    chai
      .request(server)
      .get(url)
      .end(function (err, res) {
        if (err) return done(err);
        const body = res.body;
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.type, "application/json");
        assert.isArray(body);
        assert.deepInclude(body, savedObj1);
        assert.deepInclude(body, savedObj2);
        done();
      });
  });
  test("View issues on a project with one filter", function (done) {
    chai
      .request(server)
      .get(url + "?issue_title=title2")
      .end(function (err, res) {
        if (err) return done(err);
        const body = res.body;
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.type, "application/json");
        assert.isArray(body);
        assert.deepInclude(body, savedObj2);
        assert.notDeepInclude(body, savedObj1);
        done();
      });
  });
  test("View issues on a project with multiple filters", function (done) {
    chai
      .request(server)
      .get(url + "?issue_title=title2&created_by=tester2")
      .end(function (err, res) {
        if (err) return done(err);
        const body = res.body;
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.type, "application/json");
        assert.isArray(body);
        assert.deepInclude(body, savedObj2);
        assert.notDeepInclude(body, savedObj1);
        done();
      });
  });
  test("Update one field on an issue", function (done) {
    const testDate = new Date();
    chai
      .request(server)
      .put(url)
      .send({ _id: savedObj2._id, assigned_to: "tester20" })
      .end(function (err, res) {
        if (err) return done(err);
        assert.deepEqual(res.body, {
          result: "successfully updated",
          _id: savedObj2._id,
        });
        done();
      });
  });
  test("Update multiple fields on an issue", function (done) {
    chai
      .request(server)
      .put(url)
      .send({
        _id: savedObj2._id,
        assigned_to: "tester200",
        issue_text: "text200",
      })
      .end(function (err, res) {
        if (err) return done(err);
        assert.deepEqual(res.body, {
          result: "successfully updated",
          _id: savedObj2._id,
        });
        done();
      });
  });
  test("Update an issue with missing _id", function (done) {
    chai
      .request(server)
      .put(url)
      .send({
        assigned_to: "tester2a",
        issue_text: "text2a",
      })
      .end(function (err, res) {
        if (err) return done(err);
        assert.deepEqual(res.body, { error: "missing _id" });
        done();
      });
  });
  test("Update an issue with no fields to update", function (done) {
    chai
      .request(server)
      .put(url)
      .send({
        _id: savedObj2._id,
      })
      .end(function (err, res) {
        if (err) return done(err);
        assert.deepEqual(res.body, {
          error: "no update field(s) sent",
          _id: savedObj2._id,
        });
        done();
      });
  });
  test("Update an issue with an invalid _id", function (done) {
    const testId = "ffffffffffffffffffffffff";
    chai
      .request(server)
      .put(url)
      .send({
        _id: testId,
        assigned_to: "tester2b",
        issue_text: "text2b",
      })
      .end(function (err, res) {
        if (err) return done(err);
        assert.deepEqual(res.body, { error: "could not update", _id: testId });
        done();
      });
  });
  test("Delete an issue", function (done) {
    chai
      .request(server)
      .delete(url)
      .send({ _id: savedObj1._id })
      .end(function (err, res) {
        if (err) return done(err);
        assert.deepEqual(res.body, {
          result: "successfully deleted",
          _id: savedObj1._id,
        });
        done();
      });
  });
  test("Delete an issue with an invalid _id", function (done) {
    const testId = "ffffffffffffffffffffffff";
    chai
      .request(server)
      .delete(url)
      .send({ _id: testId })
      .end(function (err, res) {
        if (err) return done(err);
        assert.deepEqual(res.body, { error: "could not delete", _id: testId });
        done();
      });
  });
  test("Delete an issue with missing _id", function (done) {
    chai
      .request(server)
      .delete(url)
      .send({})
      .end(function (err, res) {
        if (err) return done(err);
        assert.deepEqual(res.body, { error: "missing _id" });
        done();
      });
  });
});
