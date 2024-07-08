const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const toySchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  quantity_in_stock: { type: Number, required: true },
  category: [{ type: Schema.Types.ObjectId, ref: "Category" }],
});

toySchema.virtual("url").get(function () {
  return `/catalog/toys/${this._id}`;
});

const Toy = mongoose.model("Toy", toySchema);

module.exports = Toy;
