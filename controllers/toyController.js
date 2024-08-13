const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const uploadMiddleware = require("../uploadMiddleware");
const upload = uploadMiddleware("/toy_photos");
const db = require("../db/query");

exports.index = asyncHandler(async (req, res, next) => {
  const [toyCount, categoryCount] = await Promise.all([
    db.getToyCount(),
    db.getCategoryCount(),
  ]);
  res.render("index", {
    title: "Toy Inventory Home",
    toy_count: toyCount,
    category_count: categoryCount,
  });
});

exports.toy_list = asyncHandler(async (req, res, next) => {
  const toys = await db.getToys();
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
  const toy = await db.getToy(req.params.id);
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
  const categories = await db.getCategories();
  res.render("toy_form", {
    title: "Add Toy",
    categories,
  });
});

exports.toy_create_post = [
  upload.single("image"),
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
    if (!errors.isEmpty()) {
      const categories = await db.getCategories();
      const toy = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        quantity_in_stock: req.body.quantity_in_stock,
      };
      for (const category of categories) {
        if (req.body.category.includes(category.name)) {
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
      const newToy = await db.createToy(
        req.body.name,
        req.body.description,
        req.body.price,
        req.body.quantity_in_stock,
        req.body.category
      );
      res.redirect(newToy.url);
    }
  }),
];

exports.toy_update_get = asyncHandler(async (req, res, next) => {
  const toy = await db.getToy(req.params.id);
  const categories = await db.getCategories();
  const catArr = [];
  toy.category.forEach((category) => catArr.push(category.name));
  if (toy === null) {
    const err = new Error("Toy not found");
    err.status = 404;
    return next(err);
  }

  categories.forEach((category) => {
    if (catArr.includes(category.name)) category.checked = "checked";
  });

  res.render("toy_form", {
    title: "Update Toy",
    toy,
    categories,
  });
});

exports.toy_update_post = [
  upload.single("image"),
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
    if (!errors.isEmpty()) {
      const toy = await db.getToy(req.params.id);
      const categories = await db.getCategories();
      const catArr = [];
      toy.category.forEach((category) => catArr.push(category.name));

      categories.forEach((category) => {
        if (catArr.includes(category.name)) category.checked = "checked";
      });

      res.render("toy_form", {
        title: "Update Toy",
        toy,
        categories,
        errors: errors.array(),
      });
    } else {
      await db.updateToy(
        req.params.id,
        req.body.name,
        req.body.description,
        req.body.price,
        req.body.quantity_in_stock,
        req.body.category
      );
      const updatedToy = await db.getToy(req.params.id);
      res.redirect(updatedToy.url);
    }
  }),
];

exports.toy_delete_get = asyncHandler(async (req, res, next) => {
  const toy = await db.getToy(req.params.id);
  res.render("toy_delete", {
    title: "Delete Toy",
    toy,
  });
});

exports.toy_delete_post = asyncHandler(async (req, res, next) => {
  await db.deleteToy(req.params.id);
  res.redirect("/catalog/toys");
});
