const express = require("express");
const router = express.Router();
const auth = require("../auth");
const toy_controller = require("../controllers/toyController");
const category_controller = require("../controllers/categoryController");

router.get("/", toy_controller.index);

router.get("/toys/create", toy_controller.toy_create_get);

router.post("/toys/create", toy_controller.toy_create_post);

router.get("/toys/:id/update", auth, toy_controller.toy_update_get);

router.post("/toys/:id/update", toy_controller.toy_update_post);

router.get("/toys/:id/delete", auth, toy_controller.toy_delete_get);

router.post("/toys/:id/delete", toy_controller.toy_delete_post);

router.get("/toys/:id", toy_controller.toy_detail);

router.get("/toys", toy_controller.toy_list);

router.get("/categories/create", category_controller.category_create_get);

router.post("/categories/create", category_controller.category_create_post);

router.get(
  "/categories/:id/update",
  auth,
  category_controller.category_update_get
);

router.post("/categories/:id/update", category_controller.category_update_post);

router.get(
  "/categories/:id/delete",
  auth,
  category_controller.category_delete_get
);

router.post("/categories/:id/delete", category_controller.category_delete_post);

router.get("/categories/:id", category_controller.category_detail);

router.get("/categories", category_controller.category_list);

module.exports = router;
