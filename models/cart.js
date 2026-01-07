const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			default: null,
			index: true
		},

		guestId: {
			type: String,
			default: null,
			index: true
		},

		status: {
			type: String,
			enum: ["active", "converted", "abandoned"],
			default: "active"
		}
	},
	{ timestamps: true }
);

cartSchema.pre("validate", function (next) {
	if (!this.userId && !this.guestId) {
		return next(new Error("Cart must belong to a user or guest"));
	}
	if (this.userId && this.guestId) {
		return next(new Error("Cart cannot belong to both user and guest"));
	}
	next();
});

cartSchema.index(
	{ userId: 1 },
	{ unique: true, partialFilterExpression: { status: "active", userId: { $ne: null } } }
);

cartSchema.index(
	{ guestId: 1 },
	{ unique: true, partialFilterExpression: { status: "active", guestId: { $ne: null } } }
);

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
