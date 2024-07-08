const Toy = require("../models/toy");
const Category = require("../models/category");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res, next) => {
  const [toyCount, categoryCount] = await Promise.all([
    Toy.countDocuments().exec(),
    Category.countDocuments().exec(),
  ]);
  res.render("index", {
    title: "Toy Inventory Home",
    toy_count: toyCount,
    category_count: categoryCount,
  });
});

exports.toy_list = asyncHandler(async (req, res, next) => {
  const toys = await Toy.find().populate("category").sort({ name: 1 }).exec();

  if (toys === null) {
    const error = new Error("Toys not found");
    error.status = 404;
    return next(error);
  }

  res.render("toy_list", {
    title: "Toy List",
    toys,
  });
});

exports.toy_detail = asyncHandler(async (req, res, next) => {
  const toy = await Toy.findById(req.params.id).populate("category").exec();

  if (toy === null) {
    const error = new Error("Toy not found");
    error.status = 404;
    return next(error);
  }
  res.render("toy_detail", {
    title: "Toy Details",
    toy,
  });
});

exports.toy_create_get = asyncHandler(async (req, res, next) => {
  const categories = await Category.find().sort({ name: 1 }).exec();
  res.render("toy_form", {
    title: "Add Toy",
    categories,
  });
});

exports.toy_create_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.category)) {
      req.body.category =
        typeof req.body.category === "undefined" ? [] : [req.body.category];
    }
    next();
  },
  body("name", "Name must be at least 3 letters long")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("description", "Description must be at least 10 characters")
    .trim()
    .isLength({ min: 10 })
    .escape(),
  body("price", "Price must be greater than 0")
    .isDecimal({
      decimal_digits: "2",
    })
    .custom((val) => {
      if (val <= 0) {
        throw new Error("Price must be greater than 0");
      }
      return true;
    })
    .escape(),
  body("quantity_in_stock", "Must be a whole number")
    .isInt({
      min: 0,
      allow_leading_zeroes: true,
    })
    .escape(),
  body("category.*").escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const toy = new Toy({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      quantity_in_stock: req.body.quantity_in_stock,
      category: req.body.category,
    });
    if (!errors.isEmpty()) {
      const categories = await Category.find().sort({ name: 1 }).exec();
      for (const category of categories) {
        if (toy.category.includes(category._id)) {
          category.checked = "true";
        }
      }
      res.render("toy_form", {
        title: "Create Toy",
        toy,
        categories,
        errors: errors.array(),
      });
    } else {
      await toy.save();
      res.redirect(toy.url);
    }
  }),
];

exports.toy_update_get = asyncHandler(async (req, res, next) => {
  const [toy, categories] = await Promise.all([
    Toy.findById(req.params.id).exec(),
    Category.find().sort({ name: 1 }).exec(),
  ]);

  if (toy === null) {
    const err = new Error("Toy not found");
    err.status = 404;
    return next(err);
  }

  categories.forEach((category) => {
    if (toy.category.includes(category._id)) category.checked = "checked";
  });

  res.render("toy_form", {
    title: "Update Toy",
    toy,
    categories,
  });
});

exports.toy_update_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.category)) {
      req.body.category =
        typeof req.body.category === "undefined" ? [] : [req.body.category];
    }
    next();
  },
  body("name", "Name must be at least 3 letters long")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("description", "Description must be at least 10 characters")
    .trim()
    .isLength({ min: 10 })
    .escape(),
  body("price", "Price must be greater than 0")
    .isDecimal({
      decimal_digits: "2",
    })
    .custom((val) => {
      if (val <= 0) {
        throw new Error("Price must be greater than 0");
      }
      return true;
    })
    .escape(),
  body("quantity_in_stock", "Must be a whole number")
    .isInt({
      min: 0,
      allow_leading_zeroes: true,
    })
    .escape(),
  body("category.*").escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const toy = new Toy({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      quantity_in_stock: req.body.quantity_in_stock,
      category: req.body.category,
      _id: req.params.id,
    });
    if (!errors.isEmpty()) {
      const categories = await Category.find().sort({ name: 1 }).exec();

      for (const category in categories) {
        if (toy.category.includes(category._id)) category.checked = "true";
      }

      res.render("toy_form", {
        title: "Update Toy",
        toy,
        categories,
        errors: errors.array(),
      });
    } else {
      const updatedToy = await Toy.findByIdAndUpdate(req.params.id, toy, {});
      res.redirect(updatedToy.url);
    }
  }),
];
