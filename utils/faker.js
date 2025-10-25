import { faker } from "@faker-js/faker";
import fs from "fs";

const NUM_PRODUCTS = 10000;
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

// 🔹 Realistic subcategories with specific product types
const categoryMap = {
  men: {
    UpperWare: ["T-Shirt", "Shirt", "Hoodie", "Sweatshirt", "Kurta", "Polo"],
    BottomWare: ["Jeans", "Chinos", "Shorts", "Trousers", "Joggers"],
    Jackets: ["Leather Jacket", "Denim Jacket", "Bomber Jacket", "Blazer", "Coat"],
    Accessories: ["Watch", "Belt", "Cap", "Sunglasses", "Wallet", "Tie"]
  },
  women: {
    UpperWare: ["Top", "Blouse", "T-Shirt", "Sweater", "Kurti", "Crop Top"],
    BottomWare: ["Jeans", "Skirt", "Trousers", "Leggings", "Palazzo Pants", "Shorts"],
    Jackets: ["Cardigan", "Denim Jacket", "Blazer", "Winter Coat", "Shrug"],
    Accessories: ["Handbag", "Earrings", "Necklace", "Bracelet", "Scarf", "Sunglasses"]
  },
  kids: {
    UpperWare: ["T-Shirt", "Sweatshirt", "Hoodie", "Shirt", "Top"],
    BottomWare: ["Shorts", "Jeans", "Track Pants", "Trousers", "Skirt"],
    Jackets: ["Hoodie Jacket", "Raincoat", "Puffer Jacket"],
    Accessories: ["Cap", "Backpack", "Hairband", "Shoes", "Socks"]
  },
  accessories: {
    Wearables: ["Cap", "Watch", "Sunglasses", "Scarf", "Belt"],
    Bags: ["Backpack", "Handbag", "Tote", "Messenger Bag", "Travel Bag"]
  },
  gifts: {
    Storage: ["Gift Box", "Organizer", "Jewelry Box"],
    "Phone Cases": ["iPhone Case", "Android Case", "Custom Case"],
    Keychains: ["Metal Keychain", "Leather Keychain", "Customized Keychain"],
    Posters: ["Motivational Poster", "Art Print", "Quote Poster"]
  }
};

// Helper for gender label
const getGender = (section) => {
  if (["men", "women", "kids"].includes(section))
    return section.charAt(0).toUpperCase() + section.slice(1);
  return "Unisex";
};

// Generate a single product
const generateProduct = () => {
  const mainCategory = faker.helpers.arrayElement(Object.keys(categoryMap));
  const subCategory = faker.helpers.arrayElement(Object.keys(categoryMap[mainCategory]));
  const itemName = faker.helpers.arrayElement(categoryMap[mainCategory][subCategory]);
  const gender = getGender(mainCategory);
  const brand = faker.company.name();
  const material = faker.commerce.productMaterial();
  const adjective = faker.commerce.productAdjective();

  // 🏷️ More natural product titles
  const title = `${gender}'s ${itemName} - ${adjective} ${material} by ${brand}`;

  const description = `${title}. Perfect for ${gender.toLowerCase()} who appreciate ${adjective.toLowerCase()} style. Made from premium ${material.toLowerCase()} for comfort and durability.`;

  // 💲 Price logic by category
  const priceRanges = {
    men: [25, 180],
    women: [25, 200],
    kids: [15, 120],
    accessories: [10, 80],
    gifts: [5, 50],
  };
  const [min, max] = priceRanges[mainCategory] || [20, 100];
  const price = parseFloat(faker.commerce.price({ min, max }));

  // 🏷️ Search-friendly tags
  const tags = [
    mainCategory,
    subCategory.toLowerCase(),
    itemName.toLowerCase(),
    `${gender.toLowerCase()} ${itemName.toLowerCase()}`,
    `${gender.toLowerCase()}'s ${itemName.toLowerCase()}`,
    brand.toLowerCase(),
    material.toLowerCase(),
    adjective.toLowerCase(),
    "fashion",
  ];

  // 🧵 Sizes only for wearable categories
  const needsSize = ["UpperWare", "BottomWare", "Jackets", "Wearables"].includes(subCategory);
  const sizes = needsSize
    ? faker.helpers.arrayElements(SIZES, faker.number.int({ min: 2, max: SIZES.length }))
    : [];

  // ⭐ Reviews and average rating
  const reviews = Array.from({ length: faker.number.int({ min: 1, max: 10 }) }, () => ({
    username: faker.internet.username(),
    rating: faker.number.float({ min: 1, max: 5, precision: 0.1 }),
    comment: faker.lorem.sentence(),
  }));

  const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

  return {
    id: faker.string.uuid(),
    title,
    description,
    price,
    mainCategory,
    subCategory,
    brand,
    gender,
    stock: faker.number.int({ min: 10, max: 100 }),
    sizes,
    reviews,
    images: Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, () =>
      faker.image.urlPicsumPhotos({ width: 600, height: 400 })
    ),
    rating: parseFloat(avgRating.toFixed(1)),
    tags,
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
  };
};

// Generate all products
const products = Array.from({ length: NUM_PRODUCTS }, generateProduct);
fs.writeFileSync("products.json", JSON.stringify(products, null, 2));

console.log(`✅ ${NUM_PRODUCTS} detailed, realistic products generated.`);
