const pool = require("./pool");

exports.getToys = async () => {
  const { rows } = await pool.query("SELECT * FROM toy_view;");
  return rows;
};

exports.getToy = async (id) => {
  const { rows: toyRows } = await pool.query(
    "SELECT * FROM toy_view WHERE id = ($1);",
    [id]
  );
  const { rows: toyCategories } = await pool.query(
    "SELECT name, url FROM category_view JOIN toy_categories ON category_view.id = toy_categories.category_id WHERE toy_id = ($1);",
    [id]
  );
  const toyRow = toyRows[0];
  toyRow.category = toyCategories;
  return toyRow;
};

exports.getToyCount = async () => {
  const { rows } = await pool.query("SELECT COUNT(*) FROM toys;");
  return rows[0].count;
};

exports.getCategoryCount = async () => {
  const { rows } = await pool.query("SELECT COUNT(*) FROM category;");
  return rows[0].count;
};

exports.getCategories = async () => {
  const { rows } = await pool.query(
    "SELECT * FROM category_view ORDER BY name;"
  );
  return rows;
};

exports.getCategory = async (id) => {
  const { rows } = await pool.query(
    "SELECT * FROM category_view WHERE id = ($1);",
    [id]
  );
  const { rows: toys } = await pool.query(
    "SELECT id, name, url FROM toy_view JOIN toy_categories ON toy_id = id WHERE category_id = ($1);",
    [id]
  );
  const category = rows[0];
  category.toys = toys;
  return category;
};

exports.updateToy = async (
  id,
  name,
  description,
  price,
  quantity_in_stock,
  categories
) => {
  await pool.query(
    "UPDATE toys SET name=($1), description=($2), price=($3), quantity_in_stock=($4) WHERE id = ($5)",
    [name, description, price, quantity_in_stock, id]
  );
  const { rows } = await pool.query(
    "SELECT name, id FROM category JOIN toy_categories ON category.id = toy_categories.category_id WHERE toy_id = ($1)",
    [id]
  );
  const previousCategories = [];
  rows.forEach((category) => {
    previousCategories.push(category.name);
  });
  for await (const category of previousCategories) {
    if (!categories.includes(category)) {
      await pool.query(
        "DELETE FROM toy_categories WHERE toy_id = ($1) AND category_id = (SELECT id FROM category WHERE name = ($2))",
        [id, category]
      );
    }
  }
  for await (const category of categories) {
    await pool.query(
      "INSERT INTO toy_categories (toy_id, category_id) VALUES (($1), (SELECT id FROM category WHERE name = ($2))) ON CONFLICT (toy_id, category_id) DO NOTHING;",
      [id, category]
    );
  }
};

exports.deleteToy = async (id) => {
  await pool.query("DELETE FROM toy_categories WHERE toy_id = ($1)", [id]);
  await pool.query("DELETE FROM toys WHERE id = ($1)", [id]);
};

exports.createToy = async (
  name,
  description,
  price,
  quantity_in_stock,
  categories
) => {
  await pool.query(
    "INSERT INTO toys (name, description, price, quantity_in_stock) VALUES (($1), ($2), ($3), ($4));",
    [name, description, price, quantity_in_stock]
  );
  const { rows } = await pool.query("SELECT id FROM toys WHERE name = ($1)", [
    name,
  ]);
  const id = rows[0]["id"];
  for await (const category of categories) {
    const { rows } = await pool.query(
      "SELECT id FROM category WHERE name = ($1)",
      [category]
    );
    const catId = rows[0].id;
    await pool.query(
      "INSERT INTO toy_categories (toy_id, category_id) VALUES (($1), ($2));",
      [id, catId]
    );
  }
  return this.getToy(id);
};

exports.categoryExists = async (name) => {
  const { rows } = await pool.query(
    "SELECT * FROM category_view WHERE name = ($1)",
    [name]
  );
  return rows.length === 0 ? false : rows[0];
};

exports.createCategory = async (name, description) => {
  await pool.query(
    "INSERT INTO category (name, description) VALUES (($1), ($2))",
    [name, description]
  );
  const { rows } = await pool.query(
    "SELECT * FROM category_view WHERE name = ($1)",
    [name]
  );
  return rows[0];
};

exports.updateCategory = async (name, description, id) => {
  await pool.query(
    "UPDATE category SET name=($1), description = ($2) WHERE id = ($3)",
    [name, description, id]
  );
  const { rows } = await pool.query(
    "SELECT * FROM category_view WHERE id = ($1)",
    [id]
  );
  return rows[0];
};

exports.getToysInCategory = async (id) => {
  const { rows } = await pool.query(
    "SELECT * FROM toy_view JOIN toy_categories ON id = toy_id WHERE category_id = ($1)",
    [id]
  );
  return rows;
};

exports.deleteCategory = async (id) => {
  await pool.query("DELETE FROM category WHERE id = ($1)", [id]);
};
