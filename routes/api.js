"use strict";

require("dotenv").config();
const mongoose = require("mongoose");

const IssueModel = mongoose.model(
  "Issue",
  new mongoose.Schema({
    issue_title: {
      type: String,
      required: true,
    },
    issue_text: {
      type: String,
      required: true,
    },
    created_on: {
      type: Date,
      required: true,
    },
    updated_on: {
      type: Date,
      required: true,
    },
    created_by: {
      type: String,
      required: true,
    },
    assigned_to: {
      type: String,
      default: "",
    },
    open: {
      type: Boolean,
      required: true,
    },
    status_text: {
      type: String,
      default: "",
    },
    project: {
      type: String,
      required: true,
    },
  })
);

module.exports = function (app) {
  mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("== Connected to MongoDB");
  });
  app
    .route("/api/issues/:project")

    .get(function (req, res) {
      let project = req.params.project;
      console.log("get", req.params);
    })

    .post(function (req, res) {
      console.log("get issue");
      const project = req.params.project;
      const issue = new IssueModel({
        ...req.body,
        project,
        created_on: new Date(),
        updated_on: new Date(),
        open: true,
      });
      issue
        .save()
        .then((saved) => {
          console.log("-- Saved issue: ", saved._id);
          res.json();
        })
        .catch((err) => {
          console.error("** Error saving issue: ", project, req.body);
          console.error(err);
          res.json({ error: err.message });
        });
      console.log("Post: ", project);
    })

    .put(function (req, res) {
      const project = req.params.project;
      console.log("put", req.body);
    })

    .delete(function (req, res) {
      let project = req.params.project;
      console.log("delete", req.body);
    });
};
