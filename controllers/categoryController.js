const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const db = require("../db/query");

exports.category_list = asyncHandler(async (req, res, next) => {
  const categories = await db.getCategories();

  res.render("category_list", {
    title: "All Categories",
    categories,
  });
});

exports.category_detail = asyncHandler(async (req, res, next) => {
  const category = await db.getCategory(req.params.id);
  console.log(category);
  if (category === null) {
    const error = new Error("Category not found");
    error.status = 404;
    return next(error);
  }

  res.render("category_detail", {
    title: "Category Details",
    category,
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
    const category = {
      name: req.body.name,
      description: req.body.description,
    };
    if (!errors.isEmpty()) {
      res.render("category_form", {
        title: "Create Category",
        category,
        errors: errors.array(),
      });
      return;
    } else {
      const categoryExists = await db.categoryExists();
      if (categoryExists) {
        res.redirect(categoryExists.url);
      } else {
        const newCategory = await db.createCategory(
          req.body.name,
          req.body.description
        );
        res.redirect(newCategory.url);
      }
    }
  }),
];

exports.category_update_get = asyncHandler(async (req, res, next) => {
  const category = await db.getCategory(req.params.id);
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
    const category = {
      name: req.body.name,
      description: req.body.description,
      id: req.params.id,
    };
    if (!errors.isEmpty()) {
      res.render("category_form", {
        title: "Update Category",
        category,
        errors: errors.array(),
      });
      return;
    } else {
      const updatedCategory = await db.updateCategory(
        req.body.name,
        req.body.description,
        req.params.id
      );
      res.redirect(updatedCategory.url);
    }
  }),
];

exports.category_delete_get = asyncHandler(async (req, res, next) => {
  const [category, toys] = await Promise.all([
    db.getCategory(req.params.id),
    db.getToysInCategory(req.params.id),
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
    db.getCategory(req.params.id),
    db.getToysInCategory(req.params.id),
  ]);
  console.log(toys.length);
  if (toys.length > 0) {
    res.render("category_delete", {
      title: "Delete Category",
      category,
      toys,
    });
  } else {
    await db.deleteCategory(req.params.id);
    res.redirect("/catalog/categories");
  }
});
