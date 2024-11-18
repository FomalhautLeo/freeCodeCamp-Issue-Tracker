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
      const project = req.params.project;
      console.log("-- Get issues: ", project);
      IssueModel.find({ project, ...req.query })
        .select(
          "issue_title issue_text created_on updated_on created_by assigned_to open status_text"
        )
        .then((found) => {
          console.log(`-- Found ${found.length} issues for project: `, project);
          res.json(found);
        })
        .catch((err) => {
          console.error("** Error finding issue: ", project, req.body);
          console.error(err);
          res.json({ error: err.message });
        });
    })

    .post(function (req, res) {
      const body = req.body;
      if (!body.issue_title || !body.issue_text || !body.created_by) {
        console.log("-- Error: required fields(s) missing");
        res.json({ error: "required field(s) missing" });
        return;
      }
      console.log("-- Create issue: ", body.issue_title);
      const project = req.params.project;
      const issue = new IssueModel({
        ...body,
        project,
        created_on: new Date(),
        updated_on: new Date(),
        open: true,
      });
      issue
        .save()
        .then((saved) => {
          if (saved) {
            console.log("   Saved issue: ", saved._id.toHexString());
            const retObj = {
              assigned_to: saved.assigned_to,
              status_text: saved.status_text,
              open: saved.open,
              _id: saved._id,
              issue_title: saved.issue_title,
              issue_text: saved.issue_text,
              created_by: saved.created_by,
              created_on: saved.created_on,
              updated_on: saved.updated_on,
            };
            res.json(retObj);
          } else {
            console.log("   Save issue failed: ", req.body.issue_title);
            res.json({ error: "Save issue failed: " + req.body.issue_title });
          }
        })
        .catch((err) => {
          console.error("** Error saving issue: ", project, req.body);
          console.error(err);
          res.json({ error: err.message });
        });
    })

    .put(function (req, res) {
      const project = req.params.project;
      const body = req.body;
      console.log("-- Update issue: ", body._id);
      if (!body._id) {
        console.log("   Error: missing _id");
        res.json({ error: "missing _id" });
        return;
      }
      if (Object.keys(body).length === 1) {
        // only filed _id
        console.log("  Need required fields: ", body);
        res.json({ error: "no update field(s) sent", _id: body._id });
        return;
      }
      IssueModel.findByIdAndUpdate(
        body._id,
        { ...req.body, updated_on: new Date() },
        { new: true }
      )
        .then((updated) => {
          if (updated) {
            console.log("   Updated issue: ", updated._id.toHexString());
            res.json({
              result: "successfully updated",
              _id: updated._id,
            });
          } else {
            console.log("   Cannot find id: ", body._id);
            // res.json({ error: "Cannot find id: " + body._id });
            res.json({ error: "could not update", _id: body._id });
          }
        })
        .catch((err) => {
          console.error("** Error updating issue: ", project, req.body);
          console.error(err);
          // res.json({ error: err.message });
          res.json({ error: "could not update", _id: body._id });
        });
    })

    .delete(function (req, res) {
      const project = req.params.project;
      const body = req.body;
      console.log("-- Delete issue: ", body._id);
      if (!body._id) {
        res.json({ error: "missing _id" });
        return;
      }
      IssueModel.findByIdAndDelete(body._id)
        .then((deleted) => {
          if (deleted) {
            console.log("   Deleted issue: ", deleted._id.toHexString());
            res.json({
              result: "successfully deleted",
              _id: deleted._id,
            });
          } else {
            console.log("   Cannot find id: ", body._id);
            res.json({ error: "could not delete", _id: body._id });
          }
        })
        .catch((err) => {
          console.error("** Error updating issue: ", project, req.body);
          console.error(err);
          res.json({ error: err.message });
        });
      console.log("delete", req.body);
    });
};
