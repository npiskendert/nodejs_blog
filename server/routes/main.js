const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const { create } = require("connect-mongo");

router.get("", async (req, res) => {
  try {
    const locals = {
      title: "NodeJS Blog",
      description: "simple Blog created with NodeJs,Express & MongoDB",
    };

    let perPage = 10;
    let page = req.query.page || 1;

    const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();

    // Count is deprecated - please use countDocuments
    // const count = await Post.count();
    const count = await Post.countDocuments({});
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    res.render("index", {
      locals,
      data,
      current: page,
      nextPage: hasNextPage ? nextPage : null,
      currentRoute: "/",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

router.get("/post/:id", async (req, res) => {
  try {
    const locals = {
      title: "NodeJS Blog",
      description: "simple Blog created with NodeJs,Express & MongoDB",
    };
    let slug = req.params.id;
    const post = await Post.findById({ _id: slug });
    res.render("post", { locals, post, currentRoute: `post/${slug}` });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

router.post("/search/", async (req, res) => {
  try {
    const locals = {
      title: "NodeJS Blog",
      description: "simple Blog created with NodeJs,Express & MongoDB",
    };
    let searchTerm = req.body.searchTerm;

    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, "");
    const data = await Post.find({
      $or: [
        { title: { $regex: new RegExp(searchNoSpecialChar, "i") } },
        { body: { $regex: new RegExp(searchNoSpecialChar, "i") } },
      ],
    });
    res.render("search", { locals, data });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

router.get("/about", (req, res) => {
  res.render("about", { currentRoute: "/about" });
});

module.exports = router;
