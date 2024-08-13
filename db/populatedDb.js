const { Client } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

const SQL = `CREATE TABLE IF NOT EXISTS toys (id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,name VARCHAR (100),image VARCHAR(500), description VARCHAR(1000),price NUMERIC(10, 2), quantity_in_stock INTEGER);

CREATE TABLE IF NOT EXISTS category (id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY, name VARCHAR(100), description VARCHAR(1000));

CREATE TABLE IF NOT EXISTS toy_categories (toy_id INTEGER, 
category_id INTEGER, PRIMARY KEY (toy_id, category_id), FOREIGN KEY (toy_id) REFERENCES toys(id), FOREIGN KEY (category_id) REFERENCES category(id));

INSERT INTO category (name, description)
VALUES ('Water', 'Toys for to in the water'), ('Sports', 'Moving and not getting cholesterol'), ('Dolls', 'Playing god'), 
('Art', 'Creating art with no hint of perspective or proportion'),
('Politics', 'Children are the future');

INSERT INTO toys (name, image, description, price, quantity_in_stock)
VALUES ('Action Man',
'https://res.cloudinary.com/dxk7v3ppp/image/upload/v1720545246/toy_photos/image-1720545246557.jpg',
      'A doll but called an action figure because men are insecure.',
      19.99,
      65), ('Ball', 'https://res.cloudinary.com/dxk7v3ppp/image/upload/v1713434549/cld-sample-3.jpg', 'Its just a ball. You kick it.', 10.99, 103),
      ('Art Set', 'https://res.cloudinary.com/dxk7v3ppp/image/upload/v1720530704/toy_photos/image-1720530702892.png','For painting n that', 21.99, 43),
      ('Water Gun', 'https://res.cloudinary.com/dxk7v3ppp/image/upload/v1713434544/samples/chair-and-coffee-table.jpg',
      'For squirting tourists who have driven up rents to the point of unsustainability.',
      5.99,
      12),
      ('Leftist Barbie',
      'https://res.cloudinary.com/dxk7v3ppp/image/upload/v1720530791/toy_photos/image-1720530790450.jpg',
      'Because capitalism assimilates and defangs everything.',
      69.99,
      43);
      
INSERT INTO toy_categories 
VALUES (1, 3), (2, 2), (3, 4), (4, 1), (5, 3), (5, 5);`;

async function main() {
  console.log("seeding...");
  const client = new Client({
    connectionString: `postgres://${process.env.DATABASE_USER}:${process.env.DATABASE_PWD}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}`,
    ssl: {
      rejectUnauthorized: false,
    },
  });
  await client.connect();
  await client.query(SQL);
  await client.end();
  console.log("done");
}

main();
