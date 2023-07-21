const express = require("express");
const { ObjectId } = require("mongodb");
const studentRouter = express.Router();
const { db } = require("../db");

studentRouter.post("/", async (req, res) => {
  // const name = req.body.name
  // const rank = req.body.rank
  const { name, rank } = req.body;

  const respond = await db.students.insertOne({
    name,
    rank,
  });
  res.status(201);
  res.json(respond);
});

studentRouter.post("/add-many", async (req, res) => {
  try {
    const respond = await db.students.insertMany(req.body.data);
    res.status(201);
    res.json(respond);
  } catch (error) {
    res.status(500);
    res.json("Some thing went wrong");
  }
});

studentRouter.get("/", async (req, res) => {
  try {
    // const id = req.headers.id;
    // const name = req.headers.name;
    // const rank = req.headers.rank;

    const { id, name, rank } = req.headers;

    let student;
    if (id) {
      student = await db.students.findOne({
        _id: new ObjectId(id),
      });
    } else if (name) {
      student = await db.students
        .find({
          name,
        })
        .toArray();
    } else if (rank) {
      student = await db.students
        .find({
          // Convert string rank to type number
          rank: +rank,
        })
        .toArray();
    } else {
      student = await db.students
        .find({
          rank: {
            $in: [1, 4],
          },
        })
        .skip(19)
        .limit(10)
        .toArray();
    }
    res.status(201);
    res.json(student);
  } catch (err) {
    res.status(500);
    res.json("Internal server error");
  }
});

studentRouter.put("", async (req, res) => {
  try {
    const id = req.headers.id;
    const body = req.body;
    const filter = {
      _id: new ObjectId(id),
    };
    const updateDoc = {
      $set: body,
    };
    const student = await db.students.updateOne(filter, updateDoc);
    res.status(201);
    res.json(student);
  } catch (err) {
    res.status(500);
    res.json("Some thing went wrong");
  }
});

studentRouter.delete("/", async (req, res) => {
  try {
    const { id } = req.headers;
    let respond;
    if (id) {
      respond = await db.students.deleteOne({ _id: new ObjectId(id) });
      if (respond.acknowledged) {
        res.json(`Successfully delete ${respond.deletedCount}`);
        return;
      }
      res.json(respond);
      return;
    } else {
      res.status(400);
      res.json("Id is missing");
      return;
    }
  } catch (error) {
    res.status(500);
    res.json(error.message);
  }
});

studentRouter.post("/student-and-teacher", async (req, res) => {
  try {
    const { page, limit, name } = req.headers;
    const {teacherName} = req.body
    const skip = (+page - 1) * +limit;
    let respond;
    if (name) {
      const filter = {
        name,
      };
      respond = await db.students.aggregate([{ $match: filter }]).toArray();
    }
    if ((page, limit, teacherName)) {
      respond = await db.students
        .aggregate([
          { $match: {
            teacherName
          }}, 
          { $skip: skip },
          { $limit: +limit },
          {
            $lookup: {
              from: "Teacher",
              localField: "teacherName",
              foreignField: "name",
              as: "teachers",
            },
          },
        ])
        .toArray();
    }
    res.status(200);
    res.json(respond);
  } catch (error) {
    res.status(500);
    res.json(error.message);
  }
});

module.exports = studentRouter;

// skip ==> so luong ban ghi bo qua

// CLient submit ==> page hien tai

// skip = (page - 1) * limit

// (1 -1) * 10 (limit) = 0 ==> Output = [0 ... 9]
// (2 -1) * 10 = 10 ==> Output = [10 ... 19]
// (3 -1) * 10 = 20 ==> Output = [20 ... 29]
// (4 -1) * 10 = 30 ==> Output = [30 ... 39]
// (5 -1) * 10 = 40 ==> Output = [40 ... 49]
// (6 -1) * 10 = 50 ==> Output = [50 ... 59]

// Mongo Compass ==> Code
// Stage : {
  // key <toán tử> : value <query >
// }

