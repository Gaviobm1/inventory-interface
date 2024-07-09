const Category = require("../models/category");
const Toy = require("../models/toy");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

exports.category_list = asyncHandler(async (req, res, next) => {
  const categories = await Category.find().sort({ name: 1 }).exec();

  res.render("category_list", {
    title: "All Categories",
    categories,
  });
});

exports.category_detail = asyncHandler(async (req, res, next) => {
  const [category, toys] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Toy.find({ category: req.params.id }).sort({ name: 1 }).exec(),
  ]);

  if (category === null) {
    const error = new Error("Category not found");
    error.status = 404;
    return next(error);
  }

  res.render("category_detail", {
    title: "Category Details",
    category,
    toys,
  });
});

exports.category_create_get = asyncHandler(async (req, res, next) => {
  res.render("category_form", { title: "Create Category" });
});

exports.category_create_post = [
  body("name", "Category must have at least 3 letters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("description", "Category must have a description")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const category = new Category({
      name: req.body.name,
      description: req.body.description,
    });
    if (!errors.isEmpty()) {
      res.render("category_form", {
        title: "Create Category",
        category,
        errors: errors.array(),
      });
      return;
    } else {
      const categoryExists = await Category.findOne({ name: req.body.name })
        .collation({ locale: "en", strength: 2 })
        .exec();
      if (categoryExists) {
        res.redirect(categoryExists.url);
      } else {
        await category.save();
        res.redirect(category.url);
      }
    }
  }),
];

exports.category_update_get = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id).exec();
  if (category === null) {
    const error = new Error("Category not found");
    error.status = 404;
    return next(error);
  }

  res.render("category_form", {
    title: "Update Category",
    category,
  });
});

exports.category_update_post = [
  body("name", "Category must have at least 3 letters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("description", "Category must have a description")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const category = new Category({
      name: req.body.name,
      description: req.body.description,
      _id: req.params.id,
    });
    if (!errors.isEmpty()) {
      res.render("category_form", {
        title: "Update Category",
        category,
        errors: errors.array(),
      });
      return;
    } else {
      const updatedCategory = await Category.findByIdAndUpdate(
        req.params.id,
        category,
        {}
      );
      res.redirect(updatedCategory.url);
    }
  }),
];

exports.category_delete_get = asyncHandler(async (req, res, next) => {
  const [category, toys] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Toy.find({ category: req.params.id }).sort({ name: 1 }).exec(),
  ]);

  if (category === null) {
    res.redirect("/catelog/categories");
  }

  res.render("category_delete", {
    title: "Delete Category",
    category,
    toys,
  });
});

exports.category_delete_post = asyncHandler(async (req, res, next) => {
  const [category, toys] = await Promise.all([
    Category.findById(req.body.categoryid).exec(),
    Toy.find({ category: req.body.categoryid }).sort({ name: 1 }).exec(),
  ]);

  if (toys.length > 0) {
    res.render("category_delete", {
      title: "Delete Category",
      category,
      toys,
    });
  } else {
    await Category.findByIdAndDelete(req.body.categoryid).exec();
    res.redirect("/catalog/categories");
  }
});
