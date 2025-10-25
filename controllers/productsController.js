import mongoose, { Schema } from "mongoose"
import { userModel } from "../models/user.js";
import { recentOrderModel } from "../models/product.js";


const Product = mongoose.model("products", new mongoose.Schema({}, { strict: false }))

export const fetchProducts = async (req, res) => {
    try {
        const products = await Product.find({},'title');
        res.status(200).json({ success: true, data: products });

    } catch (error) {
        res.status(500).json({ msg: "internal server error", error });
    }



}

export const addProductToCart = async (req, res) => {
    try {


        const userId = req.user.id;
        const { productId, quantity, name, price, img } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: "UnAuthorized user" });
        }

        user.cart.push({ productId, quantity, name, price, img });
        await user.save();

        res.status(200).json({ msg: "item added sucessfully ", cart: user.cart });

    } catch (error) {
        console.error("Add to cart error:", error);
        res.status(500).json({ message: "Server error", error: error.message });

    }

}
export const updateCart = async (req, res) => {
    try {


        const userId = req.user.id;
        const { cart } = req.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: "UnAuthorized user" });
        }

        user.cart = cart;
        await user.save();

        res.status(200).json({ msg: "cart updated sucessfully ", cart: user.cart });

    } catch (error) {
        console.error("Add to cart error:", error);
        res.status(500).json({ message: "Server error", error: error.message });

    }

}

export const fetchCartProducts = async (req, res) => {

    try {

        const userId = req.user.id;

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ msg: "UnAuthorized user" });
        }

        const products = user.cart;

        res.status(200).json({ msg: "cart items sucessfully fetched ", items: products });



    } catch (error) {
        console.error("Add to cart error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }

}

export const addAddress = async (req, res) => {
    try {
        const { street, city, state, zip, country } = req.body;
        const userId = req.user.id;

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ msg: "UnAuthorized user" });
        }
        if (user.address && Object.keys(user.address).length > 0) {
            return res.status(400).json({ msg: "address already added" });
        }

        user.address.push({ street, city, state, zip, country });
        await user.save();
        res.status(200).json({ msg: "address sucessfully saved", address: user.address });

    } catch (error) {
        res.status(500).json({ msg: "iternal server error", error: error.message });

    }
}

export const updateAddress = async (req, res) => {
    try {


        const { street, city, state, zip, country } = req.body;

        const userId = req.user.id;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: "UnAuthorized user" });

        }

        user.address = { street, city, state, zip, country };
        await user.save();

        res.status(200).json({ msg: "address sucessfully updated", address: user.address });
    } catch (error) {
        res.status(500).json({ msg: "internal server error", error: error.message });

    }


}

export const removeProduct = async (req, res) => {

    try {

        const { productId } = req.body;

        const userId = req.user.id;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: "UnAuthorized user" });
        }

        user.cart = user.cart.filter(

            (i) => i.productId.toString() != productId
        );
        await user.save();
        res.status(200).json({ msg: "item sucessfully removed ", updatedCart: user.cart })


    } catch (error) {
        res.status(500).json({ msg: "internal server error", error: error.message });
    }

}


export const search = async (req, res) => {
    try {
        let { query = "", pageNo = 1 } = req.body;
        if (!query.trim()) return res.json({ data: [] });

        // 🔹 Normalize and clean query
        query = query.replace(/['’]/g, "").toLowerCase().trim();

        // 🔹 Standardize gender terms
        if (/\bmens?\b/.test(query)) query = "men";
        if (/\bwomens?\b/.test(query)) query = "women";
        if (/\bkids?\b/.test(query)) query = "kids";

        const keywords = query.split(/\s+/).filter(Boolean);

        const userId = req.user.id;
        const user = await userModel.findById(userId);
        if (!user) return res.status(401).json({ msg: "Unauthorized user" });

        const page = parseInt(pageNo) || 1;
        const limit = 20;
        const skip = (page - 1) * limit;

        // ✅ Use improved regex — matches full words, not substrings
        const regexList = keywords.map(k => new RegExp(`\\b${k}\\b`, "i"));

        // ✅ Strong match: title, category, tags
        const strongMatches = await Product.find({
            $or: regexList.flatMap(regex => [
                { title: regex },
                { category: regex },
                { tags: regex },
            ]),
        });

        // ✅ Weak match: description, gender (exact logic)
        const weakMatches = await Product.find({
            $or: regexList.flatMap(regex => [
                { description: regex },
                { gender: { $regex: new RegExp(`^${keywords[0]}`, "i") } }, // avoids 'men' matching 'women'
            ]),
        });

        // ✅ Merge & remove duplicates
        const seen = new Set();
        const merged = [...strongMatches, ...weakMatches].filter(p => {
            if (seen.has(p._id.toString())) return false;
            seen.add(p._id.toString());
            return true;
        });

        // ✅ Score by keyword frequency
        const scored = merged
            .map(p => {
                const text = `${p.title} ${p.category} ${p.tags?.join(" ")}`.toLowerCase();
                const score = keywords.reduce(
                    (acc, word) => acc + (text.includes(word) ? 2 : 0),
                    0
                );
                return { ...p._doc, score };
            })
            .sort((a, b) => b.score - a.score)
            .slice(skip, skip + limit);

        // ✅ If no results, try looser partial matching
        if (scored.length === 0) {
            const looseRegex = new RegExp(keywords.join("|"), "i");
            const fallback = await Product.find({
                $or: [
                    { title: looseRegex },
                    { category: looseRegex },
                    { tags: looseRegex },
                    { gender: looseRegex },
                ],
            }).limit(limit);
            return res.json({ data: fallback });
        }

        res.json({ data: scored });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Search failed" });
    }
};

export const payment = async (req, res) => {

    try {
        const userId = req.user.id;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: "UnAuthorized user" });
        }
        const { cartItems } = req.body;


        const recentOrders = cartItems.map(item => ({
            productId: item.productId,
            userId: req.user.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity

        }));


        await recentOrderModel.insertMany(recentOrders);
        console.log("All products saved to recent orders");
        user.cart = [];
        await user.save();

        console.log("Cart cleared successfully for user:", userId);


        res.status(200).json({ msg: "Payment successful, products saved" });

    } catch (error) {
        console.log(error);
    }

}
export const fetchRecentOrders = async (req, res) => {

    try {
        const userId = req.user.id;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: "UnAuthorized user" });
        }

        const recentOrders = await recentOrderModel.find({ userId });


        res.status(200).json({ msg: "recent orders fetched ", recentOrders });


    } catch (error) {
        console.log(error);
    }

}
export const fetchSingleProd = async (req, res) => {

    try {
        const userId = req.user.id;
        const user = await userModel.findById(userId);
        const {productId}=req.body
        if (!user) {
            return res.status(404).json({ msg: "UnAuthorized user" });
        }

        const singleProd = await Product.findById(productId);


        res.status(200).json({ msg: "single product fetched ", product:singleProd });


    } catch (error) {
        console.log(error);
    }

}
export const submitReview = async (req, res) => {

    try {
        const userId = req.user.id;
        const user = await userModel.findById(userId);
        const { rating, comment, productId } = req.body;
        if (!user) {
            return res.status(404).json({ msg: "UnAuthorized user" });
        }

        const updatedproduct = await Product.findById(productId);
        updatedproduct.reviews.push({username:req.user.name,rating:rating,comment:comment});
        updatedproduct.markModified("reviews");

        await updatedproduct.save();

        res.status(200).json({ msg: "review submitted sucessfully ", updatedproduct });


    } catch (error) {
        console.log(error);
    }

}