const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const adminLayout = "../views/layouts/admin";
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

router.get("/admin", async (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description: "simple Blog created with NodeJs,Express & MongoDB",
    };
    res.render("admin/index", {
      locals,
      layout: adminLayout,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

/* router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(req.body);
    res.redirect("/admin");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});
 */

router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.SECRET);
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description: "simple Blog created with NodeJs,Express & MongoDB",
    };
    const data = await Post.find();
    res.render("admin/dashboard", {
      locals,
      data,
      layout: adminLayout,
    });
  } catch (error) {}
});

router.get("/add-post", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description: "simple Blog created with NodeJs,Express & MongoDB",
    };
    res.render("admin/add-post", {
      locals,
      layout: adminLayout,
    });
  } catch (error) {}
});

router.post("/add-post", authMiddleware, async (req, res) => {
  try {
    const newPost = new Post({
      title: req.body.title,
      body: req.body.body,
    });
    await Post.create(newPost);
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});
router.get("/edit-post/:id", authMiddleware, async (req, res) => {
  try {
    const data = await Post.findById(req.params.id);

    res.render("admin/edit-post", { data, layout: adminLayout });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});

router.put("/edit-post/:id", authMiddleware, async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
      updatedAt: Date.now(),
    });

    res.redirect(`/edit-post/${req.params.id}`);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});

router.delete("/delete-post/:id", authMiddleware, async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const user = await User.create({ username, password: hashedPassword });
      res.status(200).json({ message: "user created", user });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({ message: "Username already exists" });
      }
      console.error(error);
      res.status(500).send("Server Error");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});
router.get("/logout", async (req, res) => {
  res.clearCookie("token");

  res.redirect("/");
});

module.exports = router;
