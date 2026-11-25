/* ================================================================
   VPNexues Shared Sub-Admin Product Data
   Provides the product catalog for every country dashboard.
   Defines window.getSubAdminProducts(country) and
   window.PRODUCT_IMAGE_MAP (sku -> local image path).

   Products use the same skus as assets-ui/js/api-service.js so the
   Products page statistics (units sold, revenue, orders) stay
   consistent with the generated orders.
   ================================================================ */
(function () {
  'use strict';

  var CURRENCY = {
    India: { sym: '\u20B9', digits: 0 },
    UAE: { sym: 'AED ', digits: 2 },
    US: { sym: '$', digits: 2 },
    Singapore: { sym: 'S$', digits: 2 }
  };
  var FX = { India: 62, UAE: 3.68, US: 1, Singapore: 1.354 };

  /* Canonical catalog: sku, name, category, base USD price, image filename */
  var CATALOG = [
    /* === VEGETABLES (50) === */
    { sku: 'GPNX-001', name: 'Organic Carrots', cat: 'Vegetables', usd: 2.8, img: 'Organic Carrots.jpg' },
    { sku: 'GPNX-002', name: 'Vine Tomatoes', cat: 'Vegetables', usd: 3.9, img: 'Vine Tomatoes.jpg' },
    { sku: 'GPNX-003', name: 'Baby Spinach', cat: 'Vegetables', usd: 3.2, img: 'Baby Spinach.jpg' },
    { sku: 'GPNX-004', name: 'Sweet Corn', cat: 'Vegetables', usd: 1.9, img: 'Sweet Corn.jpg' },
    { sku: 'GPNX-005', name: 'Red Onions', cat: 'Vegetables', usd: 2.2, img: 'Red Onions.jpg' },
    { sku: 'GPNX-006', name: 'Bell Peppers Mix', cat: 'Vegetables', usd: 4.5, img: 'Bell Peppers Mix.jpg' },
    { sku: 'GPNX-007', name: 'Broccoli Head', cat: 'Vegetables', usd: 3.5, img: 'Broccoli Head.jpg' },
    { sku: 'GPNX-008', name: 'Cucumber', cat: 'Vegetables', usd: 1.8, img: 'Cucumber.jpg' },
    { sku: 'GPNX-009', name: 'Zucchini', cat: 'Vegetables', usd: 2.9, img: 'Zucchini.jpg' },
    { sku: 'GPNX-010', name: 'Cherry Tomatoes', cat: 'Vegetables', usd: 4.2, img: 'Cherry Tomatoes.jpg' },
    { sku: 'GPNX-011', name: 'Kale Bunch', cat: 'Vegetables', usd: 3.8, img: 'Kale Bunch.jpg' },
    { sku: 'GPNX-012', name: 'Purple Cabbage', cat: 'Vegetables', usd: 3.2, img: 'Purple Cabbage.jpg' },
    { sku: 'GPNX-013', name: 'Cauliflower', cat: 'Vegetables', usd: 3.9, img: 'Cauliflower.jpg' },
    { sku: 'GPNX-014', name: 'White Radish', cat: 'Vegetables', usd: 2.5, img: 'White Radish.jpg' },
    { sku: 'GPNX-015', name: 'Sweet Potato', cat: 'Vegetables', usd: 3.1, img: 'Sweet Potato.jpg' },
    { sku: 'GPNX-016', name: 'Green Beans', cat: 'Vegetables', usd: 2.8, img: 'Green Beans.jpg' },
    { sku: 'GPNX-017', name: 'Leek', cat: 'Vegetables', usd: 2.9, img: 'Leek.jpg' },
    { sku: 'GPNX-018', name: 'Beetroot', cat: 'Vegetables', usd: 3.5, img: 'Beetroot.jpg' },
    { sku: 'GPNX-019', name: 'Celery', cat: 'Vegetables', usd: 2.4, img: 'Celery.jpg' },
    { sku: 'GPNX-020', name: 'Pumpkin', cat: 'Vegetables', usd: 4.8, img: 'Pumpkin.jpg' },
    { sku: 'GPNX-021', name: 'Eggplant', cat: 'Vegetables', usd: 2.6, img: 'Eggplant.jpg' },
    { sku: 'GPNX-022', name: 'Asparagus', cat: 'Vegetables', usd: 5.9, img: 'Asparagus.jpg' },
    { sku: 'GPNX-023', name: 'Pak Choi', cat: 'Vegetables', usd: 2.2, img: 'Pak Choi.jpg' },
    { sku: 'GPNX-024', name: 'Okra / Ladyfinger', cat: 'Vegetables', usd: 2.8, img: 'Okra - Ladyfinger.jpg' },
    { sku: 'GPNX-025', name: 'Spring Onions', cat: 'Vegetables', usd: 1.5, img: 'Spring Onions.jpg' },
    { sku: 'GPNX-026', name: 'Coriander', cat: 'Vegetables', usd: 1.2, img: 'Coriander Seeds.jpg' },
    { sku: 'GPNX-027', name: 'Mint Leaves', cat: 'Vegetables', usd: 1.5, img: 'Mint Leaves.jpg' },
    { sku: 'GPNX-028', name: 'Bitter Gourd', cat: 'Vegetables', usd: 2.4, img: 'Bitter Gourd.jpg' },
    { sku: 'GPNX-029', name: 'Long Beans', cat: 'Vegetables', usd: 2.2, img: 'Yardlong Beans.jpg' },
    { sku: 'GPNX-030', name: 'French Beans', cat: 'Vegetables', usd: 3.2, img: 'French Beans.jpg' },
    { sku: 'GPNX-031', name: 'Drumstick (Moringa)', cat: 'Vegetables', usd: 3.5, img: 'Moringa Drumsticks.jpg' },
    { sku: 'GPNX-032', name: 'Bottle Gourd', cat: 'Vegetables', usd: 2.6, img: 'Bottle Gourd.jpg' },
    { sku: 'GPNX-033', name: 'Taro Root', cat: 'Vegetables', usd: 3.8, img: 'Taro Root.jpg' },
    { sku: 'GPNX-034', name: 'Lotus Root', cat: 'Vegetables', usd: 4.2, img: 'Lotus Root.jpg' },
    { sku: 'GPNX-035', name: 'Curry Leaves', cat: 'Vegetables', usd: 1.2, img: 'Curry Leaves.jpg' },
    { sku: 'GPNX-036', name: 'Chilli Peppers', cat: 'Vegetables', usd: 2.1, img: 'Chilli Peppers.jpg' },
    { sku: 'GPNX-037', name: 'Green Capsicum', cat: 'Vegetables', usd: 3.4, img: 'Bell Peppers Mix.jpg' },
    { sku: 'GPNX-038', name: 'Watercress', cat: 'Vegetables', usd: 2.8, img: 'Watercress.jpg' },
    { sku: 'GPNX-039', name: 'Yam (Purple)', cat: 'Vegetables', usd: 4.5, img: 'Purple Sweet Potato.jpg' },
    { sku: 'GPNX-040', name: 'Bitter Melon', cat: 'Vegetables', usd: 2.6, img: 'Bitter Melon.jpg' },
    { sku: 'GPNX-041', name: 'Iceberg Lettuce', cat: 'Vegetables', usd: 2.9, img: 'Iceberg Lettuce.jpg' },
    { sku: 'GPNX-042', name: 'Butterhead Lettuce', cat: 'Vegetables', usd: 3.2, img: 'Cos Lettuce.jpg' },
    { sku: 'GPNX-043', name: 'Turnip', cat: 'Vegetables', usd: 2.4, img: 'Fresh Turnips.jpg' },
    { sku: 'GPNX-044', name: 'Fennel Bulb', cat: 'Vegetables', usd: 4.2, img: 'Fresh Fennel.jpg' },
    { sku: 'GPNX-045', name: 'Pointed Gourd', cat: 'Vegetables', usd: 2.8, img: 'Pointed Gourd.jpg' },
    { sku: 'GPNX-046', name: 'Cluster Beans', cat: 'Vegetables', usd: 2.5, img: 'French Beans.jpg' },
    { sku: 'GPNX-047', name: 'Ridge Gourd', cat: 'Vegetables', usd: 2.6, img: 'Ridge Gourd.jpg' },
    { sku: 'GPNX-048', name: 'Colocasia Leaves', cat: 'Vegetables', usd: 2.2, img: 'Colocasia Leaves.jpg' },
    { sku: 'GPNX-049', name: 'Snake Gourd', cat: 'Vegetables', usd: 2.9, img: 'Bottle Gourd.jpg' },
    { sku: 'GPNX-050', name: 'Banana Flower', cat: 'Vegetables', usd: 3.5, img: 'Banana Flower.jpg' },
    /* === FRUITS (41) === */
    { sku: 'GPNX-051', name: 'Alphonso Mango', cat: 'Fruits', usd: 12.0, img: 'Alphonso Mango.jpg' },
    { sku: 'GPNX-052', name: 'Fresh Bananas', cat: 'Fruits', usd: 3.2, img: 'Fresh Bananas.jpg' },
    { sku: 'GPNX-053', name: 'Dragon Fruit (White)', cat: 'Fruits', usd: 7.5, img: 'Dragon Fruit.jpg' },
    { sku: 'GPNX-054', name: 'Green Apples', cat: 'Fruits', usd: 5.8, img: 'Green Apples.jpg' },
    { sku: 'GPNX-055', name: 'Papaya', cat: 'Fruits', usd: 5.5, img: 'Fresh Papaya.jpg' },
    { sku: 'GPNX-056', name: 'Pomegranate', cat: 'Fruits', usd: 8.8, img: 'Fresh Pomegranate.jpg' },
    { sku: 'GPNX-057', name: 'Fresh Pineapple', cat: 'Fruits', usd: 6.8, img: 'Fresh Pineapple.jpg' },
    { sku: 'GPNX-058', name: 'Watermelon', cat: 'Fruits', usd: 8.0, img: 'Watermelon.jpg' },
    { sku: 'GPNX-059', name: 'Red Grapes', cat: 'Fruits', usd: 7.2, img: 'Red Grapes.jpg' },
    { sku: 'GPNX-060', name: 'Strawberries', cat: 'Fruits', usd: 9.9, img: 'Fresh Strawberries.jpg' },
    { sku: 'GPNX-061', name: 'Orange Navel', cat: 'Fruits', usd: 6.5, img: 'Fresh Oranges.jpg' },
    { sku: 'GPNX-062', name: 'Lemon', cat: 'Fruits', usd: 2.8, img: 'Fresh Lemons.jpg' },
    { sku: 'GPNX-063', name: 'Kiwi Fruit', cat: 'Fruits', usd: 5.6, img: 'Kiwi Fruit.jpg' },
    { sku: 'GPNX-064', name: 'Ripe Avocado', cat: 'Fruits', usd: 6.9, img: 'Fresh Avocado.jpg' },
    { sku: 'GPNX-065', name: 'Blueberries', cat: 'Fruits', usd: 11.0, img: 'Fresh Blueberries.jpg' },
    { sku: 'GPNX-066', name: 'Passion Fruit', cat: 'Fruits', usd: 6.2, img: 'Passion Fruit.jpg' },
    { sku: 'GPNX-067', name: 'Guava', cat: 'Fruits', usd: 3.8, img: 'Fresh Guava.jpg' },
    { sku: 'GPNX-068', name: 'Sapodilla (Chiku)', cat: 'Fruits', usd: 4.5, img: 'Sapodilla.jpg' },
    { sku: 'GPNX-069', name: 'Jackfruit', cat: 'Fruits', usd: 8.5, img: 'Fresh Jackfruit.jpg' },
    { sku: 'GPNX-070', name: 'Rambutan', cat: 'Fruits', usd: 6.8, img: 'Rambutan.jpg' },
    { sku: 'GPNX-071', name: 'Longan', cat: 'Fruits', usd: 7.2, img: 'Longan.jpg' },
    { sku: 'GPNX-072', name: 'Star Fruit', cat: 'Fruits', usd: 4.2, img: 'Star Fruit.jpg' },
    { sku: 'GPNX-073', name: 'Custard Apple', cat: 'Fruits', usd: 5.8, img: 'Custard Apple.jpg' },
    { sku: 'GPNX-074', name: 'Pear', cat: 'Fruits', usd: 6.2, img: 'Green Pears.jpg' },
    { sku: 'GPNX-075', name: 'Dates Medjool', cat: 'Fruits', usd: 12.5, img: 'Medjool Dates.jpg' },
    { sku: 'GPNX-076', name: 'Fig', cat: 'Fruits', usd: 9.9, img: 'Fresh Figs.jpg' },
    { sku: 'GPNX-077', name: 'Plums', cat: 'Fruits', usd: 7.5, img: 'Fresh Plums.jpg' },
    { sku: 'GPNX-078', name: 'Cherries', cat: 'Fruits', usd: 14.0, img: 'Fresh Cherries.jpg' },
    { sku: 'GPNX-079', name: 'Red Banana', cat: 'Fruits', usd: 4.5, img: 'Red Bananas.jpg' },
    { sku: 'GPNX-080', name: 'Coconut (Fresh)', cat: 'Fruits', usd: 3.5, img: 'Fresh Coconut.jpg' },
    { sku: 'GPNX-081', name: 'Soursop', cat: 'Fruits', usd: 8.9, img: 'Soursop.jpg' },
    { sku: 'GPNX-082', name: 'Peaches', cat: 'Fruits', usd: 8.5, img: 'Fresh Peaches.jpg' },
    { sku: 'GPNX-083', name: 'Raspberries', cat: 'Fruits', usd: 9.5, img: 'Fresh Raspberries.jpg' },
    { sku: 'GPNX-084', name: 'Mandarin Oranges', cat: 'Fruits', usd: 7.8, img: 'Mandarin Oranges.jpg' },
    { sku: 'GPNX-085', name: 'Tamarind', cat: 'Fruits', usd: 3.2, img: 'Fresh Tamarind.jpg' },
    { sku: 'GPNX-086', name: 'Grape Fruit', cat: 'Fruits', usd: 5.9, img: 'Grape Fruit.jpg' },
    { sku: 'GPNX-087', name: 'Cantaloupe Melon', cat: 'Fruits', usd: 6.5, img: 'Muskmelon.jpg' },
    { sku: 'GPNX-088', name: 'Lychee', cat: 'Fruits', usd: 8.8, img: 'Fresh Lychee.jpg' },
    { sku: 'GPNX-089', name: 'Apricots', cat: 'Fruits', usd: 9.2, img: 'Fresh Apricots.jpg' },
    { sku: 'GPNX-090', name: 'Banana Blossom', cat: 'Fruits', usd: 3.9, img: 'Banana Blossom.jpg' },
    { sku: 'GPNX-156', name: 'Pomelo', cat: 'Fruits', usd: 3.9, img: 'Grape Fruit.jpg' },
    { sku: 'GPNX-157', name: 'Mangosteen', cat: 'Fruits', usd: 3.9, img: 'Grape Fruit.jpg' },
    { sku: 'GPNX-158', name: 'Langsat', cat: 'Fruits', usd: 3.9, img: 'Longan.jpg' },
    { sku: 'GPNX-159', name: 'Salak', cat: 'Fruits', usd: 3.9, img: 'Snake Fruit.jpg' },
    { sku: 'GPNX-160', name: 'Java Apple', cat: 'Fruits', usd: 3.9, img: 'Green Apples.jpg' },
    { sku: 'GPNX-170', name: 'Malay Gooseberry', cat: 'Fruits', usd: 3.9, img: 'Green Apples.jpg' },
    { sku: 'GPNX-171', name: 'Rose Myrtle', cat: 'Fruits', usd: 3.9, img: 'Fresh Guava.jpg' },
    { sku: 'GPNX-172', name: 'Snake Fruit', cat: 'Fruits', usd: 3.9, img: 'Snake Fruit.jpg' },
    { sku: 'GPNX-173', name: 'Durian', cat: 'Fruits', usd: 3.9, img: 'Fresh Jackfruit.jpg' },
    { sku: 'GPNX-174', name: 'Rose Apple', cat: 'Fruits', usd: 3.9, img: 'Green Apples.jpg' },
    { sku: 'GPNX-175', name: 'Golden Delicious Apples', cat: 'Fruits', usd: 3.9, img: 'Golden Delicious Apples.jpg' },
    /* === BEVERAGES (20) === */
    { sku: 'GPNX-091', name: 'Cold-Pressed Juice Mix', cat: 'Beverages', usd: 8.9, img: 'Cold-Pressed Juice Mix.jpg' },
    { sku: 'GPNX-092', name: 'Coconut Water', cat: 'Beverages', usd: 4.5, img: 'Tender Coconut Water.jpg' },
    { sku: 'GPNX-093', name: 'Turmeric Latte Mix', cat: 'Beverages', usd: 8.9, img: 'Turmeric Latte Mix.jpg' },
    { sku: 'GPNX-094', name: 'Herbal Green Tea', cat: 'Beverages', usd: 7.2, img: 'Herbal Green Tea.jpg' },
    { sku: 'GPNX-095', name: 'Sugarcane Juice', cat: 'Beverages', usd: 3.8, img: 'Sugarcane Juice.jpg' },
    { sku: 'GPNX-096', name: 'Mango Lassi', cat: 'Beverages', usd: 5.5, img: 'Mango Lassi.jpg' },
    { sku: 'GPNX-097', name: 'Rose Milk', cat: 'Beverages', usd: 4.2, img: 'Rose Milk.jpg' },
    { sku: 'GPNX-098', name: 'Nannari Sarbath', cat: 'Beverages', usd: 4.5, img: 'Nannari Sarbath.jpg' },
    { sku: 'GPNX-099', name: 'Aloe Vera Juice', cat: 'Beverages', usd: 6.8, img: 'Aloe Vera Juice.jpg' },
    { sku: 'GPNX-100', name: 'Tender Coconut Water', cat: 'Beverages', usd: 3.5, img: 'Tender Coconut Water.jpg' },
    { sku: 'GPNX-101', name: 'Amla Juice', cat: 'Beverages', usd: 5.9, img: 'Amla Juice.jpg' },
    { sku: 'GPNX-102', name: 'Moringa Tea', cat: 'Beverages', usd: 7.5, img: 'Herbal Moringa Tea.jpg' },
    { sku: 'GPNX-103', name: 'Tamarind Drink', cat: 'Beverages', usd: 3.9, img: 'Tamarind Drink.jpg' },
    { sku: 'GPNX-104', name: 'Carrot-Ginger Juice', cat: 'Beverages', usd: 5.2, img: 'Carrot-Ginger Juice.jpg' },
    { sku: 'GPNX-105', name: 'Hibiscus Iced Tea', cat: 'Beverages', usd: 6.2, img: 'Hibiscus Iced Tea.jpg' },
    { sku: 'GPNX-106', name: 'Vetiver Cooler', cat: 'Beverages', usd: 4.8, img: 'Vetiver Cooler.jpg' },
    { sku: 'GPNX-107', name: 'Barley Water', cat: 'Beverages', usd: 4.2, img: 'Barley Water.jpg' },
    { sku: 'GPNX-108', name: 'Kokum Sherbet', cat: 'Beverages', usd: 4.9, img: 'Kokum Sherbat.jpg' },
    { sku: 'GPNX-109', name: 'Jamun Juice', cat: 'Beverages', usd: 6.5, img: 'Jamun Juice.jpg' },
    { sku: 'GPNX-110', name: 'Pineapple Vinegar', cat: 'Beverages', usd: 9.5, img: 'Pineapple Vinegar.jpg' },
    { sku: 'GPNX-185', name: 'Masala Chai', cat: 'Beverages', usd: 5.5, img: 'Masala Chai.jpg' },
    { sku: 'GPNX-186', name: 'Fresh Orange Juice', cat: 'Beverages', usd: 4.5, img: 'Fresh Orange Juice.jpg' },
    { sku: 'GPNX-187', name: 'Iced Coffee', cat: 'Beverages', usd: 5.9, img: 'Iced Coffee.jpg' },
    { sku: 'GPNX-188', name: 'Jasmine Green Tea', cat: 'Beverages', usd: 6.9, img: 'Jasmine Green Tea.jpg' },
    { sku: 'GPNX-189', name: 'Protein Shake', cat: 'Beverages', usd: 7.5, img: 'Protein shake.jpg' },
    /* === GROCERIES (68) === */
    { sku: 'GPNX-111', name: 'Basmati Rice', cat: 'Groceries', usd: 9.8, img: 'Basmati Rice.jpg' },
    { sku: 'GPNX-112', name: 'Cold-Pressed Coconut Oil', cat: 'Groceries', usd: 14.5, img: 'Cold Pressed Coconut Oil.jpg' },
    { sku: 'GPNX-113', name: 'Garlic Bulbs', cat: 'Groceries', usd: 3.9, img: 'Whole Garlic Bulbs.jpg' },
    { sku: 'GPNX-114', name: 'Free Range Eggs', cat: 'Groceries', usd: 6.5, img: 'Free Range Eggs.jpg' },
    { sku: 'GPNX-115', name: 'Moringa Powder', cat: 'Groceries', usd: 11.0, img: 'Moringa Powder.jpg' },
    { sku: 'GPNX-116', name: 'Chickpeas', cat: 'Groceries', usd: 5.2, img: 'Chickpeas.jpg' },
    { sku: 'GPNX-117', name: 'Red Lentils (Masoor)', cat: 'Groceries', usd: 4.8, img: 'Red Lentils (Masoor).jpg' },
    { sku: 'GPNX-118', name: 'Yellow Lentils (Toor)', cat: 'Groceries', usd: 5.5, img: 'Yellow Lentils.jpg' },
    { sku: 'GPNX-119', name: 'Whole Black Pepper', cat: 'Groceries', usd: 6.8, img: 'Whole Black Pepper.jpg' },
    { sku: 'GPNX-120', name: 'Turmeric Powder', cat: 'Groceries', usd: 4.2, img: 'Turmeric Powder.jpg' },
    { sku: 'GPNX-121', name: 'Cumin Seeds', cat: 'Groceries', usd: 3.8, img: 'Cumin Seeds.jpg' },
    { sku: 'GPNX-122', name: 'Coriander Seeds', cat: 'Groceries', usd: 3.5, img: 'Coriander Seeds.jpg' },
    { sku: 'GPNX-123', name: 'Green Cardamom Pods', cat: 'Groceries', usd: 8.9, img: 'Green Cardamom Pods.jpg' },
    { sku: 'GPNX-124', name: 'Cinnamon Sticks', cat: 'Groceries', usd: 5.2, img: 'Cinnamon Sticks.jpg' },
    { sku: 'GPNX-125', name: 'Cloves', cat: 'Groceries', usd: 6.5, img: 'Cloves.jpg' },
    { sku: 'GPNX-126', name: 'Sesame Seeds', cat: 'Groceries', usd: 4.2, img: 'Sesame Seeds.jpg' },
    { sku: 'GPNX-127', name: 'Mustard Seeds', cat: 'Groceries', usd: 2.8, img: 'Mustard Seeds.jpg' },
    { sku: 'GPNX-128', name: 'Fenugreek Seeds', cat: 'Groceries', usd: 3.2, img: 'Fenugreek Seeds.jpg' },
    { sku: 'GPNX-129', name: 'Groundnut Oil', cat: 'Groceries', usd: 12.5, img: 'Groundnut Oil.jpg' },
    { sku: 'GPNX-130', name: 'Cane Jaggery', cat: 'Groceries', usd: 4.9, img: 'Cane Jaggery.jpg' },
    { sku: 'GPNX-131', name: 'Honey (Raw Wildflower)', cat: 'Groceries', usd: 14.9, img: 'Honey (Raw Wildflower).jpg' },
    { sku: 'GPNX-132', name: 'Ghee (Cow Milk)', cat: 'Groceries', usd: 18.0, img: 'Ghee (Cow Milk).jpg' },
    { sku: 'GPNX-133', name: 'Tapioca Flour', cat: 'Groceries', usd: 4.5, img: 'Tapioca Flour.jpg' },
    { sku: 'GPNX-134', name: 'Ragi Flour (Finger Millet)', cat: 'Groceries', usd: 5.8, img: 'Ragi Flour (Finger Millet).jpg' },
    { sku: 'GPNX-135', name: 'Organic Quinoa', cat: 'Groceries', usd: 11.9, img: 'Organic Quinoa.jpg' },
    { sku: 'GPNX-136', name: 'Oats (Rolled)', cat: 'Groceries', usd: 6.5, img: 'Oats (Rolled).jpg' },
    { sku: 'GPNX-137', name: 'Almonds', cat: 'Groceries', usd: 15.9, img: 'Almonds.jpg' },
    { sku: 'GPNX-138', name: 'Cashew Nuts', cat: 'Groceries', usd: 14.5, img: 'Cashew Nuts.jpg' },
    { sku: 'GPNX-139', name: 'Walnut Kernels', cat: 'Groceries', usd: 16.9, img: 'Walnut Kernels.jpg' },
    { sku: 'GPNX-140', name: 'Flaxseeds', cat: 'Groceries', usd: 4.8, img: 'Flaxseeds.jpg' },
    { sku: 'GPNX-141', name: 'Chia Seeds', cat: 'Groceries', usd: 7.9, img: 'Chia Seeds.jpg' },
    { sku: 'GPNX-142', name: 'Sunflower Seeds', cat: 'Groceries', usd: 4.5, img: 'Sunflower Seeds.jpg' },
    { sku: 'GPNX-143', name: 'Pumpkin Seeds', cat: 'Groceries', usd: 6.8, img: 'Pumpkin Seeds.jpg' },
    { sku: 'GPNX-144', name: 'Dry Red Chilli', cat: 'Groceries', usd: 3.5, img: 'Dry Red Chilli.jpg' },
    { sku: 'GPNX-145', name: 'Star Anise', cat: 'Groceries', usd: 4.9, img: 'Star Anise.jpg' },
    { sku: 'GPNX-146', name: 'Dried Mango Powder (Amchur)', cat: 'Groceries', usd: 5.2, img: 'Dried Mango Powder (Amchur).jpg' },
    { sku: 'GPNX-147', name: 'Tamarind Paste', cat: 'Groceries', usd: 3.9, img: 'Tamarind Paste.jpg' },
    { sku: 'GPNX-148', name: 'Coconut Milk', cat: 'Groceries', usd: 4.2, img: 'Coconut Milk.jpg' },
    { sku: 'GPNX-149', name: 'Brown Rice', cat: 'Groceries', usd: 8.9, img: 'Brown Rice.jpg' },
    { sku: 'GPNX-150', name: 'Mung Beans (Green)', cat: 'Groceries', usd: 4.5, img: 'Mung Beans (Green) 1.jpg' },
    { sku: 'GPNX-151', name: 'Dried Chilli Flakes', cat: 'Groceries', usd: 3.2, img: 'Dried Chilli Flakes.jpg' },
    { sku: 'GPNX-152', name: 'Dried Fenugreek Leaves (Kasuri Methi)', cat: 'Groceries', usd: 4.2, img: 'Dried Fenugreek Leaves (Kasuri Methi).jpg' },
    { sku: 'GPNX-153', name: 'Asafoetida', cat: 'Groceries', usd: 5.5, img: 'Asafoetida.jpg' },
    { sku: 'GPNX-154', name: 'Dried Coconut (Kopra)', cat: 'Groceries', usd: 6.8, img: 'Dried Coconut (Kopra).jpg' },
    { sku: 'GPNX-176', name: 'Peanut Oil', cat: 'Groceries', usd: 10.5, img: 'Cold Pressed Peanut Oil.jpg' },
    { sku: 'GPNX-177', name: 'Raw Peanuts', cat: 'Groceries', usd: 10.5, img: 'Raw Peanuts (With Shells).jpg' },
    { sku: 'GPNX-178', name: 'Sesame Oil', cat: 'Groceries', usd: 10.5, img: 'Pressed Sesame Oil.jpg' },
    { sku: 'GPNX-179', name: 'Frozen Mixed Vegetables', cat: 'Groceries', usd: 10.5, img: 'Frozen Mixed Vegetables.jpg' },
    { sku: 'GPNX-180', name: 'Premium Dairy Butter', cat: 'Groceries', usd: 10.5, img: 'Premium Dairy Butter.jpg' },
    { sku: 'GPNX-181', name: 'Farm Fresh Cow Ghee', cat: 'Groceries', usd: 10.5, img: 'Farm Fresh Cow Ghee.jpg' },
    { sku: 'GPNX-182', name: 'Paneer Cheese Cubes', cat: 'Groceries', usd: 10.5, img: 'Paneer Cheese Cubes.jpg' },
    { sku: 'GPNX-183', name: 'Premium Fresh Curd', cat: 'Groceries', usd: 10.5, img: 'Premium Fresh Curd.jpg' },
    { sku: 'GPNX-184', name: 'Premium Fresh Cheese', cat: 'Groceries', usd: 10.5, img: 'Premium Fresh Cheese.jpg' }
  ];

  var IMG_PREFIX = 'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/react-product-images';

  function localPrice(country, usd) {
    var f = FX[country] || 1;
    var digits = CURRENCY[country] ? CURRENCY[country].digits : 2;
    var val = usd * f;
    return digits === 0 ? Math.round(val) : Math.round(val * 100) / 100;
  }

  /* Deterministic hash for stable, plausible stock levels */
  function h(s) {
    var v = 2166136261;
    for (var i = 0; i < s.length; i++) { v ^= s.charCodeAt(i); v = Math.imul(v, 16777619); }
    return Math.abs(v);
  }

  /* Assign a stock level: ~8% out of stock, ~15% low stock, rest healthy */
  function stockFor(country, sku) {
    var r = h(country + sku) % 100;
    if (r < 8) return 0;
    if (r < 23) return 6 + (h(sku + 'low') % 12);
    return 40 + (h(sku + 'stock') % 240);
  }

  var IMAGE_MAP = {};
  CATALOG.forEach(function (p) { IMAGE_MAP[p.sku] = IMG_PREFIX + '/' + p.img; });

  function byCountry(country) {
    country = country || 'India';
    return CATALOG.map(function (p) {
      return {
        sku: p.sku,
        name: p.name,
        cat: p.cat,
        price: localPrice(country, p.usd),
        stock: stockFor(country, p.sku),
        img: IMG_PREFIX + '/' + p.img,
        emoji: '\u{1F4E6}'
      };
    });
  }

  window.PRODUCT_IMAGE_MAP = window.PRODUCT_IMAGE_MAP || IMAGE_MAP;
  window.PRODUCT_DATA = CATALOG;
  window.getSubAdminProducts = function (country) {
    return byCountry(country);
  };
})();
