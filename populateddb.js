#! /usr/bin/env node

console.log(
  'This script populates some toys and categories to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"'
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const Toy = require("./models/toy");
const Category = require("./models/category");

const toys = [];
const categories = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
  console.log("Debug: About to connect");
  await mongoose.connect(mongoDB);
  console.log("Debug: Should be connected?");
  await createCategories();
  await createToys();

  console.log("Debug: Closing mongoose");
  mongoose.connection.close();
}

// We pass the index to the ...Create functions so that, for example,
// category[0] will always be the Fantasy category, regardless of the order
// in which the elements of promise.all's argument complete.
async function categoryCreate(index, name, description) {
  const category = new Category({ name, description });
  await category.save();
  categories[index] = category;
  console.log(`Added category: ${name}`);
}

async function toyCreate(
  index,
  name,
  description,
  price,
  quantity_in_stock,
  category
) {
  const toydetail = {
    name,
    description,
    price,
    quantity_in_stock,
  };
  if (category !== false) toydetail.category = category;
  const toy = new Toy(toydetail);
  await toy.save();
  toys[index] = toy;
  console.log(`Added toy: ${name}`);
}

async function createCategories() {
  console.log("Adding categorys");
  await Promise.all([
    categoryCreate(0, "Water", "Toys for to in the water"),
    categoryCreate(1, "Sports", "Moving and not getting cholesterol"),
    categoryCreate(2, "Dolls", "Playing god"),
    categoryCreate(
      3,
      "Art",
      "Creating art with no hint of perspective or proportion"
    ),
    categoryCreate(4, "Politics", "Children are the future"),
  ]);
}

async function createToys() {
  console.log("Adding Toys");
  await Promise.all([
    toyCreate(
      0,
      "Action Man",
      "A doll but called an action figure because men are insecure.",
      19.99,
      65,
      [categories[2]]
    ),
    toyCreate(1, "Ball", "It's just a ball. You kick it.", 10.99, 103, [
      categories[1],
    ]),
    toyCreate(2, "Art Set", "For painting n that", 21.99, 43, [categories[3]]),
    toyCreate(3, "Hula Hoop", "Hula Hoopin' n' hoppin'.", 8.99, 38, [
      categories[1],
    ]),
    toyCreate(
      4,
      "Water Gun",
      "For squirting tourists who have driven up rents to the point of unsustainability.",
      5.99,
      12,
      [categories[0]]
    ),
    toyCreate(
      5,
      "Leftist Barbie",
      "Because capitalism assimilates and defangs everything.",
      69.99,
      43,
      [categories[4], categories[2]]
    ),
  ]);
}
