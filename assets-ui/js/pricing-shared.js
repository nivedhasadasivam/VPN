var SUPABASE_IMG = 'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/react-product-images';
var SUPABASE_SITE = 'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/site-assets';
var SUPABASE_JS = 'https://slnercwjkfacyrfhdsnp.supabase.co/storage/v1/object/public/javascript-assets';

function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function escAttr(s){return esc(s);}

const PRODS = [
/* -- VEGETABLES (50 items) -- */
{id:1,   name:'Organic Carrots',        cat:'Vegetables', emoji:'🥕', price:2.80, old:3.50,  unit:'per 500g',   badges:[],              pct:null,  sku:'GPNX-001', tags:'Organic, Fresh, Farm',        img:SUPABASE_IMG+'/Organic Carrots.jpg', inrPrice:45, inrOldPrice:56},
{id:2,   name:'Vine Tomatoes',          cat:'Vegetables', emoji:'🍅', price:3.90, old:4.80,  unit:'per kg',     badges:[],                pct:'19%', sku:'GPNX-002', tags:'Fresh, Juicy, Farm',          img:SUPABASE_IMG+'/Vine Tomatoes.jpg', inrPrice:20, inrOldPrice:26},
{id:3,   name:'Baby Spinach',           cat:'Vegetables', emoji:'🥬', price:3.20, old:null,  unit:'per 200g',   badges:[],       pct:null,  sku:'GPNX-003', tags:'Leafy, Green, Organic',       img:SUPABASE_IMG+'/Baby Spinach.jpg', inrPrice:25, inrOldPrice:32},
{id:4,   name:'Sweet Corn',             cat:'Vegetables', emoji:'🌽', price:1.90, old:2.50,  unit:'per pc',     badges:[],          pct:null,  sku:'GPNX-004', tags:'Sweet, Farm, Fresh',          img:SUPABASE_IMG+'/Sweet Corn.jpg', inrPrice:25, inrOldPrice:32},
{id:5,   name:'Red Onions',             cat:'Vegetables', emoji:'🧅', price:2.20, old:2.80,  unit:'per kg',     badges:[],          pct:null,  sku:'GPNX-005', tags:'Fresh, Farm, Kitchen',        img:SUPABASE_IMG+'/Red Onions.jpg', inrPrice:45, inrOldPrice:56},
{id:6,   name:'Bell Peppers Mix',       cat:'Vegetables', emoji:'🫑', price:4.50, old:5.80,  unit:'per 3 pcs',  badges:[],       pct:null,  sku:'GPNX-006', tags:'Colourful, Organic, Fresh',   img:SUPABASE_IMG+'/Bell Peppers Mix.jpg', inrPrice:100, inrOldPrice:120},
{id:7,   name:'Broccoli Head',          cat:'Vegetables', emoji:'🥦', price:3.50, old:4.20,  unit:'per pc',     badges:[],       pct:null,  sku:'GPNX-007', tags:'Organic, Green, Nutritious',  img:SUPABASE_IMG+'/Broccoli Head.jpg', inrPrice:60, inrOldPrice:75},
{id:8,   name:'Cucumber',               cat:'Vegetables', emoji:'🥒', price:1.80, old:null,  unit:'per pc',     badges:[],          pct:null,  sku:'GPNX-008', tags:'Fresh, Crisp, Hydrating',     img:SUPABASE_IMG+'/Cucumber.jpg', inrPrice:15, inrOldPrice:20},
{id:9,   name:'Zucchini',               cat:'Vegetables', emoji:'🥒', price:2.90, old:3.60,  unit:'per 500g',   badges:[],       pct:null,  sku:'GPNX-009', tags:'Organic, Versatile, Farm',    img:SUPABASE_IMG+'/Zucchini.jpg', inrPrice:35, inrOldPrice:44},
{id:10,  name:'Cherry Tomatoes',        cat:'Vegetables', emoji:'🍅', price:4.20, old:5.00,  unit:'per 250g',   badges:[], pct:'16%', sku:'GPNX-010', tags:'Organic, Sweet, Snack',       img:SUPABASE_IMG+'/Cherry Tomatoes.jpg', inrPrice:30, inrOldPrice:38},
{id:11,  name:'Kale Bunch',             cat:'Vegetables', emoji:'🥬', price:3.80, old:null,  unit:'per bunch',  badges:[],       pct:null,  sku:'GPNX-011', tags:'Superfood, Organic, Green',   img:SUPABASE_IMG+'/Kale Bunch.jpg', inrPrice:25, inrOldPrice:32},
{id:12,  name:'Purple Cabbage',         cat:'Vegetables', emoji:'🥬', price:3.20, old:4.00,  unit:'per pc',     badges:[],          pct:null,  sku:'GPNX-012', tags:'Fresh, Antioxidant, Farm',    img:SUPABASE_IMG+'/Purple Cabbage.jpg', inrPrice:35, inrOldPrice:44},
{id:13,  name:'Cauliflower',            cat:'Vegetables', emoji:'🥦', price:3.90, old:4.80,  unit:'per pc',     badges:[],       pct:null,  sku:'GPNX-013', tags:'Organic, White, Farm',        img:SUPABASE_IMG+'/Cauliflower.jpg', inrPrice:35, inrOldPrice:44},
{id:14,  name:'White Radish',           cat:'Vegetables', emoji:'🥕', price:2.50, old:null,  unit:'per kg',     badges:[],          pct:null,  sku:'GPNX-014', tags:'Fresh, Crisp, Asian',         img:SUPABASE_IMG+'/White Radish.jpg', inrPrice:35, inrOldPrice:44},
{id:15,  name:'Sweet Potato',           cat:'Vegetables', emoji:'🥔', price:3.10, old:3.80,  unit:'per kg',     badges:[],       pct:null,  sku:'GPNX-015', tags:'Organic, Sweet, Nutritious',  img:SUPABASE_IMG+'/Sweet Potato.jpg', inrPrice:30, inrOldPrice:38},
{id:16,  name:'Green Beans',            cat:'Vegetables', emoji:'🫘', price:2.80, old:3.40,  unit:'per 300g',   badges:[],       pct:null,  sku:'GPNX-016', tags:'Organic, Crunchy, Green',     img:SUPABASE_IMG+'/Green Beans.jpg', inrPrice:15, inrOldPrice:19},
{id:17,  name:'Leek',                   cat:'Vegetables', emoji:'🧅', price:2.90, old:null,  unit:'per 2 pcs',  badges:[],          pct:null,  sku:'GPNX-017', tags:'Fresh, Mild, Kitchen',        img:SUPABASE_IMG+'/Leek.jpg', inrPrice:20, inrOldPrice:25},
{id:18,  name:'Beetroot',               cat:'Vegetables', emoji:'🫀', price:3.50, old:4.20,  unit:'per kg',     badges:[],       pct:null,  sku:'GPNX-018', tags:'Organic, Earthy, Rich',       img:SUPABASE_IMG+'/Beetroot.jpg', inrPrice:35, inrOldPrice:44},
{id:19,  name:'Celery',                 cat:'Vegetables', emoji:'🥬', price:2.40, old:null,  unit:'per bunch',  badges:[],          pct:null,  sku:'GPNX-019', tags:'Fresh, Crisp, Low-Cal',       img:SUPABASE_IMG+'/Celery.jpg', inrPrice:15, inrOldPrice:20},
{id:20,  name:'Pumpkin',                cat:'Vegetables', emoji:'🎃', price:4.80, old:6.00,  unit:'per kg',     badges:[], pct:'20%', sku:'GPNX-020', tags:'Organic, Seasonal, Sweet',    img:SUPABASE_IMG+'/Pumpkin.jpg', inrPrice:26, inrOldPrice:33},
{id:21,  name:'Eggplant',               cat:'Vegetables', emoji:'🍆', price:2.60, old:3.20,  unit:'per pc',     badges:[],       pct:null,  sku:'GPNX-021', tags:'Organic, Purple, Asian',      img:SUPABASE_IMG+'/Eggplant.jpg', inrPrice:25, inrOldPrice:32},
{id:22,  name:'Asparagus',              cat:'Vegetables', emoji:'🫛', price:5.90, old:7.50,  unit:'per bunch',  badges:[],       pct:null,  sku:'GPNX-022', tags:'Organic, Premium, Green',     img:SUPABASE_IMG+'/Asparagus.jpg', inrPrice:120, inrOldPrice:150},
{id:23,  name:'Pak Choi',               cat:'Vegetables', emoji:'🥬', price:2.20, old:null,  unit:'per bunch',  badges:[],          pct:null,  sku:'GPNX-023', tags:'Fresh, Asian, Leafy',         img:SUPABASE_IMG+'/Pak Choi.jpg', inrPrice:20, inrOldPrice:25},
{id:24,  name:'Okra / Ladyfinger',      cat:'Vegetables', emoji:'🫛', price:2.80, old:3.50,  unit:'per 300g',   badges:[],       pct:null,  sku:'GPNX-024', tags:'Organic, Asian, Fresh',       img:SUPABASE_IMG+'/Okra - Ladyfinger.jpg', inrPrice:12, inrOldPrice:15},
{id:25,  name:'Spring Onions',          cat:'Vegetables', emoji:'🧅', price:1.50, old:null,  unit:'per bunch',  badges:[],          pct:null,  sku:'GPNX-025', tags:'Fresh, Garnish, Asian',       img:SUPABASE_IMG+'/Spring Onions Fresh.jpg', inrPrice:15, inrOldPrice:20},
{id:26,  name:'Coriander',              cat:'Vegetables', emoji:'🌿', price:1.20, old:null,  unit:'per bunch',  badges:[],          pct:null,  sku:'GPNX-026', tags:'Herb, Fresh, Aromatic',       img:SUPABASE_IMG+'/Fresh Mint.jpg', inrPrice:12, inrOldPrice:15},
{id:27,  name:'Mint Leaves',            cat:'Vegetables', emoji:'🌿', price:1.50, old:null,  unit:'per bunch',  badges:[],       pct:null,  sku:'GPNX-027', tags:'Herb, Organic, Refreshing',   img:SUPABASE_IMG+'/Mint Leaves.jpg', inrPrice:12, inrOldPrice:15},
{id:28,  name:'Bitter Gourd',           cat:'Vegetables', emoji:'🥒', price:2.40, old:3.00,  unit:'per 500g',   badges:[],          pct:null,  sku:'GPNX-028', tags:'Fresh, Asian, Medicinal',     img:SUPABASE_IMG+'/Bitter Gourd.jpg', inrPrice:22, inrOldPrice:28},
{id:29,  name:'Long Beans',             cat:'Vegetables', emoji:'🫘', price:2.20, old:null,  unit:'per 300g',   badges:[],       pct:null,  sku:'GPNX-029', tags:'Organic, Asian, Green',       img:SUPABASE_IMG+'/Yardlong Beans.jpg', inrPrice:14, inrOldPrice:18},
{id:30,  name:'French Beans',           cat:'Vegetables', emoji:'🫘', price:3.20, old:4.00,  unit:'per 250g',   badges:[],       pct:null,  sku:'GPNX-030', tags:'Organic, Fine, Green',        img:SUPABASE_IMG+'/French Beans.jpg', inrPrice:20, inrOldPrice:25},
{id:31,  name:'Drumstick (Moringa)',    cat:'Vegetables', emoji:'🥕', price:3.50, old:null,  unit:'per bunch',  badges:[],       pct:null,  sku:'GPNX-031', tags:'Organic, Superfood, Indian',  img:SUPABASE_IMG+'/Moringa Drumsticks.jpg', inrPrice:15, inrOldPrice:19},
{id:32,  name:'Bottle Gourd',           cat:'Vegetables', emoji:'🥒', price:2.60, old:3.20,  unit:'per pc',     badges:[],          pct:null,  sku:'GPNX-032', tags:'Fresh, Indian, Mild',         img:SUPABASE_IMG+'/Bottle Gourd.jpg', inrPrice:20, inrOldPrice:25},
{id:33,  name:'Taro Root',              cat:'Vegetables', emoji:'🥔', price:3.80, old:4.50,  unit:'per kg',     badges:[],       pct:null,  sku:'GPNX-033', tags:'Organic, Starchy, Asian',     img:SUPABASE_IMG+'/Taro Root.jpg', inrPrice:35, inrOldPrice:44},
{id:34,  name:'Lotus Root',             cat:'Vegetables', emoji:'🥔', price:4.20, old:5.00,  unit:'per 500g',   badges:[],          pct:null,  sku:'GPNX-034', tags:'Fresh, Asian, Crunchy',       img:SUPABASE_IMG+'/Lotus Root.jpg', inrPrice:35, inrOldPrice:44},
{id:35,  name:'Curry Leaves',           cat:'Vegetables', emoji:'🌿', price:1.20, old:null,  unit:'per bunch',  badges:[],       pct:null,  sku:'GPNX-035', tags:'Herb, Indian, Aromatic',      img:SUPABASE_IMG+'/Curry Leaves.jpg', inrPrice:25, inrOldPrice:30},
{id:36,  name:'Chilli Peppers',         cat:'Vegetables', emoji:'🌶️', price:2.10, old:2.60,  unit:'per 100g',   badges:[],          pct:null,  sku:'GPNX-036', tags:'Spicy, Fresh, Indian',        img:SUPABASE_IMG+'/Chilli Peppers.jpg', inrPrice:5, inrOldPrice:6},
{id:37,  name:'Green Capsicum',         cat:'Vegetables', emoji:'🫑', price:3.40, old:4.20,  unit:'per 3 pcs',  badges:[],       pct:null,  sku:'GPNX-037', tags:'Organic, Green, Mild',        img:SUPABASE_IMG+'/Bell Peppers Mix.jpg', inrPrice:55, inrOldPrice:70},
{id:38,  name:'Watercress',             cat:'Vegetables', emoji:'🥬', price:2.80, old:null,  unit:'per bunch',  badges:[],       pct:null,  sku:'GPNX-038', tags:'Organic, Peppery, Leafy',     img:SUPABASE_IMG+'/Watercress.jpg', inrPrice:15, inrOldPrice:20},
{id:39,  name:'Yam (Purple)',           cat:'Vegetables', emoji:'🥔', price:4.50, old:5.50,  unit:'per kg',     badges:[],       pct:null,  sku:'GPNX-039', tags:'Organic, Purple, Antioxidant', img:SUPABASE_IMG+'/Purple Sweet Potato.jpg', inrPrice:35, inrOldPrice:44},
{id:40,  name:'Bitter Melon',           cat:'Vegetables', emoji:'🥒', price:2.60, old:3.20,  unit:'per 500g',   badges:[],          pct:null,  sku:'GPNX-040', tags:'Fresh, Medicinal, Asian',     img:SUPABASE_IMG+'/Bitter Melon.jpg', inrPrice:22, inrOldPrice:28},
{id:41,  name:'Iceberg Lettuce',        cat:'Vegetables', emoji:'🥬', price:2.90, old:null,  unit:'per pc',     badges:[],          pct:null,  sku:'GPNX-041', tags:'Fresh, Crisp, Salad',         img:SUPABASE_IMG+'/Iceberg Lettuce.jpg', inrPrice:20, inrOldPrice:25},
{id:42,  name:'Butterhead Lettuce',     cat:'Vegetables', emoji:'🥬', price:3.20, old:3.90,  unit:'per pc',     badges:[],       pct:null,  sku:'GPNX-042', tags:'Organic, Tender, Salad',      img:SUPABASE_IMG+'/Cos Lettuce.jpg', inrPrice:25, inrOldPrice:30},
{id:43,  name:'Turnip',                 cat:'Vegetables', emoji:'🥔', price:2.40, old:null,  unit:'per kg',     badges:[],       pct:null,  sku:'GPNX-043', tags:'Organic, Root, Farm',         img:SUPABASE_IMG+'/Fresh Turnips.jpg', inrPrice:35, inrOldPrice:44},
{id:44,  name:'Fennel Bulb',            cat:'Vegetables', emoji:'🫛', price:4.20, old:5.00,  unit:'per pc',     badges:[],       pct:null,  sku:'GPNX-044', tags:'Organic, Anise, Premium',     img:SUPABASE_IMG+'/Fresh Fennel.jpg', inrPrice:40, inrOldPrice:50},
{id:45,  name:'Pointed Gourd',          cat:'Vegetables', emoji:'🥒', price:2.80, old:3.50,  unit:'per 500g',   badges:[],          pct:null,  sku:'GPNX-045', tags:'Fresh, Indian, Light',        img:SUPABASE_IMG+'/Pointed Gourd.jpg', inrPrice:20, inrOldPrice:25},
{id:46,  name:'Cluster Beans',          cat:'Vegetables', emoji:'🫘', price:2.50, old:null,  unit:'per 300g',   badges:[],       pct:null,  sku:'GPNX-046', tags:'Organic, Indian, Green',      img:SUPABASE_IMG+'/French Beans.jpg', inrPrice:11, inrOldPrice:14},
{id:47,  name:'Ridge Gourd',            cat:'Vegetables', emoji:'🥒', price:2.60, old:3.20,  unit:'per pc',     badges:[],          pct:null,  sku:'GPNX-047', tags:'Fresh, Indian, Summer',       img:SUPABASE_IMG+'/Ridge Gourd.jpg', inrPrice:15, inrOldPrice:19},
{id:48,  name:'Colocasia Leaves',       cat:'Vegetables', emoji:'🌿', price:2.20, old:null,  unit:'per bunch',  badges:[],       pct:null,  sku:'GPNX-048', tags:'Organic, Indian, Leafy',      img:SUPABASE_IMG+'/Colocasia Leaves.jpg', inrPrice:12, inrOldPrice:15},
{id:49,  name:'Snake Gourd',            cat:'Vegetables', emoji:'🥒', price:2.90, old:3.60,  unit:'per pc',     badges:[],          pct:null,  sku:'GPNX-049', tags:'Fresh, Long, Asian',          img:SUPABASE_IMG+'/Ridge Gourd.jpg', inrPrice:13, inrOldPrice:17},
{id:50,  name:'Banana Flower',          cat:'Vegetables', emoji:'🌸', price:3.50, old:4.20,  unit:'per pc',     badges:[],       pct:null,  sku:'GPNX-050', tags:'Organic, Indian, Unique',     img:SUPABASE_IMG+'/Banana Flower.jpg', inrPrice:6, inrOldPrice:8},

/* -- FRUITS (40 items) -- */
{id:51,  name:'Alphonso Mango',         cat:'Fruits',     emoji:'🥭', price:12.00,old:15.00, unit:'per 3 pcs',  badges:[], pct:'20%', sku:'GPNX-051', tags:'Organic, Tropical, Premium',  img:SUPABASE_IMG+'/Alphonso Mango.jpg', inrPrice:180, inrOldPrice:220},
{id:52,  name:'Fresh Bananas',          cat:'Fruits',     emoji:'🍌', price:3.20, old:4.00,  unit:'per bunch',  badges:[],       pct:null,  sku:'GPNX-052', tags:'Organic, Fresh, Tropical',    img:SUPABASE_IMG+'/Fresh Bananas.jpg', inrPrice:40, inrOldPrice:50},
{id:53,  name:'Dragon Fruit (White)',   cat:'Fruits',     emoji:'🍈', price:7.50, old:9.80,  unit:'per pc',     badges:[],            pct:null,  sku:'GPNX-053', tags:'Exotic, Premium, New',        img:SUPABASE_IMG+'/Dragon Fruit.jpg', inrPrice:75, inrOldPrice:90},
{id:54,  name:'Green Apples',           cat:'Fruits',     emoji:'🍏', price:5.80, old:7.20,  unit:'per kg',     badges:[],          pct:null,  sku:'GPNX-054', tags:'Fresh, Crispy, Healthy',      img:SUPABASE_IMG+'/Green Apples.jpg', inrPrice:220, inrOldPrice:260},
{id:55,  name:'Papaya',                 cat:'Fruits',     emoji:'🍈', price:5.50, old:7.00,  unit:'per kg',     badges:[],       pct:null,  sku:'GPNX-055', tags:'Organic, Tropical, Enzyme',   img:SUPABASE_IMG+'/Fresh Papaya.jpg', inrPrice:55, inrOldPrice:70},
{id:56,  name:'Pomegranate',            cat:'Fruits',     emoji:'🍎', price:8.80, old:11.00, unit:'per 2 pcs',  badges:[],           pct:'20%', sku:'GPNX-056', tags:'Antioxidant, Premium, Sale',  img:SUPABASE_IMG+'/Fresh Pomegranate.jpg', inrPrice:150, inrOldPrice:180},
{id:57,  name:'Fresh Pineapple',        cat:'Fruits',     emoji:'🍍', price:6.80, old:8.50,  unit:'per pc',     badges:[],          pct:null,  sku:'GPNX-057', tags:'Tropical, Sweet, Fresh',      img:SUPABASE_IMG+'/Fresh Pineapple.jpg', inrPrice:40, inrOldPrice:50},
{id:58,  name:'Watermelon',             cat:'Fruits',     emoji:'🍉', price:8.00, old:10.00, unit:'per pc',     badges:[],          pct:null,  sku:'GPNX-058', tags:'Fresh, Summer, Juicy',        img:SUPABASE_IMG+'/Watermelon.jpg', inrPrice:30, inrOldPrice:38},
{id:59,  name:'Red Grapes',             cat:'Fruits',     emoji:'🍇', price:7.20, old:9.00,  unit:'per 500g',   badges:[],       pct:null,  sku:'GPNX-059', tags:'Organic, Juicy, Antioxidant',  img:SUPABASE_IMG+'/Red Grapes.jpg', inrPrice:100, inrOldPrice:130},
{id:60,  name:'Strawberries',           cat:'Fruits',     emoji:'🍓', price:9.90, old:12.00, unit:'per 250g',   badges:[], pct:'18%', sku:'GPNX-060', tags:'Organic, Sweet, Premium',     img:SUPABASE_IMG+'/Fresh Strawberries.jpg', inrPrice:150, inrOldPrice:180},
{id:61,  name:'Orange Navel',           cat:'Fruits',     emoji:'🍊', price:6.50, old:8.00,  unit:'per kg',     badges:[],          pct:null,  sku:'GPNX-061', tags:'Fresh, Vitamin C, Juicy',     img:SUPABASE_IMG+'/Fresh Oranges.jpg', inrPrice:62, inrOldPrice:81},
{id:62,  name:'Lemon',                  cat:'Fruits',     emoji:'🍋', price:2.80, old:null,  unit:'per 6 pcs',  badges:[],       pct:null,  sku:'GPNX-062', tags:'Organic, Citrus, Zesty',      img:SUPABASE_IMG+'/Fresh Lemons.jpg', inrPrice:30, inrOldPrice:38},
{id:63,  name:'Kiwi Fruit',             cat:'Fruits',     emoji:'🥝', price:5.60, old:7.00,  unit:'per 4 pcs',  badges:[],       pct:null,  sku:'GPNX-063', tags:'Organic, Vitamin, Tangy',     img:SUPABASE_IMG+'/Kiwi Fruit.jpg', inrPrice:120, inrOldPrice:140},
{id:64,  name:'Ripe Avocado',           cat:'Fruits',     emoji:'🥑', price:6.90, old:8.50,  unit:'per 2 pcs',  badges:[],       pct:null,  sku:'GPNX-064', tags:'Organic, Healthy Fat, Premium',img:SUPABASE_IMG+'/Fresh Avocado.jpg', inrPrice:180, inrOldPrice:220},
{id:65,  name:'Blueberries',            cat:'Fruits',     emoji:'🫐', price:11.00,old:14.00, unit:'per 125g',   badges:[], pct:'21%', sku:'GPNX-065', tags:'Organic, Antioxidant, Premium',img:SUPABASE_IMG+'/Fresh Blueberries.jpg', inrPrice:200, inrOldPrice:240},
{id:66,  name:'Passion Fruit',          cat:'Fruits',     emoji:'🍈', price:6.20, old:8.00,  unit:'per 4 pcs',  badges:[],       pct:null,  sku:'GPNX-066', tags:'Organic, Tropical, Exotic',   img:SUPABASE_IMG+'/Passion Fruit.jpg', inrPrice:42, inrOldPrice:52},
{id:67,  name:'Guava',                  cat:'Fruits',     emoji:'🍈', price:3.80, old:4.80,  unit:'per 500g',   badges:[],          pct:null,  sku:'GPNX-067', tags:'Fresh, Indian, Tropical',     img:SUPABASE_IMG+'/Fresh Guava.jpg', inrPrice:54, inrOldPrice:70},
{id:68,  name:'Sapodilla (Chiku)',      cat:'Fruits',     emoji:'🍈', price:4.50, old:5.50,  unit:'per 500g',   badges:[],          pct:null,  sku:'GPNX-068', tags:'Fresh, Indian, Sweet',        img:SUPABASE_IMG+'/Sapodilla.jpg', inrPrice:46, inrOldPrice:60},
{id:69,  name:'Jackfruit',              cat:'Fruits',     emoji:'🍈', price:8.50, old:null,  unit:'per 500g',   badges:[],       pct:null,  sku:'GPNX-069', tags:'Organic, Tropical, Filling',  img:SUPABASE_IMG+'/Fresh Jackfruit.jpg', inrPrice:30, inrOldPrice:38},
{id:70,  name:'Rambutan',               cat:'Fruits',     emoji:'🍈', price:6.80, old:8.00,  unit:'per 500g',   badges:[],          pct:null,  sku:'GPNX-070', tags:'Fresh, Exotic, Southeast Asia',img:SUPABASE_IMG+'/Rambutan.jpg', inrPrice:65, inrOldPrice:81},
{id:71,  name:'Longan',                 cat:'Fruits',     emoji:'🍈', price:7.20, old:9.00,  unit:'per 500g',   badges:['Fresh'],          pct:null,  sku:'GPNX-071', tags:'Fresh, Sweet, Chinese',       img:SUPABASE_IMG+'/Longan.jpg', inrPrice:60, inrOldPrice:80},
{id:72,  name:'Star Fruit',             cat:'Fruits',     emoji:'⭐', price:4.20, old:5.00,  unit:'per 3 pcs',  badges:[],          pct:null,  sku:'GPNX-072', tags:'Fresh, Unique, Tropical',     img:SUPABASE_IMG+'/Star Fruit.jpg', inrPrice:42, inrOldPrice:60},
{id:73,  name:'Custard Apple',          cat:'Fruits',     emoji:'🍈', price:5.80, old:7.00,  unit:'per pc',     badges:[],       pct:null,  sku:'GPNX-073', tags:'Organic, Creamy, Indian',     img:SUPABASE_IMG+'/Custard Apple.jpg', inrPrice:55, inrOldPrice:70},
{id:74,  name:'Pear',                   cat:'Fruits',     emoji:'🍐', price:6.20, old:8.00,  unit:'per kg',     badges:[],       pct:null,  sku:'GPNX-074', tags:'Organic, Crisp, Sweet',       img:SUPABASE_IMG+'/Green Pears.jpg', inrPrice:100, inrOldPrice:130},
{id:75,  name:'Dates Medjool',          cat:'Fruits',     emoji:'🌴', price:12.50,old:16.00, unit:'per 250g',   badges:[], pct:'22%', sku:'GPNX-075', tags:'Organic, Premium, Energy',    img:SUPABASE_IMG+'/Medjool Dates.jpg', inrPrice:150, inrOldPrice:180},
{id:76,  name:'Fig',                    cat:'Fruits',     emoji:'🫐', price:9.90, old:12.00, unit:'per 250g',   badges:[],       pct:null,  sku:'GPNX-076', tags:'Organic, Sweet, Premium',     img:SUPABASE_IMG+'/Fresh Figs.jpg', inrPrice:120, inrOldPrice:145},
{id:77,  name:'Plums',                  cat:'Fruits',     emoji:'🫐', price:7.50, old:9.00,  unit:'per 500g',   badges:[],          pct:null,  sku:'GPNX-077', tags:'Fresh, Summer, Juicy',        img:SUPABASE_IMG+'/Fresh Plums.jpg', inrPrice:120, inrOldPrice:150},
{id:78,  name:'Cherries',               cat:'Fruits',     emoji:'🍒', price:14.00,old:18.00, unit:'per 250g',   badges:[], pct:'22%', sku:'GPNX-078', tags:'Organic, Premium, Sweet',     img:SUPABASE_IMG+'/Fresh Cherries.jpg', inrPrice:180, inrOldPrice:220},
{id:79,  name:'Red Banana',             cat:'Fruits',     emoji:'🍌', price:4.50, old:5.80,  unit:'per bunch',  badges:[],       pct:null,  sku:'GPNX-079', tags:'Organic, Unique, Sweet',      img:SUPABASE_IMG+'/Red Bananas.jpg', inrPrice:40, inrOldPrice:50},
{id:80,  name:'Coconut (Fresh)',        cat:'Fruits',     emoji:'🥥', price:3.50, old:null,  unit:'per pc',     badges:[],          pct:null,  sku:'GPNX-080', tags:'Fresh, Tropical, Hydrating',  img:SUPABASE_IMG+'/Fresh Coconut.jpg', inrPrice:22, inrOldPrice:28},
{id:81,  name:'Soursop',                cat:'Fruits',     emoji:'🍈', price:8.90, old:11.00, unit:'per pc',     badges:['Organic'],       pct:null,  sku:'GPNX-081', tags:'Organic, Exotic, Tropical',   img:SUPABASE_IMG+'/Soursop.jpg', inrPrice:50, inrOldPrice:65},
{id:82,  name:'Peaches',                cat:'Fruits',     emoji:'🍑', price:8.50, old:10.50, unit:'per kg',     badges:[], pct:'19%', sku:'GPNX-082', tags:'Organic, Sweet, Summer',      img:SUPABASE_IMG+'/Fresh Peaches.jpg', inrPrice:150, inrOldPrice:190},
{id:83,  name:'Raspberries',            cat:'Fruits',     emoji:'🫐', price:9.50, old:12.00, unit:'per 125g',   badges:[],       pct:null,  sku:'GPNX-083', tags:'Organic, Tart, Premium',      img:SUPABASE_IMG+'/Fresh Raspberries.jpg', inrPrice:200, inrOldPrice:240},
{id:84,  name:'Mandarin Oranges',       cat:'Fruits',     emoji:'🍊', price:7.80, old:9.50,  unit:'per kg',     badges:[],          pct:null,  sku:'GPNX-084', tags:'Fresh, Sweet, Vitamin C',     img:SUPABASE_IMG+'/Mandarin Oranges.jpg', inrPrice:62, inrOldPrice:81},
{id:85,  name:'Tamarind',               cat:'Fruits',     emoji:'🫘', price:3.20, old:null,  unit:'per 250g',   badges:[],       pct:null,  sku:'GPNX-085', tags:'Organic, Sour, Indian',       img:SUPABASE_IMG+'/Fresh Tamarind.jpg', inrPrice:25, inrOldPrice:32},
{id:86,  name:'Grape Fruit',            cat:'Fruits',     emoji:'🍊', price:5.90, old:7.20,  unit:'per pc',     badges:[],       pct:null,  sku:'GPNX-086', tags:'Organic, Citrus, Bitter',     img:SUPABASE_IMG+'/Grape Fruit.jpg', inrPrice:65, inrOldPrice:80},
{id:87,  name:'Cantaloupe Melon',       cat:'Fruits',     emoji:'🍈', price:6.50, old:8.00,  unit:'per pc',     badges:[],          pct:null,  sku:'GPNX-087', tags:'Fresh, Sweet, Summer',        img:SUPABASE_IMG+'/Muskmelon.jpg', inrPrice:40, inrOldPrice:50},
{id:88,  name:'Lychee',                 cat:'Fruits',     emoji:'🍈', price:8.80, old:11.00, unit:'per 500g',   badges:[],          pct:null,  sku:'GPNX-088', tags:'Fresh, Exotic, Sweet',        img:SUPABASE_IMG+'/Fresh Lychee.jpg', inrPrice:180, inrOldPrice:220},
{id:89,  name:'Apricots',               cat:'Fruits',     emoji:'🍑', price:9.20, old:11.00, unit:'per 500g',   badges:[],       pct:null,  sku:'GPNX-089', tags:'Organic, Dried, Iron',        img:SUPABASE_IMG+'/Fresh Apricots.jpg', inrPrice:120, inrOldPrice:145},
{id:90,  name:'Banana Blossom',         cat:'Fruits',     emoji:'🌸', price:3.90, old:null,  unit:'per pc',     badges:[],          pct:null,  sku:'GPNX-090', tags:'Fresh, Unique, Asian',        img:SUPABASE_IMG+'/Banana Blossom.jpg', inrPrice:20, inrOldPrice:25},

/* -- BEVERAGES (20 items) -- */
{id:91,  name:'Cold-Pressed Juice Mix', cat:'Beverages',  emoji:'🧃', price:8.90, old:11.00, unit:'per 500ml',  badges:[],       pct:null,  sku:'GPNX-091', tags:'Organic, Fresh, Pressed',     img:SUPABASE_IMG+'/Cold-Pressed Juice Mix.jpg', inrPrice:120, inrOldPrice:150},
{id:92,  name:'Coconut Water',          cat:'Beverages',  emoji:'🥥', price:4.50, old:5.80,  unit:'per 500ml',  badges:[],       pct:null,  sku:'GPNX-092', tags:'Organic, Hydrating, Natural',  img:SUPABASE_IMG+'/Tender Coconut Water.jpg', inrPrice:80, inrOldPrice:100},
{id:93,  name:'Turmeric Latte Mix',     cat:'Beverages',  emoji:'☕', price:8.90, old:11.00, unit:'per 500ml',   badges:[],       pct:'19%', sku:'GPNX-093', tags:'Organic, Golden, Wellness',   img:SUPABASE_IMG+'/Turmeric Latte Mix.jpg', inrPrice:120, inrOldPrice:150},
{id:94,  name:'Herbal Green Tea',       cat:'Beverages',  emoji:'🍵', price:7.20, old:9.50,  unit:'per 500ml',badges:[], pct:'24%', sku:'GPNX-094', tags:'Organic, Antioxidant, Herbal', img:SUPABASE_IMG+'/Herbal Green Tea.jpg', inrPrice:90, inrOldPrice:110},
{id:95,  name:'Sugarcane Juice',        cat:'Beverages',  emoji:'🧃', price:3.80, old:null,  unit:'per 300ml',  badges:['New'],            pct:null,  sku:'GPNX-095', tags:'Fresh, Natural, Sweet',       img:SUPABASE_IMG+'/Sugarcane Juice.jpg', inrPrice:45, inrOldPrice:56},
{id:96,  name:'Mango Lassi',            cat:'Beverages',  emoji:'🥭', price:5.50, old:null,  unit:'per 400ml',  badges:['New'],            pct:null,  sku:'GPNX-096', tags:'Indian, Probiotic, Sweet',    img:SUPABASE_IMG+'/Mango Lassi.jpg', inrPrice:60, inrOldPrice:75},
{id:97,  name:'Rose Milk',              cat:'Beverages',  emoji:'🥛', price:4.20, old:5.00,  unit:'per 300ml',  badges:['Fresh'],          pct:null,  sku:'GPNX-097', tags:'Indian, Floral, Sweet',       img:SUPABASE_IMG+'/Rose Milk.jpg', inrPrice:45, inrOldPrice:56},
{id:98,  name:'Nannari Sarbath',        cat:'Beverages',  emoji:'🧃', price:4.50, old:5.50,  unit:'per 400ml',  badges:['Organic'],       pct:null,  sku:'GPNX-098', tags:'Organic, Indian, Herbal',     img:SUPABASE_IMG+'/Nannari Sarbath.jpg', inrPrice:50, inrOldPrice:62},
{id:99,  name:'Aloe Vera Juice',        cat:'Beverages',  emoji:'🧃', price:6.80, old:8.50,  unit:'per 500ml',  badges:['Organic'],       pct:null,  sku:'GPNX-099', tags:'Organic, Soothing, Wellness',  img:SUPABASE_IMG+'/Aloe Vera Juice.jpg', inrPrice:75, inrOldPrice:94},
{id:100, name:'Tender Coconut Water',   cat:'Beverages',  emoji:'🥥', price:3.50, old:null,  unit:'per 500ml',     badges:['Fresh'],          pct:null,  sku:'GPNX-100', tags:'Fresh, Natural, Young',       img:SUPABASE_IMG+'/Tender Coconut Water.jpg', inrPrice:30, inrOldPrice:38},
{id:101, name:'Amla Juice',             cat:'Beverages',  emoji:'🧃', price:5.90, old:7.50,  unit:'per 500ml',  badges:['Organic'],       pct:null,  sku:'GPNX-101', tags:'Organic, Vitamin C, Ayurvedic',img:SUPABASE_IMG+'/Amla Juice.jpg', inrPrice:80, inrOldPrice:100},
{id:102, name:'Moringa Tea',            cat:'Beverages',  emoji:'🍵', price:7.50, old:9.00,  unit:'per 300ml',badges:['Organic'],       pct:null,  sku:'GPNX-102', tags:'Organic, Superfood, Herbal',  img:SUPABASE_IMG+'/Herbal Moringa Tea.jpg', inrPrice:80, inrOldPrice:100},
{id:103, name:'Tamarind Drink',         cat:'Beverages',  emoji:'🧃', price:3.90, old:null,  unit:'per 300ml',  badges:['Fresh'],          pct:null,  sku:'GPNX-103', tags:'Fresh, Sour, Indian',         img:SUPABASE_IMG+'/Tamarind Drink.jpg', inrPrice:45, inrOldPrice:56},
{id:104, name:'Carrot-Ginger Juice',    cat:'Beverages',  emoji:'🥕', price:5.20, old:6.50,  unit:'per 300ml',  badges:['Organic'],       pct:null,  sku:'GPNX-104', tags:'Organic, Cleansing, Fresh',   img:SUPABASE_IMG+'/Carrot-Ginger Juice.jpg', inrPrice:60, inrOldPrice:75},
{id:105, name:'Hibiscus Iced Tea',      cat:'Beverages',  emoji:'🍵', price:6.20, old:7.80,  unit:'per 500ml',  badges:['Organic'],       pct:null,  sku:'GPNX-105', tags:'Organic, Floral, Refreshing',  img:SUPABASE_IMG+'/Hibiscus Iced Tea.jpg', inrPrice:85, inrOldPrice:105},
{id:106, name:'Vetiver Cooler',         cat:'Beverages',  emoji:'🧃', price:4.80, old:null,  unit:'per 400ml',  badges:['Organic'],       pct:null,  sku:'GPNX-106', tags:'Organic, Cooling, Indian',    img:SUPABASE_IMG+'/Vetiver Cooler.jpg', inrPrice:55, inrOldPrice:70},
{id:107, name:'Barley Water',           cat:'Beverages',  emoji:'🧃', price:4.20, old:5.00,  unit:'per 500ml',  badges:[],       pct:null,  sku:'GPNX-107', tags:'Organic, Cleansing, Ancient',  img:SUPABASE_IMG+'/Barley Water.jpg', inrPrice:50, inrOldPrice:62},
{id:108, name:'Kokum Sherbet',          cat:'Beverages',  emoji:'🧃', price:4.90, old:6.00,  unit:'per 400ml',  badges:['Organic'],       pct:null,  sku:'GPNX-108', tags:'Organic, Indian, Digestive',   img:SUPABASE_IMG+'/Kokum Sherbat.jpg', inrPrice:65, inrOldPrice:80},
{id:109, name:'Jamun Juice',            cat:'Beverages',  emoji:'🧃', price:6.50, old:8.00,  unit:'per 500ml',  badges:['Organic'],       pct:null,  sku:'GPNX-109', tags:'Organic, Diabetic-Friendly, Rich',img:SUPABASE_IMG+'/Jamun Juice.jpg', inrPrice:80, inrOldPrice:100},
{id:110, name:'Pineapple Vinegar',      cat:'Beverages',  emoji:'🧃', price:9.50, old:12.00, unit:'per 500ml',  badges:['Organic'],       pct:null,  sku:'GPNX-110', tags:'Organic, Probiotic, Wellness',  img:SUPABASE_IMG+'/Pineapple Vinegar.jpg', inrPrice:120, inrOldPrice:150},
{img:SUPABASE_IMG+'/Masala Chai.jpg', id:185, name:'Masala Chai', cat:'Beverages', emoji:'🍵', price:5.50, old:null, unit:'per 500ml', badges:[], pct:null, sku:'GPNX-185', tags:'Indian, Spiced, Aromatic', inrPrice:340, inrOldPrice:425},
{img:SUPABASE_IMG+'/Fresh Orange Juice.jpg', id:186, name:'Fresh Orange Juice', cat:'Beverages', emoji:'🍊', price:4.50, old:null, unit:'per 500ml', badges:[], pct:null, sku:'GPNX-186', tags:'Fresh, Vitamin C, Natural', inrPrice:280, inrOldPrice:350},
{img:SUPABASE_IMG+'/Iced Coffee.jpg', id:187, name:'Iced Coffee', cat:'Beverages', emoji:'☕', price:5.90, old:null, unit:'per 400ml', badges:[], pct:null, sku:'GPNX-187', tags:'Cold, Brewed, Energizing', inrPrice:365, inrOldPrice:455},
{img:SUPABASE_IMG+'/Jasmine Green Tea.jpg', id:188, name:'Jasmine Green Tea', cat:'Beverages', emoji:'🍃', price:6.90, old:null, unit:'per 500ml', badges:[], pct:null, sku:'GPNX-188', tags:'Organic, Floral, Soothing', inrPrice:425, inrOldPrice:530},
{img:SUPABASE_IMG+'/Protein shake.jpg', id:189, name:'Protein Shake', cat:'Beverages', emoji:'🥤', price:7.50, old:null, unit:'per 400ml', badges:[], pct:null, sku:'GPNX-189', tags:'Protein, Fitness, Healthy', inrPrice:465, inrOldPrice:580},

/* -- GROCERIES (40 items) -- */
{id:111, name:'Basmati Rice',           cat:'Groceries',  emoji:'🌾', price:9.80, old:12.50, unit:'per 2kg',    badges:[],       pct:null,  sku:'GPNX-111', tags:'Organic, Aromatic, Grain',    img:SUPABASE_IMG+'/Basmati Rice.jpg', inrPrice:250, inrOldPrice:300},
{id:112, name:'Cold-Pressed Coconut Oil',cat:'Groceries', emoji:'🫙', price:14.50,old:18.00, unit:'per 500ml',  badges:[], pct:null, sku:'GPNX-112', tags:'Organic, Cold-Pressed, Premium',img:SUPABASE_IMG+'/Cold Pressed Coconut Oil.jpg', inrPrice:450, inrOldPrice:550},
{id:113, name:'Garlic Bulbs',           cat:'Groceries',  emoji:'🧄', price:3.90, old:5.00,  unit:'per 250g',   badges:[],       pct:null,  sku:'GPNX-113', tags:'Organic, Aromatic, Kitchen',  img:SUPABASE_IMG+'/Whole Garlic Bulbs.jpg', inrPrice:150, inrOldPrice:180},
{id:114, name:'Free Range Eggs',        cat:'Groceries',  emoji:'🥚', price:6.50, old:8.00,  unit:'per 12 pcs', badges:[],  pct:null,  sku:'GPNX-114', tags:'Organic, Free-Range, Protein', img:SUPABASE_IMG+'/Free Range Eggs.jpg', inrPrice:220, inrOldPrice:265},
{id:115, name:'Moringa Powder',         cat:'Groceries',  emoji:'🌿', price:11.00,old:14.00, unit:'per 150g',   badges:[],       pct:null,  sku:'GPNX-115', tags:'Superfood, Organic, Wellness',  img:SUPABASE_IMG+'/Moringa Powder.jpg', inrPrice:350, inrOldPrice:420},
{id:116, name:'Chickpeas',              cat:'Groceries',  emoji:'🫘', price:5.20, old:null,  unit:'per 500g',   badges:[],       pct:null,  sku:'GPNX-116', tags:'Organic, Protein, Vegan',     img:SUPABASE_IMG+'/Chickpeas.jpg', inrPrice:120, inrOldPrice:150},
{id:117, name:'Red Lentils (Masoor)',   cat:'Groceries',  emoji:'🫘', price:4.80, old:6.00,  unit:'per 500g',   badges:[],       pct:null,  sku:'GPNX-117', tags:'Organic, Protein, Indian',    img:SUPABASE_IMG+'/Red Lentils (Masoor).jpg', inrPrice:110, inrOldPrice:130},
{id:118, name:'Yellow Lentils (Toor)',  cat:'Groceries',  emoji:'🫘', price:5.50, old:7.00,  unit:'per 500g',   badges:[],       pct:null,  sku:'GPNX-118', tags:'Organic, Dal, Indian',        img:SUPABASE_IMG+'/Yellow Lentils.jpg', inrPrice:120, inrOldPrice:150},
{id:119, name:'Whole Black Pepper',     cat:'Groceries',  emoji:'⚫', price:6.80, old:8.50,  unit:'per 100g',   badges:[],       pct:null,  sku:'GPNX-119', tags:'Organic, Spice, Pungent',     img:SUPABASE_IMG+'/Whole Black Pepper.jpg', inrPrice:300, inrOldPrice:380},
{id:120, name:'Turmeric Powder',        cat:'Groceries',  emoji:'🟡', price:4.20, old:5.50,  unit:'per 200g',   badges:[],       pct:null,  sku:'GPNX-120', tags:'Organic, Spice, Healing',     img:SUPABASE_IMG+'/Turmeric Powder.jpg', inrPrice:150, inrOldPrice:180},
{id:121, name:'Cumin Seeds',            cat:'Groceries',  emoji:'🟤', price:3.80, old:null,  unit:'per 100g',   badges:[],       pct:null,  sku:'GPNX-121', tags:'Organic, Aromatic, Spice',    img:SUPABASE_IMG+'/Cumin Seeds.jpg', inrPrice:120, inrOldPrice:150},
{id:122, name:'Coriander Seeds',        cat:'Groceries',  emoji:'🟤', price:3.50, old:null,  unit:'per 100g',   badges:[],       pct:null,  sku:'GPNX-122', tags:'Organic, Spice, Fresh',       img:SUPABASE_IMG+'/Coriander Seeds.jpg', inrPrice:100, inrOldPrice:120},
{id:123, name:'Cardamom (Green)',       cat:'Groceries',  emoji:'🟢', price:8.90, old:11.00, unit:'per 50g',    badges:['Organic','Sale'], pct:'19%', sku:'GPNX-123', tags:'Organic, Aromatic, Spice',    img:SUPABASE_IMG+'/Green Cardamom Pods.jpg', inrPrice:600, inrOldPrice:750},
{id:124, name:'Cinnamon Sticks',        cat:'Groceries',  emoji:'🟤', price:5.20, old:6.50,  unit:'per 50g',    badges:['Organic'],       pct:null,  sku:'GPNX-124', tags:'Organic, Sweet Spice, Warm',  img:SUPABASE_IMG+'/Cinnamon Sticks.jpg', inrPrice:200, inrOldPrice:260},
{id:125, name:'Cloves',                 cat:'Groceries',  emoji:'⚫', price:6.50, old:8.00,  unit:'per 50g',    badges:[],       pct:null,  sku:'GPNX-125', tags:'Organic, Intense, Spice',     img:SUPABASE_IMG+'/Cloves.jpg', inrPrice:400, inrOldPrice:500},
{id:126, name:'Sesame Seeds (White)',   cat:'Groceries',  emoji:'⚪', price:4.20, old:null,  unit:'per 250g',   badges:[],       pct:null,  sku:'GPNX-126', tags:'Organic, Calcium, Nutty',     img:SUPABASE_IMG+'/Sesame Seeds.jpg', inrPrice:120, inrOldPrice:150},
{id:127, name:'Mustard Seeds',          cat:'Groceries',  emoji:'🟡', price:2.80, old:null,  unit:'per 200g',   badges:['Organic'],       pct:null,  sku:'GPNX-127', tags:'Organic, Tempering, Spice',   img:SUPABASE_IMG+'/Mustard Seeds.jpg', inrPrice:80, inrOldPrice:100},
{id:128, name:'Fenugreek Seeds',        cat:'Groceries',  emoji:'🟤', price:3.20, old:null,  unit:'per 200g',   badges:['Organic'],       pct:null,  sku:'GPNX-128', tags:'Organic, Bitter, Medicinal',  img:SUPABASE_IMG+'/Fenugreek Seeds.jpg', inrPrice:90, inrOldPrice:110},
{id:129, name:'Groundnut Oil',          cat:'Groceries',  emoji:'🫙', price:12.50,old:15.00, unit:'per 1L',     badges:['Organic'],       pct:null,  sku:'GPNX-129', tags:'Organic, Cooking, Traditional',img:SUPABASE_IMG+'/Groundnut Oil.jpg', inrPrice:450, inrOldPrice:560},
{id:130, name:'Jaggery (Cane)',         cat:'Groceries',  emoji:'🟤', price:4.90, old:6.00,  unit:'per 500g',   badges:['Organic'],       pct:null,  sku:'GPNX-130', tags:'Organic, Natural Sugar, Indian',img:SUPABASE_IMG+'/Cane Jaggery.jpg', inrPrice:120, inrOldPrice:150},
{id:131, name:'Honey (Raw Wildflower)', cat:'Groceries',  emoji:'🍯', price:14.90,old:18.00, unit:'per 500g',   badges:[], pct:'17%', sku:'GPNX-131', tags:'Organic, Raw, Premium',       img:SUPABASE_IMG+'/Honey (Raw Wildflower).jpg', inrPrice:650, inrOldPrice:800},
{id:132, name:'Ghee (Cow Milk)',        cat:'Groceries',  emoji:'🧈', price:18.00,old:22.00, unit:'per 500g',   badges:['Organic'],       pct:null,  sku:'GPNX-132', tags:'Organic, Clarified Butter, Pure',img:SUPABASE_IMG+'/Ghee (Cow Milk).jpg', inrPrice:800, inrOldPrice:950},
{id:133, name:'Tapioca Flour',          cat:'Groceries',  emoji:'⚪', price:4.50, old:null,  unit:'per 500g',   badges:['Organic'],       pct:null,  sku:'GPNX-133', tags:'Organic, Gluten-Free, Baking',img:SUPABASE_IMG+'/Tapioca Flour.jpg', inrPrice:150, inrOldPrice:180},
{id:134, name:'Ragi Flour (Millet)',    cat:'Groceries',  emoji:'🟤', price:5.80, old:7.20,  unit:'per 500g',   badges:['Organic'],       pct:null,  sku:'GPNX-134', tags:'Organic, Millet, Iron-Rich',  img:SUPABASE_IMG+'/Ragi Flour (Finger Millet).jpg', inrPrice:200, inrOldPrice:250},
{id:135, name:'Quinoa',                 cat:'Groceries',  emoji:'⚪', price:11.90,old:15.00, unit:'per 500g',   badges:['Organic'],       pct:null,  sku:'GPNX-135', tags:'Organic, Protein, Superfood',  img:SUPABASE_IMG+'/Organic Quinoa.jpg', inrPrice:120, inrOldPrice:150},
{id:136, name:'Oats (Rolled)',          cat:'Groceries',  emoji:'⚪', price:6.50, old:null,  unit:'per 500g',   badges:['Organic'],       pct:null,  sku:'GPNX-136', tags:'Organic, Fibre, Breakfast',   img:SUPABASE_IMG+'/Oats (Rolled).jpg', inrPrice:150, inrOldPrice:180},
{id:137, name:'Almonds',                cat:'Groceries',  emoji:'🥜', price:15.90,old:19.00, unit:'per 250g',   badges:['Organic','Sale'], pct:'16%', sku:'GPNX-137', tags:'Organic, Nut, Protein',       img:SUPABASE_IMG+'/Almonds.jpg', inrPrice:180, inrOldPrice:220},
{id:138, name:'Cashew Nuts',            cat:'Groceries',  emoji:'🥜', price:14.50,old:18.00, unit:'per 250g',   badges:['Organic'],       pct:null,  sku:'GPNX-138', tags:'Organic, Creamy, Nut',        img:SUPABASE_IMG+'/Cashew Nuts.jpg', inrPrice:400, inrOldPrice:500},
{id:139, name:'Walnut Kernels',         cat:'Groceries',  emoji:'🥜', price:16.90,old:20.00, unit:'per 250g',   badges:['Organic'],       pct:null,  sku:'GPNX-139', tags:'Organic, Brain Food, Nut',    img:SUPABASE_IMG+'/Walnut Kernels.jpg', inrPrice:300, inrOldPrice:380},
{id:140, name:'Flaxseeds',              cat:'Groceries',  emoji:'🟤', price:4.80, old:6.00,  unit:'per 250g',   badges:['Organic'],       pct:null,  sku:'GPNX-140', tags:'Organic, Omega-3, Superfood',  img:SUPABASE_IMG+'/Flaxseeds.jpg', inrPrice:350, inrOldPrice:450},
{id:141, name:'Chia Seeds',             cat:'Groceries',  emoji:'⚫', price:7.90, old:9.50,  unit:'per 250g',   badges:['Organic'],       pct:null,  sku:'GPNX-141', tags:'Organic, Superfood, Hydrating',img:SUPABASE_IMG+'/Chia Seeds.jpg', inrPrice:120, inrOldPrice:150},
{id:142, name:'Sunflower Seeds',        cat:'Groceries',  emoji:'🟡', price:4.50, old:null,  unit:'per 250g',   badges:['Organic'],       pct:null,  sku:'GPNX-142', tags:'Organic, Vitamin E, Snack',   img:SUPABASE_IMG+'/Sunflower Seeds.jpg', inrPrice:150, inrOldPrice:180},
{id:143, name:'Pumpkin Seeds',          cat:'Groceries',  emoji:'🟡', price:6.80, old:8.50,  unit:'per 250g',   badges:['Organic'],       pct:null,  sku:'GPNX-143', tags:'Organic, Zinc, Snack',        img:SUPABASE_IMG+'/Pumpkin Seeds.jpg', inrPrice:180, inrOldPrice:220},
{id:144, name:'Dry Red Chilli',         cat:'Groceries',  emoji:'🌶️', price:3.50, old:4.50,  unit:'per 100g',   badges:['Organic'],       pct:null,  sku:'GPNX-144', tags:'Organic, Spicy, Indian',      img:SUPABASE_IMG+'/Dry Red Chilli.jpg', inrPrice:150, inrOldPrice:180},
{id:145, name:'Star Anise',             cat:'Groceries',  emoji:'⭐', price:4.90, old:null,  unit:'per 50g',    badges:['Organic'],       pct:null,  sku:'GPNX-145', tags:'Organic, Anise, Fragrant',    img:SUPABASE_IMG+'/Star Anise.jpg', inrPrice:200, inrOldPrice:250},
{id:146, name:'Dried Mango Powder',     cat:'Groceries',  emoji:'🟡', price:5.20, old:6.50,  unit:'per 100g',   badges:['Organic'],       pct:null,  sku:'GPNX-146', tags:'Organic, Tangy, Indian',      img:SUPABASE_IMG+'/Dried Mango Powder (Amchur).jpg', inrPrice:80, inrOldPrice:100},
{id:147, name:'Tamarind Paste',         cat:'Groceries',  emoji:'🟤', price:3.90, old:4.80,  unit:'per 200g',   badges:['Organic'],       pct:null,  sku:'GPNX-147', tags:'Organic, Sour, Indian',       img:SUPABASE_IMG+'/Tamarind Paste.jpg', inrPrice:120, inrOldPrice:150},
{id:148, name:'Coconut Milk',           cat:'Groceries',  emoji:'🥥', price:4.20, old:5.50,  unit:'per 400ml',  badges:['Organic'],       pct:null,  sku:'GPNX-148', tags:'Organic, Creamy, Dairy-Free',  img:SUPABASE_IMG+'/Coconut Milk.jpg', inrPrice:300, inrOldPrice:380},
{id:149, name:'Brown Rice',             cat:'Groceries',  emoji:'🌾', price:8.90, old:11.00, unit:'per 2kg',    badges:['Organic'],       pct:null,  sku:'GPNX-149', tags:'Organic, Wholegrain, Fibre',  img:SUPABASE_IMG+'/Brown Rice.jpg', inrPrice:80, inrOldPrice:100},
{id:150, name:'Mung Beans (Green)',     cat:'Groceries',  emoji:'🫘', price:4.50, old:5.80,  unit:'per 500g',   badges:['Organic'],       pct:null,  sku:'GPNX-150', tags:'Organic, Sprouting, Protein',  img:SUPABASE_IMG+'/Mung Beans (Green) 1.jpg', inrPrice:100, inrOldPrice:120},
{id:151, name:'Dried Chilli Flakes',    cat:'Groceries',  emoji:'🌶️', price:3.20, old:null,  unit:'per 100g',   badges:['Organic'],       pct:null,  sku:'GPNX-151', tags:'Organic, Spicy, Topping',     img:SUPABASE_IMG+'/Dried Chilli Flakes.jpg', inrPrice:120, inrOldPrice:150},
{id:152, name:'Dried Fenugreek Leaves', cat:'Groceries',  emoji:'🌿', price:4.20, old:5.20,  unit:'per 100g',   badges:[],       pct:null,  sku:'GPNX-152', tags:'Organic, Kasuri Methi, Indian',img:SUPABASE_IMG+'/Dried Fenugreek Leaves (Kasuri Methi).jpg', inrPrice:90, inrOldPrice:110},
{id:153, name:'Asafoetida (Hing)',      cat:'Groceries',  emoji:'🟤', price:5.50, old:null,  unit:'per 50g',    badges:[],       pct:null,  sku:'GPNX-153', tags:'Organic, Pungent, Digestive',  img:SUPABASE_IMG+'/Asafoetida.jpg', inrPrice:80, inrOldPrice:100},
          {id:154, name:'Dried Coconut (Kopra)',  cat:'Groceries',  emoji:'🥥', price:6.80, old:8.50,  unit:'per 500g',   badges:['Organic'],       pct:null,  sku:'GPNX-154', tags:'Organic, Dessert, Cooking',   img:SUPABASE_IMG+'/Dried Coconut (Kopra).jpg', inrPrice:120, inrOldPrice:150},
];

const BOX_EXTRA_PRODS = [
{id:156, name:'Pomelo',                  cat:'Fruits',     emoji:'🍊', price:3.90, old:null,  unit:'per pc',     badges:['Fresh'],    pct:null, sku:'GPNX-156', tags:'Fresh, Unique, Asian',        img:SUPABASE_IMG+'/Fresh Papaya.jpg', inrPrice:30, inrOldPrice:38},
{id:157, name:'Mangosteen',              cat:'Fruits',     emoji:'🍈', price:3.90, old:null,  unit:'per pc',     badges:['Fresh'],    pct:null, sku:'GPNX-157', tags:'Fresh, Unique, Asian',        img:SUPABASE_IMG+'/Rambutan.jpg', inrPrice:85, inrOldPrice:105},
{id:158, name:'Langsat',                 cat:'Fruits',     emoji:'🍈', price:3.90, old:null,  unit:'per pc',     badges:['Fresh'],    pct:null, sku:'GPNX-158', tags:'Fresh, Unique, Asian',        img:SUPABASE_IMG+'/Longan.jpg', inrPrice:40, inrOldPrice:52},
{id:159, name:'Salak',                   cat:'Fruits',     emoji:'🍍', price:3.90, old:null,  unit:'per pc',     badges:['Fresh'],    pct:null, sku:'GPNX-159', tags:'Fresh, Unique, Asian',        img:SUPABASE_IMG+'/Snake Fruit.jpg', inrPrice:35, inrOldPrice:45},
{id:160, name:'Java Apple',              cat:'Fruits',     emoji:'🍎', price:3.90, old:null,  unit:'per pc',     badges:['Fresh'],    pct:null, sku:'GPNX-160', tags:'Fresh, Unique, Asian',        img:SUPABASE_IMG+'/Star Fruit.jpg', inrPrice:50, inrOldPrice:65},
{id:170, name:'Malay Gooseberry',        cat:'Fruits',     emoji:'🍈', price:3.90, old:null,  unit:'per pc',     badges:['Fresh'],    pct:null, sku:'GPNX-170', tags:'Fresh, Unique, Asian',        img:SUPABASE_IMG+'/Fresh Guava.jpg', inrPrice:40, inrOldPrice:52},
{id:171, name:'Rose Myrtle',             cat:'Fruits',     emoji:'🫐', price:3.90, old:null,  unit:'per pc',     badges:['Fresh'],    pct:null, sku:'GPNX-171', tags:'Fresh, Unique, Asian',        img:SUPABASE_IMG+'/Fresh Plums.jpg', inrPrice:35, inrOldPrice:45},
{id:172, name:'Snake Fruit',             cat:'Fruits',     emoji:'🍍', price:3.90, old:null,  unit:'per pc',     badges:['Fresh'],    pct:null, sku:'GPNX-172', tags:'Fresh, Unique, Asian',        img:SUPABASE_IMG+'/Snake Fruit.jpg', inrPrice:30, inrOldPrice:40},
{id:173, name:'Durian',                  cat:'Fruits',     emoji:'🍈', price:3.90, old:null,  unit:'per pc',     badges:['Fresh'],    pct:null, sku:'GPNX-173', tags:'Fresh, Unique, Asian',        img:SUPABASE_IMG+'/Fresh Jackfruit.jpg', inrPrice:120, inrOldPrice:150},
{id:174, name:'Rose Apple',              cat:'Fruits',     emoji:'🍎', price:3.90, old:null,  unit:'per pc',     badges:['Fresh'],    pct:null, sku:'GPNX-174', tags:'Fresh, Unique, Asian',        img:SUPABASE_IMG+'/Fresh Cherries.jpg', inrPrice:40, inrOldPrice:52},
{id:175, name:'Golden Delicious Apples', cat:'Fruits',     emoji:'🍎', price:3.90, old:null,  unit:'per pc',     badges:['Fresh'],    pct:null, sku:'GPNX-175', tags:'Fresh, Unique, Asian',        img:SUPABASE_IMG+'/Golden Delicious Apples.jpg', inrPrice:35, inrOldPrice:45},
{id:176, name:'Peanut Oil',              cat:'Groceries',  emoji:'🫙', price:10.50,old:13.00, unit:'per 250ml',  badges:['Organic'],  pct:null, sku:'GPNX-176', tags:'Organic, Rich, Asian Cooking', img:SUPABASE_IMG+'/Cold Pressed Peanut Oil.jpg', inrPrice:120, inrOldPrice:150},
{id:177, name:'Raw Peanuts',             cat:'Groceries',  emoji:'🥜', price:10.50,old:13.00, unit:'per 250g',   badges:['Organic'],  pct:null, sku:'GPNX-177', tags:'Organic, Rich, Snack',         img:SUPABASE_IMG+'/Raw Peanuts (With Shells).jpg', inrPrice:100, inrOldPrice:120},
{id:178, name:'Sesame Oil',              cat:'Groceries',  emoji:'🫙', price:10.50,old:13.00, unit:'per 250ml',  badges:['Organic'],  pct:null, sku:'GPNX-178', tags:'Organic, Rich, Asian Cooking', img:SUPABASE_IMG+'/Pressed Sesame Oil.jpg', inrPrice:80, inrOldPrice:100},
{id:179, name:'Frozen Vegetables',       cat:'Groceries',  emoji:'🥦', price:10.50,old:13.00, unit:'per pack',   badges:['Organic'],  pct:null, sku:'GPNX-179', tags:'Organic, Frozen, Convenient',   img:SUPABASE_IMG+'/Frozen Mixed Vegetables.jpg', inrPrice:120, inrOldPrice:150},
{id:180, name:'Butter',                  cat:'Groceries',  emoji:'🧈', price:10.50,old:13.00, unit:'per 250g',   badges:['Organic'],  pct:null, sku:'GPNX-180', tags:'Organic, Dairy, Creamy',        img:SUPABASE_IMG+'/Premium Dairy Butter.jpg', inrPrice:450, inrOldPrice:550},
{id:181, name:'Farm Fresh Cow Ghee',     cat:'Groceries',  emoji:'🧈', price:10.50,old:13.00, unit:'per 250ml',  badges:['Organic'],  pct:null, sku:'GPNX-181', tags:'Organic, Dairy, Pure',          img:SUPABASE_IMG+'/Farm Fresh Cow Ghee.jpg', inrPrice:200, inrOldPrice:250},
{id:182, name:'Paneer Cheese Cubes',     cat:'Groceries',  emoji:'🧀', price:10.50,old:13.00, unit:'per pack',   badges:['Organic'],  pct:null, sku:'GPNX-182', tags:'Organic, Dairy, Protein',       img:SUPABASE_IMG+'/Paneer Cheese Cubes.jpg', inrPrice:150, inrOldPrice:180},
{id:183, name:'Curd',                    cat:'Groceries',  emoji:'🥛', price:10.50,old:13.00, unit:'per cup',    badges:['Organic'],  pct:null, sku:'GPNX-183', tags:'Organic, Dairy, Fresh',         img:SUPABASE_IMG+'/Premium Fresh Curd.jpg', inrPrice:120, inrOldPrice:150},
{id:184, name:'Cheese',                  cat:'Groceries',  emoji:'🧀', price:10.50,old:13.00, unit:'per pack',   badges:['Organic'],  pct:null, sku:'GPNX-184', tags:'Organic, Dairy, Snack',         img:SUPABASE_IMG+'/Premium Fresh Cheese.jpg', inrPrice:150, inrOldPrice:190}
];

const BOX_PRODS = PRODS.concat(BOX_EXTRA_PRODS).slice(0, 175);

/* ── Popularity rank (1 = most commonly bought, higher = less bought) ── */
/* Based on 2025 Handpickd fresh-commerce data + daily cooking staples.  */
const SHOP_POP = {
  'Vine Tomatoes': 1, 'Red Onions': 2, 'Coriander': 3, 'Chilli Peppers': 4,
  'Green Capsicum': 5, 'Bell Peppers Mix': 6, 'Cauliflower': 7, 'Bottle Gourd': 8,
  'Okra / Ladyfinger': 9, 'Eggplant': 10, 'Sweet Potato': 11, 'Baby Spinach': 12,
  'Cucumber': 13, 'Green Beans': 14, 'Pumpkin': 15, 'Bitter Gourd': 16,
  'Ridge Gourd': 17, 'Snake Gourd': 18, 'Pointed Gourd': 19, 'Cluster Beans': 20,
  'Long Beans': 21, 'French Beans': 22, 'Drumstick (Moringa)': 23, 'Curry Leaves': 24,
  'Mint Leaves': 25, 'Spring Onions': 26, 'White Radish': 27, 'Beetroot': 28,
  'Organic Carrots': 29, 'Cherry Tomatoes': 30, 'Zucchini': 31, 'Broccoli Head': 32,
  'Iceberg Lettuce': 33, 'Butterhead Lettuce': 34, 'Kale Bunch': 35, 'Purple Cabbage': 36,
  'Pak Choi': 37, 'Celery': 38, 'Leek': 39, 'Fennel Bulb': 40, 'Taro Root': 41,
  'Lotus Root': 42, 'Yam (Purple)': 43, 'Turnip': 44, 'Watercress': 45,
  'Colocasia Leaves': 46, 'Banana Flower': 47, 'Bitter Melon': 48, 'Sweet Corn': 49,
  'Asparagus': 50,
  'Fresh Bananas': 51, 'Red Banana': 52, 'Green Apples': 53, 'Golden Delicious Apples': 54,
  'Lemon': 55, 'Orange Navel': 56, 'Mandarin Oranges': 57, 'Papaya': 58,
  'Watermelon': 59, 'Red Grapes': 60, 'Alphonso Mango': 61, 'Pomegranate': 62,
  'Guava': 63, 'Coconut (Fresh)': 64, 'Fresh Pineapple': 65, 'Strawberries': 66,
  'Kiwi Fruit': 67, 'Custard Apple': 68, 'Sapodilla (Chiku)': 69, 'Jackfruit': 70,
  'Dates Medjool': 71, 'Ripe Avocado': 72, 'Blueberries': 73, 'Passion Fruit': 74,
  'Dragon Fruit (White)': 75, 'Rambutan': 76, 'Longan': 77, 'Star Fruit': 78,
  'Lychee': 79, 'Pear': 80, 'Plums': 81, 'Cherries': 82, 'Fig': 83,
  'Raspberries': 84, 'Apricots': 85, 'Peaches': 86, 'Soursop': 87,
  'Grape Fruit': 88, 'Cantaloupe Melon': 89, 'Tamarind': 90, 'Banana Blossom': 91,
  'Pomelo': 92, 'Mangosteen': 93, 'Langsat': 94, 'Salak': 95, 'Java Apple': 96,
  'Malay Gooseberry': 97, 'Rose Myrtle': 98, 'Snake Fruit': 99, 'Durian': 100,
  'Rose Apple': 101,
  'Free Range Eggs': 102, 'Garlic Bulbs': 103, 'Basmati Rice': 104, 'Turmeric Powder': 105,
  'Cumin Seeds': 106, 'Mustard Seeds': 107, 'Red Lentils (Masoor)': 108, 'Yellow Lentils (Toor)': 109,
  'Ghee (Cow Milk)': 110, 'Farm Fresh Cow Ghee': 111, 'Chickpeas': 112, 'Coriander Seeds': 113,
  'Tamarind Paste': 114, 'Coconut Milk': 115, 'Honey (Raw Wildflower)': 116,
  'Almonds': 117, 'Cashew Nuts': 118, 'Jaggery (Cane)': 119, 'Oats (Rolled)': 120,
  'Paneer Cheese Cubes': 121, 'Curd': 122, 'Butter': 123, 'Cheese': 124,
  'Cold-Pressed Coconut Oil': 125, 'Groundnut Oil': 126, 'Peanut Oil': 127, 'Sesame Oil': 128,
  'Whole Black Pepper': 129, 'Cardamom (Green)': 130, 'Cinnamon Sticks': 131, 'Cloves': 132,
  'Star Anise': 133, 'Dry Red Chilli': 134, 'Dried Chilli Flakes': 135, 'Asafoetida (Hing)': 136,
  'Sesame Seeds (White)': 137, 'Fenugreek Seeds': 138, 'Flaxseeds': 139, 'Chia Seeds': 140,
  'Sunflower Seeds': 141, 'Pumpkin Seeds': 142, 'Walnut Kernels': 143, 'Moringa Powder': 144,
  'Ragi Flour (Millet)': 145, 'Brown Rice': 146, 'Mung Beans (Green)': 147, 'Quinoa': 148,
  'Tapioca Flour': 149, 'Dried Mango Powder': 150, 'Dried Fenugreek Leaves': 151,
  'Dried Coconut (Kopra)': 152, 'Frozen Vegetables': 153, 'Crunchy Coated Peanuts': 154,
  'Raw Peanuts': 155,
  'Tender Coconut Water': 156, 'Coconut Water': 157, 'Sugarcane Juice': 158,
  'Cold-Pressed Juice Mix': 159, 'Mango Lassi': 160, 'Fresh Orange Juice': 161,
  'Masala Chai': 162, 'Rose Milk': 163, 'Herbal Green Tea': 164, 'Carrot-Ginger Juice': 165,
  'Hibiscus Iced Tea': 166, 'Nannari Sarbath': 167, 'Aloe Vera Juice': 168, 'Amla Juice': 169,
  'Moringa Tea': 170, 'Tamarind Drink': 171, 'Vetiver Cooler': 172, 'Barley Water': 173,
  'Kokum Sherbet': 174, 'Jamun Juice': 175, 'Pineapple Vinegar': 176, 'Turmeric Latte Mix': 177,
  'Iced Coffee': 178, 'Jasmine Green Tea': 179, 'Protein Shake': 180
};
function boxPopRank(p){var r=SHOP_POP[p.name];return (typeof r==='number')?r:999;}

/* Apply admin price overrides from localStorage (region-aware) */
function applyPriceOverrides() {
  try {
    var overrides = JSON.parse(localStorage.getItem('vpnexues_price_overrides') || '{}');
    var country = (localStorage.getItem('country') || 'IN').toUpperCase();
    var RATES = { IN: 62, SG: 1, US: 0.74, AE: 2.72 };
    var rate = RATES[country] || 1;
    var applyTo = function(arr) {
      arr.forEach(function(p) {
        if (p._origPrice === undefined) { p._origPrice = p.price; p._origOld = p.old; p._origInrPrice = p.inrPrice; p._origInrOldPrice = p.inrOldPrice; }
        var key = p.cat + '::' + p.name;
        var ov = overrides[key];
        if (!ov || (!ov.IN && !ov.SG && !ov.US && !ov.AE)) {
          if (p._origPrice !== undefined) p.price = p._origPrice;
          if (p._origOld !== undefined) p.old = p._origOld;
          if (p._origInrPrice !== undefined) p.inrPrice = p._origInrPrice;
          if (p._origInrOldPrice !== undefined) p.inrOldPrice = p._origInrOldPrice;
          return;
        }
        var rOv = ov[country] || {};
        if (country === 'IN') {
          if (rOv.price !== undefined) p.inrPrice = rOv.price; else if (p._origInrPrice !== undefined) p.inrPrice = p._origInrPrice;
          if (rOv.old !== undefined) p.inrOldPrice = rOv.old; else if (p._origInrOldPrice !== undefined) p.inrOldPrice = p._origInrOldPrice;
        } else {
          if (rOv.price !== undefined) p.price = rOv.price / rate; else if (p._origPrice !== undefined) p.price = p._origPrice;
          if (rOv.old !== undefined) p.old = rOv.old / rate; else if (p._origOld !== undefined) p.old = p._origOld;
        }
      });
    };
    applyTo(PRODS);
    applyTo(BOX_EXTRA_PRODS);
  } catch(e) {}
}
applyPriceOverrides();

window.addEventListener('storage', function(e) {
  if (e.key !== 'vpnexues_price_overrides') return;
  applyPriceOverrides();
  if (typeof initSB === 'function') initSB();
  if (typeof initBB === 'function') initBB();
});

const CATS=['All','Vegetables','Fruits','Beverages','Groceries'];
const BOX_CATS=['All','Vegetables','Fruits','Beverages','Groceries'];
let cart=[],sbSel=[],bbSel={},sbCatF='All',bbCatF='All',shopCat='All',shopTag='',shopPriceMax=25,shopView='grid';
let sbSearchQuery='',bbSearchQuery='';
let currentDetailId=null,detailQtyVal=1,couponApplied=false;
const INR_RATE=62;
const DELIVERY_FEE=8;
const PRICE_CONFIG={
  IN:{rate:INR_RATE,prefix:'\u20b9',locale:'en-IN',digits:0},
  SG:{rate:1,prefix:'S$',locale:'en-SG',digits:2},
  US:{rate:.74,prefix:'$',locale:'en-US',digits:2},
  AE:{rate:2.72,prefix:'AED ',locale:'en-AE',digits:2}
};

function getPriceCountry(){
  const country=(localStorage.getItem('country')||'IN').toUpperCase();
  return PRICE_CONFIG[country]?country:'IN';
}

var PHONE_CONFIG = {
  IN: { digits: 10, pattern: /^[6-9]/, placeholder: '10-digit mobile number' },
  SG: { digits: 8, pattern: /^[89]/, placeholder: '8-digit mobile number' },
  US: { digits: 10, pattern: /^[2-9]/, placeholder: '10-digit mobile number' },
  AE: { digits: 10, pattern: /^[5]/, placeholder: '10-digit mobile number' }
};

function getPhoneConfig(country){
  var c = (country || getPriceCountry() || 'IN').toUpperCase();
  return PHONE_CONFIG[c] || PHONE_CONFIG.IN;
}

function initB2BPhoneValidation(){
  var phoneInput = document.getElementById('b2b-phone');
  if(!phoneInput) return;
  var cfg = getPhoneConfig();
  phoneInput.setAttribute('maxlength', cfg.digits);
  phoneInput.setAttribute('placeholder', cfg.placeholder);
  phoneInput.addEventListener('input', function(){
    var digits = this.value.replace(/\D/g, '');
    this.value = digits.substring(0, cfg.digits);
  });
}
function fmtPrice(v){
  const config=PRICE_CONFIG[getPriceCountry()];
  const amount=Number(v||0)*config.rate;
  return config.prefix+amount.toLocaleString(config.locale,{minimumFractionDigits:config.digits,maximumFractionDigits:config.digits});
}
function fmtSGD(v){return fmtPrice(v)}
function fmtINR(v){return fmtPrice(v)}
function fmtDual(v,inrOverride){var c=getPriceCountry();if(c==='IN'&&inrOverride!==undefined){return '\u20B9'+Math.round(inrOverride).toLocaleString('en-IN')}return fmtPrice(v)}
function getEff(p){var c=getPriceCountry();if(c==='IN'&&p&&p.inrPrice!==undefined)return p.inrPrice;if(c==='IN'&&p)return p.price*(PRICE_CONFIG[c]?PRICE_CONFIG[c].rate:62);return p?p.price:0}
function fmtAmt(v){var c=getPriceCountry();if(c==='IN')return '\u20B9'+Math.round(v).toLocaleString('en-IN');return fmtPrice(v)}

/* ---- PAGE ---- */
function goPage(n){
  if(n==='home'){window.location.href='index.html?menu=open';return}
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const pg=document.getElementById('page-'+n);
  if(!pg){window.location.href='index.html';return}
  pg.classList.add('active');
  document.body.dataset.page=n;
  window.scrollTo({top:0,behavior:'smooth'});
  if(n==='shop') initShop();
  if(n==='small-box') initSB();
  if(n==='big-box') initBB();
  if(n==='cart-page') renderCartPage();
  if(n==='checkout') renderCO();
  if(n==='checkout2') renderCO2Summary();
}
function goBoxPage(type){
  goPage(type);
  const url=new URL(window.location.href);
  url.searchParams.set('type',type);
  window.history.replaceState(null,'',url.toString());
  return false;
}
function navOn(el){
  document.querySelectorAll('.main-nav>li').forEach(li=>li.classList.remove('active'));
  el.closest('li').classList.add('active');
}

/* ---- MINI CART ---- */
function openCart(){document.getElementById('cart-ol').classList.add('open');document.getElementById('cart-dr').classList.add('open');renderMiniCart()}
function closeCart(){document.getElementById('cart-ol').classList.remove('open');document.getElementById('cart-dr').classList.remove('open')}

function isDeliveryCountrySupported() {
  var DELIVERY_COUNTRIES = ['IN', 'SG', 'US', 'AE'];
  var country = (localStorage.getItem('vpnexues_detected_country') || localStorage.getItem('country') || 'IN').toUpperCase();
  return DELIVERY_COUNTRIES.indexOf(country) !== -1;
}

function showDeliveryComingSoonToast() {
  if (document.getElementById('vpnexues-dcs-toast')) return;
  if (!document.getElementById('vpnexues-dcs-style')) {
    var style = document.createElement('style');
    style.id = 'vpnexues-dcs-style';
    style.textContent = [
      '#vpnexues-dcs-toast{position:fixed;bottom:24px;right:24px;z-index:99999;max-width:380px;background:#fff;border-radius:14px;box-shadow:0 8px 32px rgba(0,0,0,.15);padding:16px 18px;display:flex;align-items:flex-start;gap:12px;font-family:inherit;transform:translateY(120%);opacity:0;transition:transform .4s cubic-bezier(.22,1,.36,1),opacity .4s ease;pointer-events:none;}',
      '#vpnexues-dcs-toast.show{transform:translateY(0);opacity:1;pointer-events:auto;}',
      '#vpnexues-dcs-toast .dcs-icon{width:36px;height:36px;border-radius:50%;background:#fef3c7;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px;}',
      '#vpnexues-dcs-toast .dcs-body{flex:1;}',
      '#vpnexues-dcs-toast .dcs-title{font-size:13px;font-weight:700;color:#1c2820;margin:0 0 4px;line-height:1.3;}',
      '#vpnexues-dcs-toast .dcs-desc{font-size:12px;color:#5C6672;margin:0;line-height:1.4;}',
      '#vpnexues-dcs-toast .dcs-close{position:absolute;top:8px;right:8px;width:24px;height:24px;border-radius:50%;border:none;background:transparent;color:#9CA3AF;font-size:12px;display:flex;align-items:center;justify-content:center;cursor:pointer;}',
      '#vpnexues-dcs-toast .dcs-close:hover{background:rgba(0,0,0,.05);}',
      '@media(max-width:480px){#vpnexues-dcs-toast{bottom:16px;right:16px;left:16px;max-width:none;}}'
    ].join('');
    document.head.appendChild(style);
  }
  var toast = document.createElement('div');
  toast.id = 'vpnexues-dcs-toast';
  toast.innerHTML = '<div class="dcs-icon">&#128205;</div>' +
    '<div class="dcs-body"><p class="dcs-title">Currently No Delivery</p>' +
    '<p class="dcs-desc">We currently deliver only in Salem (India), Singapore, UAE & USA. Delivery to your region is coming soon!</p></div>' +
    '<button class="dcs-close" onclick="this.parentElement.remove()" aria-label="Dismiss">&times;</button>';
  document.body.appendChild(toast);
  requestAnimationFrame(function() {
    requestAnimationFrame(function() { toast.classList.add('show'); });
  });
  setTimeout(function() {
    if (toast.parentNode) {
      toast.classList.remove('show');
      setTimeout(function() { if (toast.parentNode) toast.remove(); }, 400);
    }
  }, 5000);
}

function saveCart(){try{localStorage.setItem('vpnexues_cart',JSON.stringify(cart));}catch(e){}}
function loadCart(){try{const s=localStorage.getItem('vpnexues_cart');if(s){const c=JSON.parse(s);if(Array.isArray(c)&&c.length)cart=c;}}catch(e){}}
loadCart();

function addToCart(id){
  if (!isDeliveryCountrySupported()) {
    showDeliveryComingSoonToast();
    return;
  }
  const p=PRODS.find(x=>x.id===id);
  if(!p) return;
  const ex=cart.find(x=>x.id===id);
  if(ex) ex.qty++; else cart.push({...p,qty:1});
  saveCart();
  updateDot();showToast('\u2705 '+p.name+' added!');openCart();
}
function updateDot(){
  const count=cart.reduce((s,x)=>s+x.qty,0);
  const d=document.getElementById('cart-dot');if(d)d.textContent=count;
  const bbNavBadge=document.getElementById('bb-nav-cart-badge');
  if(bbNavBadge){bbNavBadge.textContent=count;bbNavBadge.style.display=count>0?'inline-block':'none';}
  const jump=document.getElementById('pricing-cart-jump');
  const jumpCount=document.getElementById('pricing-cart-jump-count');
  const jumpTotal=document.getElementById('pricing-cart-jump-total');
  if(jump)jump.classList.toggle('is-visible',count>0);
  if(jumpCount)jumpCount.textContent=count+' '+(count===1?'item':'items');
  if(jumpTotal){const c=getPriceCountry();const cartTot=cart.reduce((s,x)=>{if(c==='IN'&&x.inrPrice!==undefined)return s+x.inrPrice*x.qty;return s+x.price*x.qty},0);jumpTotal.textContent=c==='IN'?('\u20B9'+Math.round(cartTot).toLocaleString('en-IN')):fmtDual(cartTot)}
}
function renderMiniCart(){
  const el=document.getElementById('mini-cart-body');
  if(!el) return;
  const c=getPriceCountry();
  if(!cart.length){el.innerHTML='<div class="empty-cart"><div>\uD83D\uDED2</div><p>Your cart is empty.<br>Start shopping!</p></div>';updateMiniTotals();return}
  el.innerHTML=cart.map(i=>{
    const ep=(c==='IN'&&i.inrPrice!==undefined)?i.inrPrice:i.price;
    return `<div class="cart-item"><div class="ci-thumb">${i.emoji}</div><div class="ci-info"><div class="ci-name">${esc(i.name)}</div><div class="ci-sub">${esc(i.cat)} \u2022 ${esc(i.unit)}</div><div class="ci-qtys"><button class="ciq" onclick="cQ(${i.id},-1)">-</button><span style="font-size:13px;font-weight:600;min-width:18px;text-align:center">${i.qty}</span><button class="ciq" onclick="cQ(${i.id},1)">+</button><button class="ciq" onclick="cQ(${i.id},-99)" style="font-size:10px;width:auto;padding:0 8px;border-radius:4px;font-weight:600">\u2716</button></div></div><div class="ci-price">${c==='IN'?('\u20B9'+Math.round(ep*i.qty).toLocaleString('en-IN')):fmtDual(ep*i.qty)}</div></div>`;
  }).join('');
  updateMiniTotals();
}
function cQ(id,d){
  const i=cart.findIndex(x=>x.id===id);if(i<0)return;
  cart[i].qty=Math.max(0,cart[i].qty+d);
  if(!cart[i].qty)cart.splice(i,1);
  saveCart();
  updateDot();renderMiniCart();const _cr=document.getElementById('cart-rows');if(_cr&&_cr.innerHTML) renderCartPage();
}
function updateMiniTotals(){
  const c=getPriceCountry();
  const sub=cart.reduce((s,x)=>{if(c==='IN'&&x.inrPrice!==undefined)return s+x.inrPrice*x.qty;return s+x.price*x.qty},0);
  const msEl=document.getElementById('mini-sub');
  const mtEl=document.getElementById('mini-total');
  if(c==='IN'){
    if(msEl)msEl.textContent='\u20B9'+Math.round(sub).toLocaleString('en-IN');
    if(mtEl)mtEl.textContent='\u20B9'+Math.round(sub+0).toLocaleString('en-IN');
  }else{
    if(msEl)msEl.textContent=fmtDual(sub);
    if(mtEl)mtEl.textContent=fmtDual(sub+DELIVERY_FEE);
  }
}

/* ---- CART PAGE � screenshot 3 ---- */
function renderCartPage(){
  const el=document.getElementById('cart-rows');if(!el)return;
  const c=getPriceCountry();
  if(!cart.length){el.innerHTML='<div style="padding:40px;text-align:center;color:var(--text-m)">Your cart is empty. <a href="#" style="color:var(--green);font-weight:600" onclick="goPage(\'shop\')">Continue shopping ?</a></div>';updateCartTotals();return}
  el.innerHTML=cart.map(i=>{
    const ep=(c==='IN'&&i.inrPrice!==undefined)?i.inrPrice:i.price;
    return `<div class="ct-row">
    <div class="ct-prod">
      <button class="ct-remove" onclick="cQ(${i.id},-99)">?</button>
      <div class="ct-img">${i.emoji}</div>
      <div><div class="ct-name">${esc(i.name)}</div><div style="font-size:14px;color:var(--text-m);margin-top:2px">${esc(i.unit)}</div></div>
    </div>
    <div class="ct-price">${c==='IN'?('\u20B9'+Math.round(ep).toLocaleString('en-IN')):fmtDual(ep)}</div>
    <div>
      <div class="ct-qty">
        <button class="ct-qbtn" onclick="cQ(${i.id},-1)">-</button>
        <span class="ct-qnum">${i.qty}</span>
        <button class="ct-qbtn" onclick="cQ(${i.id},1)">+</button>
      </div>
    </div>
    <div class="ct-sub">${c==='IN'?('\u20B9'+Math.round(ep*i.qty).toLocaleString('en-IN')):fmtDual(ep*i.qty)}</div>
  </div>`;
  }).join('');
  updateCartTotals();
}
function updateCartTotals(){
  const c=getPriceCountry();
  const sub=cart.reduce((s,x)=>{if(c==='IN'&&x.inrPrice!==undefined)return s+x.inrPrice*x.qty;return s+x.price*x.qty},0);
  const disc=couponApplied?sub*0.10:0;
  const total=sub-disc+(c==='IN'?0:DELIVERY_FEE);
  const fmt=v=>c==='IN'?('\u20B9'+Math.round(v).toLocaleString('en-IN')):fmtDual(v);
  const el1=document.getElementById('ct-sub');if(el1)el1.textContent=fmt(sub);
  const el2=document.getElementById('ct-total');if(el2)el2.textContent=fmt(total);
  const dr=document.getElementById('ct-disc-row');if(dr){dr.style.display=disc?'flex':'none'}
  const dv=document.getElementById('ct-disc');if(dv)dv.textContent='-'+fmt(disc);
  const coEl=document.getElementById('co-sub');if(coEl)coEl.textContent=fmt(sub);
  const cotEl=document.getElementById('co-tot');if(cotEl)cotEl.textContent=fmt(total);
  updateMiniTotals();
}
function applyCoupon(){
  const code=(document.getElementById('coupon-input')||{}).value||'';
  if(code.toUpperCase()==='GPNX10'){couponApplied=true;showToast('? Coupon applied! 10% off');updateCartTotals()}
  else showToast('? Invalid coupon code');
}
function applyCheckoutCoupon(){
  const code=(document.getElementById('co-promo-input')||{}).value||'';
  if(code.toUpperCase()==='GPNX10'){couponApplied=true;showToast('? Coupon applied! 10% off');updateCartTotals()}
  else showToast('? Invalid coupon code');
}
function renderCO(){
  const el=document.getElementById('co-items');if(!el)return;
  el.innerHTML=cart.length?cart.map(i=>{const c2=getPriceCountry();const ep=(c2==='IN'&&i.inrPrice!==undefined)?i.inrPrice:i.price;return `<div class="o-row"><span>${i.emoji} ${esc(i.name)} �${i.qty}</span><span>${c2==='IN'?('\u20B9'+Math.round(ep*i.qty).toLocaleString('en-IN')):fmtDual(ep*i.qty)}</span></div>`}).join(''):'<p style="color:var(--text-m);padding:12px 0">No items yet</p>';
  updateCartTotals();
}

/* ---- PRODUCT CARD ---- */
function prodCard(p){
  const hasSale=p.badges.includes('Sale');
  const isNew=p.badges.includes('New');
  const isOrg=p.badges.includes('Organic')&&!hasSale&&!isNew;
  return `<div class="p-card" onclick="openDetail(${p.id})" style="cursor:pointer">
    <div class="p-img">
      <div class="p-emoji" style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:80px">${p.emoji}</div>
      ${hasSale?`<div class="p-sale">Sale</div><div class="p-pct">${p.pct||'Sale'}</div>`:
        isNew?`<div class="p-sale" style="background:var(--green);color:#fff">New</div>`:
        isOrg?`<div class="p-sale" style="background:var(--green);color:#fff">Organic</div>`:''}
      <div class="p-actions">
        <button class="p-act" onclick="addToCart(${p.id});event.stopPropagation()" title="Add to cart">??</button>
        <button class="p-act" onclick="event.stopPropagation()" title="Wishlist">?</button>
        <button class="p-act" onclick="openDetail(${p.id});event.stopPropagation()" title="Quick view">??</button>
      </div>
    </div>
    <div class="p-body">
      <div class="p-stars">?????</div>
      <div class="p-name">${esc(p.name)}</div>
      <div class="p-pricing">
        <span class="p-price">${fmtDual(p.price,p.inrPrice)}</span>
        ${p.old?`<span class="p-old">${fmtDual(p.old,p.inrOldPrice)}</span>`:''}
      </div>
    </div>
  </div>`;
}

/* ---- PRODUCT DETAIL ---- */
function openDetail(id){
  const p=PRODS.find(x=>x.id===id);if(!p)return;
  currentDetailId=id;detailQtyVal=1;

  // Banner / breadcrumb
  document.getElementById('detail-breadcrumb').textContent=p.name;
  document.getElementById('detail-banner-title').textContent=p.name;

  // Main product icon
  const mainImgEl=document.getElementById('detail-main-img');
  mainImgEl.innerHTML=`<div style="font-size:120px;display:flex;align-items:center;justify-content:center;width:100%;height:100%;">${p.emoji}</div>`;

  // Thumbnails use the product icon only.
  const thumbEls=document.querySelectorAll('.detail-thumb');
  thumbEls.forEach((t,i)=>{
    t.innerHTML=`<span style="display:grid;width:100%;height:100%;place-items:center;font-size:${i===0?34:30}px">${p.emoji}</span>`;
    t.classList.remove('active');
  });
  thumbEls[0]&&thumbEls[0].classList.add('active');

  // Info
  document.getElementById('detail-name').textContent=p.name;
  document.getElementById('detail-price').textContent=fmtDual(p.price,p.inrPrice);
  const oldEl=document.getElementById('detail-old');
  if(p.old){oldEl.textContent=fmtDual(p.old,p.inrOldPrice);oldEl.style.display='block'}else{oldEl.style.display='none'}
  document.getElementById('detail-qty').value=1;
  document.getElementById('detail-cat').textContent=p.cat;
  document.getElementById('detail-unit').textContent=p.unit;
  const tabUnit=document.getElementById('tab-info-unit');if(tabUnit)tabUnit.textContent=p.unit;
  document.getElementById('detail-tags').textContent=p.tags||'Organic, Fresh, Farm';
  document.getElementById('detail-sku').textContent=p.sku||'GPNX-'+String(p.id).padStart(3,'0');

  // Related products � same category
  const related=PRODS.filter(x=>x.cat===p.cat&&x.id!==id).slice(0,4);
  const relEl=document.getElementById('related-products');
  if(relEl) relEl.innerHTML=related.map(prodCard).join('');

  // Reset tabs to Description
  document.querySelectorAll('.detail-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.detail-tab-content').forEach(c=>c.classList.remove('active'));
  const firstTab=document.querySelectorAll('.detail-tab')[0];
  if(firstTab) firstTab.classList.add('active');
  const descTab=document.getElementById('tab-desc');
  if(descTab) descTab.classList.add('active');

  goPage('detail');
}
function setThumb(el,idx){
  document.querySelectorAll('.detail-thumb').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  // Swap main image src to the clicked thumb's image src
  const thumbImg=el.querySelector('img');
  const mainImgEl=document.getElementById('detail-main-img');
  const mainImg=mainImgEl.querySelector('img');
  if(thumbImg&&mainImg){
    mainImg.src=thumbImg.src.replace(/\?.*$/,'?w=700&q=85');
  }
}
function detailQty(d){
  detailQtyVal=Math.max(1,detailQtyVal+d);
  document.getElementById('detail-qty').value=detailQtyVal;
}
function detailAddToCart(){
  if(!currentDetailId)return;
  if (!isDeliveryCountrySupported()) {
    showDeliveryComingSoonToast();
    return;
  }
  const p=PRODS.find(x=>x.id===currentDetailId);if(!p)return;
  const ex=cart.find(x=>x.id===currentDetailId);
  if(ex)ex.qty+=detailQtyVal;else cart.push({...p,qty:detailQtyVal});
  saveCart();
  updateDot();showToast('? '+p.name+' \u00B7'+detailQtyVal+' added to cart!');
}

/* ---- HOME PRODUCTS ---- */
function renderHome(){
  const hp=document.getElementById('home-products');
  if(hp) hp.innerHTML=PRODS.slice(0,12).map(prodCard).join('');
  const el=document.getElementById("home-data");
  if(el) el.innerHTML="...";
}

/* ---- SHOP PAGE ---- */
function initShop(){renderSWCats();renderBest();renderShopGrid()}
function renderSWCats(){
  const el=document.getElementById('sw-cats');if(!el)return;
  const counts={};CATS.slice(1).forEach(c=>counts[c]=PRODS.filter(p=>p.cat===c).length);
  el.innerHTML=CATS.map(c=>{
    const n=c==='All'?PRODS.length:counts[c];
    return `<div class="sw-cat-item ${c===shopCat?'active':''}" onclick="setCat('${c}')">
      <div class="sw-cat-name">${c}</div>
      <div class="sw-cat-count">${String(n).padStart(2,'0')}</div>
    </div>`;
  }).join('');
}
function renderBest(){
  const el=document.getElementById('sw-best');if(!el)return;
  el.innerHTML=PRODS.slice(0,3).map(p=>`<div class="sw-product">
    <div class="sw-prod-thumb">${p.emoji}</div>
    <div>
      <div class="sw-prod-name"><a href="#" onclick="openDetail(${p.id})" style="color:inherit">${esc(p.name)}</a></div>
      <div class="sw-prod-price">${fmtDual(p.price,p.inrPrice)} - ${fmtDual(p.price*1.3,p.inrPrice?Math.round(p.inrPrice*1.3):undefined)}</div>
    </div>
  </div>`).join('');
}
function setCat(c){shopCat=c;shopTag='';document.querySelectorAll('.tag').forEach(t=>t.classList.remove('active'));var firstTag=document.querySelector('.tag');if(firstTag)firstTag.classList.add('active');renderSWCats();renderShopGrid()}
function tagF(t,el){shopTag=t==='All'?'':t;document.querySelectorAll('.tag').forEach(x=>x.classList.remove('active'));el.classList.add('active');renderShopGrid()}
function updatePrice(v){shopPriceMax=parseFloat(v);document.getElementById('price-lbl').textContent=fmtDual(0)+' - '+fmtDual(parseFloat(v));renderShopGrid()}
function setView(v){
  shopView=v;
  const grid=document.getElementById('shop-products');
  if(v==='list')grid.classList.add('lv');else grid.classList.remove('lv');
  document.getElementById('vb-g').classList.toggle('on',v==='grid');
  document.getElementById('vb-l').classList.toggle('on',v==='list');
}
function renderShopGrid(){
  const search=(document.getElementById('shop-search')||{value:''}).value.toLowerCase();
  const sort=(document.getElementById('shop-sort')||{value:''}).value;
  let list=PRODS.filter(p=>{
    if(shopCat!=='All'&&p.cat!==shopCat)return false;
    if(shopTag&&shopTag!=='All'){const byB=p.badges.some(b=>b.toLowerCase()===shopTag.toLowerCase());const byC=p.cat.toLowerCase()===shopTag.toLowerCase();if(!byB&&!byC)return false}
    if(p.price>shopPriceMax)return false;
    if(search&&!p.name.toLowerCase().includes(search)&&!p.cat.toLowerCase().includes(search))return false;
    return true;
  });
  if(sort==='low')list=[...list].sort((a,b)=>a.price-b.price);
  else if(sort==='high')list=[...list].sort((a,b)=>b.price-a.price);
  document.getElementById('prod-count').textContent=list.length;
  const el=document.getElementById('shop-products');
  el.innerHTML=list.map(prodCard).join('');
  if(shopView==='list')el.classList.add('lv');else el.classList.remove('lv');
}

/* ---- SMALL BOX ---- */
const LOCAL_PRODUCT_ICONS = [];
function getLocalProductIcon(product){
  const icon=LOCAL_PRODUCT_ICONS.find(item=>item.match.test(product.name));
  return icon?icon.src:'';
}
function updateSmallBoxCountry(country,shouldRender=true){
  var code=(country||'IN').toUpperCase();
  VPNexuesCountry.save(code);
  if(shouldRender){
    VPNexuesCountry.update(code);
  }
}
function getBoxProduct(id){return BOX_PRODS.find(product=>Number(product.id)===Number(id))||PRODS.find(product=>Number(product.id)===Number(id));}
function getBoxProductsByCat(cat){return cat==='All'?BOX_PRODS:BOX_PRODS.filter(product=>product.cat===cat);}
function getFilteredBoxProducts(cat){
  var list=getBoxProductsByCat(cat);
  var prices=shopSheetFilters.price;
  var prefs=shopSheetFilters.preference;
  if(prices.length){
    list=list.filter(function(p){
      return prices.some(function(pr){
        return (pr==='under-5'&&p.price<5)||(pr==='5-10'&&p.price>=5&&p.price<10)||(pr==='10-20'&&p.price>=10&&p.price<=20);
      });
    });
  }
  if(prefs.length){
    list=list.filter(function(p){
      return prefs.some(function(pf){return(p.badges||[]).includes(pf);});
    });
  }
  return list.slice().sort(function(a,b){return boxPopRank(a)-boxPopRank(b);});
}
function boxDisplayUnit(unit){return (unit||'').replace(/^per\s+/i,'');}
function boxBadgeHtml(product){
  const badges=product.badges||[];
  if(badges.includes('Sale'))return '<div class="box-sale-badge">Sale</div>';
  if(badges.includes('New'))return '<div class="box-sale-badge box-new-badge">New</div>';
  if(badges.includes('Organic'))return '<div class="box-sale-badge box-organic-badge">Organic</div>';
  return '';
}
function sbBadgeHtml(product){
  const badges=product.badges||[];
  if(badges.includes('New'))return '<div class="box-sale-badge box-new-badge">New</div>';
  return '';
}

function renderBoxCategoryBar(targetId,activeCat,handlerName,countId){
  var bar=document.getElementById(targetId);
  if(!bar)return;
  var cats=[
    {id:'All',icon:'\uD83D\uDED2',label:'All Products'},
    {id:'Vegetables',icon:'\uD83E\uDD66',label:'Vegetables'},
    {id:'Fruits',icon:'\uD83C\uDF4E',label:'Fruits'},
    {id:'Beverages',icon:'\uD83E\uDDC3',label:'Beverages'},
    {id:'Groceries',icon:'\uD83D\uDED2',label:'Groceries'}
  ];
  if(!BOX_CATS.includes(activeCat)){
    if(targetId==='sb-mobile-cat-bar')sbCatF='All';
    if(targetId==='bb-mobile-cat-bar')bbCatF='All';
    activeCat=targetId==='sb-mobile-cat-bar'?'All':'All';
  }
  bar.innerHTML=cats.map(function(c){
    return '<button type="button" class="sb-rail-cat'+(c.id===activeCat?' active':'')+'" onclick="'+handlerName+'(\''+c.id+'\')"><span class="sb-rail-icon">'+c.icon+'</span><span class="sb-rail-label">'+c.label+'</span></button>';
  }).join('');
  var countEl=document.getElementById(countId);
  if(countEl)countEl.textContent=(targetId==='sb-mobile-cat-bar'?BOX_PRODS.length:getBoxProductsByCat(activeCat).length)+' Products';
}

/* ---- SEARCH ---- */
function sbToggleSearch(type){
  var box=document.getElementById(type+'-search-box')||document.getElementById(type+'-desktop-search-box');
  var input=document.getElementById(type+'-search-input')||document.getElementById(type+'-desktop-search-input');
  if(box){box.classList.toggle('is-open');if(box.classList.contains('is-open')&&input)input.focus();}
}
function sbApplySearch(type,val){
  if(type==='sb'){
    sbSearchQuery=(val||'').trim();
    sbMobileVisible=typeof SB_PAGE_SIZE!=='undefined'?SB_PAGE_SIZE:24;
    sbDesktopVisible=typeof SB_PAGE_SIZE!=='undefined'?SB_PAGE_SIZE:24;
    if(typeof initSB==='function')initSB();
  } else if(type==='bb'){
    bbSearchQuery=(val||'').trim();
    bbMobileVisible=typeof BB_PAGE_SIZE!=='undefined'?BB_PAGE_SIZE:24;
    bbDesktopVisible=typeof BB_PAGE_SIZE!=='undefined'?BB_PAGE_SIZE:24;
    if(typeof initBB==='function')initBB();
  }
}
function sbCloseSearch(type){
  var box=document.getElementById(type+'-search-box')||document.getElementById(type+'-desktop-search-box');
  var input=document.getElementById(type+'-search-input')||document.getElementById(type+'-desktop-search-input');
  if(box)box.classList.remove('is-open');
  if(input){input.value='';sbApplySearch(type,'');}
}
function sbToggleDesktopSearch(type){
  var box=document.getElementById(type+'-desktop-search-box');
  var input=document.getElementById(type+'-desktop-search-input');
  if(box){box.classList.toggle('is-open');if(box.classList.contains('is-open')&&input)input.focus();}
}
function sbCloseDesktopSearch(type){
  var box=document.getElementById(type+'-desktop-search-box');
  var input=document.getElementById(type+'-desktop-search-input');
  if(box)box.classList.remove('is-open');
  if(input){input.value='';sbApplySearch(type,'');}
}

/* ---- PRICING ---- */
function initPricing(){
  // plans defined inline � nothing to init dynamically
}

/* ---- CHECKOUT 2 ---- */
function payNow(){
  if(!cart.length){showToast('? Your cart is empty!');return}
  showToast('? Payment confirmed! Thank you for your order.');
  cart=[];saveCart();updateDot();
  setTimeout(()=>goPage('home'),2200);
}

/* ---- B2B / CHECKOUT ---- */
function submitB2B(){
  const c=(document.getElementById('b2b-company')||{}).value||'';
  const p=(document.getElementById('b2b-contact')||{}).value||'';
  const ph=(document.getElementById('b2b-phone')||{}).value||'';
  const e=(document.getElementById('b2b-email')||{}).value||'';
  const t=(document.getElementById('b2b-type')||{}).value||'';
  if(!c||!p||!ph||!e||t==='Select your business type'){showToast('?? Please fill all required fields');return}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)){showToast('Please enter a valid email address');return}
  var cfg = getPhoneConfig();
  var digits = ph.replace(/\D/g, '');
  if(digits.length !== cfg.digits){showToast('Phone number must be ' + cfg.digits + ' digits for ' + (getPriceCountry() === 'IN' ? 'India' : getPriceCountry() === 'SG' ? 'Singapore' : getPriceCountry() === 'US' ? 'USA' : 'UAE'));return}
  const successEl=document.getElementById('b2b-inquiry-success');
  if(successEl){successEl.classList.add('show');successEl.scrollIntoView({behavior:'smooth',block:'nearest'});setTimeout(()=>successEl.classList.remove('show'),4000);}
  showConfirmModal('Inquiry Submitted!','Your inquiry has been received.<br>A confirmation email will be sent to <strong>your email address</strong>.');
  setTimeout(()=>goPage('home'),3000);
}
function placeOrder(){
  if(!cart.length){showToast('\uD83D\uDED2 Your cart is empty!');return;}
  const f=(document.getElementById('co-fname')||{}).value||'';
  const e=(document.getElementById('co-email')||{}).value||'';
  const p=(document.getElementById('co-phone')||{}).value||'';
  const a=(document.getElementById('co-address')||{}).value||'';
  if(!f||!e||!p||!a){showToast('\u26A0\uFE0F Please fill name, email, phone & address');return;}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)){showToast('Please enter a valid email address');return;}
  showConfirmModal('Order Placed!','Thank you for your order.<br>A confirmation email will be sent to <strong>your email address</strong>.');
  cart=[];saveCart();updateDot();setTimeout(()=>{window.location.href='index.html';},3000);
}

/* ---- TOAST ---- */
var _toastTimer=null;
function showToast(msg){var t=document.getElementById('toast');if(!t)return;if(_toastTimer)clearTimeout(_toastTimer);t.textContent=msg;t.classList.add('show');_toastTimer=setTimeout(function(){t.classList.remove('show');_toastTimer=null;},2800)}
function showConfirmModal(title,msg){document.getElementById('confirmTitle').innerHTML=title;document.getElementById('confirmMsg').innerHTML=msg;document.getElementById('confirmModal').style.display='flex';document.body.style.overflow='hidden'}
function closeConfirmModal(){document.getElementById('confirmModal').style.display='none';document.body.style.overflow='';setTimeout(()=>goPage('home'),300)}

/* ---- MOBILE NAV ---- */
function openMob(){document.getElementById('mob-ol').classList.add('open');document.getElementById('mob-nav').classList.add('open')}
function closeMob(){document.getElementById('mob-ol').classList.remove('open');document.getElementById('mob-nav').classList.remove('open')}
function openSmallBoxMenu(){
  const menu=document.getElementById('sb-menu-backdrop');
  if(!menu)return;
  menu.classList.add('is-open');
  menu.setAttribute('aria-hidden','false');
  document.body.classList.add('sb-menu-open');
}
function closeSmallBoxMenu(){
  const menu=document.getElementById('sb-menu-backdrop');
  if(!menu)return;
  menu.classList.remove('is-open');
  menu.setAttribute('aria-hidden','true');
  document.body.classList.remove('sb-menu-open');
}
function openBigBoxMenu(){
  const menu=document.getElementById('bb-menu-backdrop');
  if(!menu)return;
  menu.classList.add('is-open');
  menu.setAttribute('aria-hidden','false');
  document.body.classList.add('bb-menu-open');
}
function closeBigBoxMenu(){
  const menu=document.getElementById('bb-menu-backdrop');
  if(!menu)return;
  menu.classList.remove('is-open');
  menu.setAttribute('aria-hidden','true');
  document.body.classList.remove('bb-menu-open');
}

/* ---- DETAIL TABS ---- */
function switchTab(tabId,el){
  document.querySelectorAll('.detail-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.detail-tab-content').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
  document.getElementById(tabId).classList.add('active');
}

/* ---- INIT ---- */
renderHome();
document.addEventListener('vpn-country-price-change',function(e){
  var banner = document.getElementById("vpn-region-banner");
  if (banner) banner.style.display = (e.detail && e.detail.isUnsupported) ? "" : "none";
  renderHome();
  updateDot();
  updateMiniTotals();
  updateCartTotals();
  const active=document.querySelector('.page.active');
  const pageId=active?active.id.replace('page-',''):'';
  if(pageId==='shop')initShop();
  if(pageId==='small-box')initSB();
  if(pageId==='big-box')initBB();
  if(pageId==='cart-page')renderCartPage();
  if(pageId==='checkout')renderCO();
  if(pageId==='checkout2')renderCO2Summary();
  if(pageId==='detail'&&currentDetailId)openDetail(currentDetailId);
});

/* ---- CHECKOUT2 HELPERS ---- */
function co2PayChange(radio){
  var panel=document.getElementById('co2-payment-panel');
  if(!panel) return;
  var cardFields=panel.querySelectorAll('input[type=text],input[type=number]');
  var isCard=['card','visa','mastercard'].includes(radio.value);
  cardFields.forEach(function(el){el.style.display=isCard?'':'none';});
}
function formatCardNum(inp){
  let v=inp.value.replace(/\D/g,'').substring(0,16);
  inp.value=v.replace(/(.{4})/g,'$1 ').trim();
}
function renderCO2Summary(){
  const el=document.getElementById('co2-items-list');if(!el)return;
  const c2=getPriceCountry();
  const sub=cart.reduce((s,x)=>{if(c2==='IN'&&x.inrPrice!==undefined)return s+x.inrPrice*x.qty;return s+x.price*x.qty},0);
  const fmtV=v=>c2==='IN'?('\u20B9'+Math.round(v).toLocaleString('en-IN')):fmtDual(v);
  el.innerHTML=cart.length?cart.map(i=>{const ep=(c2==='IN'&&i.inrPrice!==undefined)?i.inrPrice:i.price;return `<div style="display:flex;justify-content:space-between;font-size:13px;color:var(--text-m);padding:5px 0"><span>${i.emoji} ${i.name} \u00D7${i.qty}</span><span>${fmtV(ep*i.qty)}</span></div>`}).join(''):'<p style="color:var(--text-m);font-size:13px;padding:8px 0">No items yet</p>';
  const cs=document.getElementById('co2-sub');if(cs)cs.textContent=fmtV(sub);
  const ct=document.getElementById('co2-total');if(ct)ct.textContent=fmtV(sub+(c2==='IN'?0:DELIVERY_FEE));
}

(function() {
    function updateCartBadge() {
      var badge = document.getElementById("nav-cart-badge");
      if (!badge) return;
      var cart = JSON.parse(localStorage.getItem("cart") || "[]");
      var count = 0;
      cart.forEach(function(item) { count += (item.qty || item.quantity || 1); });
      if (count > 0) {
        badge.textContent = count;
        badge.style.display = "";
      } else {
        badge.style.display = "none";
      }
    }
    updateCartBadge();
    window.updateCartBadge = updateCartBadge;
  })();

    /* Filter sheet functions (matches shop.html) */
    var shopSheetFilters = { category: 'All', price: [], preference: [], boxType: '' };

    var filterBarInterval = null;

    function shopOpenFilterSheet() {
      document.body.classList.add('shop-filter-sheet-open');
      var sheet = document.getElementById('shop-filter-sheet');
      if (sheet) sheet.setAttribute('aria-hidden', 'false');
      try { shopUpdateFilterPriceLabels(); } catch(e) {}
      try { shopUpdateQuickLinkLabels(); } catch(e) {}
      try { hideSelectionBars(); } catch(e) {}
      filterBarInterval = setInterval(function(){ try { hideSelectionBars(); } catch(e){} }, 50);
    }
    window.shopOpenFilterSheet = shopOpenFilterSheet;

    function shopUpdateQuickLinkLabels() {
      var pageType = new URLSearchParams(window.location.search).get('type') || '';
      var defaults = {
        'small-box': { icon: 'fa-box-open', text: 'Small Box', val: 'small-box' },
        'big-box':   { icon: 'fa-boxes-stacked', text: 'Big Box', val: 'big-box' },
        'b2b':       { icon: 'fa-handshake', text: 'B2B', val: 'b2b' }
      };
      var chips = document.querySelectorAll('[data-filter-group="boxType"] .shop-filter-sheet__link-btn');
      chips.forEach(function(btn) {
        var origVal = btn.getAttribute('data-original-value') || btn.dataset.filterValue;
        if (!btn.getAttribute('data-original-value')) {
          btn.setAttribute('data-original-value', btn.dataset.filterValue);
        }
        var def = defaults[origVal];
        if (!def) return;
        if (pageType === origVal) {
          btn.innerHTML = '<i class="fas fa-store" style="margin-right:6px;"></i>Shop';
          btn.dataset.filterValue = 'shop';
        } else {
          btn.innerHTML = '<i class="fas ' + def.icon + '" style="margin-right:6px;"></i>' + def.text;
          btn.dataset.filterValue = def.val;
        }
      });
    }

    function shopUpdateFilterPriceLabels() {
      var chipData = [
        { key: 'under-5', max: 5 },
        { key: '5-10', min: 5, max: 10 },
        { key: '10-20', min: 10, max: 20 }
      ];
      document.querySelectorAll('.shop-price-chip').forEach(function(chip) {
        var item = chipData.find(function(d) { return d.key === chip.dataset.labelKey; });
        if (!item) return;
        if (item.min !== undefined) {
          chip.textContent = fmtPrice(item.min) + ' - ' + fmtPrice(item.max);
        } else {
          chip.textContent = 'Under ' + fmtPrice(item.max);
        }
      });
    }

    function shopUpdateFilterCount() {
      var count = 0;
      if (shopSheetFilters.price.length) count++;
      if (shopSheetFilters.preference.length) count++;
      if (shopSheetFilters.boxType) count++;
      var badge = document.getElementById('shop-filter-badge');
      if (badge) {
        if (count > 0) { badge.textContent = count; badge.style.display = 'inline-flex'; }
        else { badge.style.display = 'none'; }
      }
      var badgeBB = document.getElementById('shop-filter-badge-bb');
      if (badgeBB) {
        if (count > 0) { badgeBB.textContent = count; badgeBB.style.display = 'inline-flex'; }
        else { badgeBB.style.display = 'none'; }
      }
    }

    function shopCloseFilterSheet() {
      document.body.classList.remove('shop-filter-sheet-open');
      var sheet = document.getElementById('shop-filter-sheet');
      if (sheet) sheet.setAttribute('aria-hidden', 'true');
      if (filterBarInterval) { clearInterval(filterBarInterval); filterBarInterval = null; }
      showSelectionBars();
    }
    window.shopCloseFilterSheet = shopCloseFilterSheet;

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && document.body.classList.contains('shop-filter-sheet-open')) {
        shopCloseFilterSheet();
      }
    });

    var filterSheet = document.getElementById('shop-filter-sheet');
    if (filterSheet) {
      filterSheet.addEventListener('click', function(e) {
        if (e.target === filterSheet && document.body.classList.contains('shop-filter-sheet-open')) {
          shopCloseFilterSheet();
        }
      });
    }

    function hideSelectionBars() {
      ['sb-mobile-selection-bar','bb-mobile-selection-bar'].forEach(function(id){
        var el = document.getElementById(id);
        if (el) { el.style.setProperty('display','none','important'); el.style.setProperty('visibility','hidden','important'); el.style.setProperty('opacity','0','important'); el.style.setProperty('pointer-events','none','important'); el.style.setProperty('transform','translateY(100%)','important'); el.style.setProperty('z-index','-1','important'); }
      });
    }

    function showSelectionBars() {
      ['sb-mobile-selection-bar','bb-mobile-selection-bar'].forEach(function(id){
        var el = document.getElementById(id);
        if (el) { el.style.removeProperty('display'); el.style.removeProperty('visibility'); el.style.removeProperty('opacity'); el.style.removeProperty('pointer-events'); el.style.removeProperty('transform'); el.style.removeProperty('z-index'); }
      });
    }

    function updateGroupCount(group) {
      var el = document.querySelector('[data-group-count="' + group + '"]');
      if (!el) return;
      var arr = shopSheetFilters[group];
      if (Array.isArray(arr) && arr.length > 0) {
        el.textContent = arr.length;
        el.style.display = 'inline-flex';
      } else {
        el.textContent = '';
        el.style.display = 'none';
      }
    }

    function shopApplyFilterSheet() {
      if (shopSheetFilters.boxType) {
        if (shopSheetFilters.boxType === 'shop') {
          window.location.href = 'shop.html';
          return;
        }
        var currentPageType = new URLSearchParams(window.location.search).get('type') || '';
        var targetMap = {
          'small-box': { 'small-box': 'shop.html', 'big-box': 'pricing.html?type=big-box', 'b2b': 'pricing.html?type=b2b' },
          'big-box':   { 'small-box': 'pricing.html?type=small-box', 'big-box': 'shop.html', 'b2b': 'pricing.html?type=b2b' }
        };
        var map = targetMap[currentPageType];
        var url = map ? map[shopSheetFilters.boxType] : 'pricing.html?type=' + shopSheetFilters.boxType;
        window.location.href = url;
        return;
      }
      shopCloseFilterSheet();
      shopUpdateFilterCount();
      var pageType = new URLSearchParams(window.location.search).get('type') || '';
      if (pageType === 'small-box' && typeof initSB === 'function') initSB();
      else if (pageType === 'big-box' && typeof initBB === 'function') initBB();
    }
    window.shopApplyFilterSheet = shopApplyFilterSheet;

    function shopClearFilters() {
      shopSheetFilters = { category: 'All', price: [], preference: [], boxType: '' };
      document.querySelectorAll('.shop-filter-sheet__chips button').forEach(function(chip) { chip.classList.remove('active'); });
      shopUpdateFilterCount();
      updateGroupCount('price');
      updateGroupCount('preference');
      var pageType = new URLSearchParams(window.location.search).get('type') || '';
      if (pageType === 'small-box' && typeof initSB === 'function') initSB();
      else if (pageType === 'big-box' && typeof initBB === 'function') initBB();
    }
    window.shopClearFilters = shopClearFilters;

    function shopFilterSheetChoice(button) {
      var group = button.parentElement.dataset.filterGroup;
      if (group === 'boxType') {
        button.parentElement.querySelectorAll('button').forEach(function(c) { c.classList.remove('active'); });
        button.classList.add('active');
        shopSheetFilters[group] = button.dataset.filterValue;
      } else {
        button.classList.toggle('active');
        var val = button.dataset.filterValue;
        var arr = shopSheetFilters[group];
        var idx = arr.indexOf(val);
        if (idx >= 0) arr.splice(idx, 1);
        else arr.push(val);
      }
      updateGroupCount(group);
    }
    window.shopFilterSheetChoice = shopFilterSheetChoice;

    /* Desktop filter dropdown panel (small-box / big-box) */
    function shopToggleDesktopFilter(btn) {
      var panel = null;
      if (btn && btn.closest) {
        if (btn.classList && btn.classList.contains('shop-desktop-filter-panel')) {
          panel = btn;
        } else {
          panel = btn.closest('.shop-desktop-filter-panel') ||
            (btn.closest('.shop-desktop-seg-wrap') ? btn.closest('.shop-desktop-seg-wrap').querySelector('.shop-desktop-filter-panel') : null);
        }
      }
      if (!panel) panel = document.querySelector('.shop-desktop-filter-panel.is-open') || document.querySelector('.shop-desktop-filter-panel');
      if (!panel) return;
      var willOpen = !panel.classList.contains('is-open');
      panel.classList.toggle('is-open', willOpen);
      panel.setAttribute('aria-hidden', String(!willOpen));
      var tbtn = btn && btn.classList && btn.classList.contains('shop-desktop-filter-panel') ? null : btn;
      if (tbtn) tbtn.setAttribute('aria-expanded', String(willOpen));
      if (willOpen) {
        try { shopUpdateFilterPriceLabels(); } catch (e) {}
        document.addEventListener('click', shopDesktopFilterOutsideClick);
        document.addEventListener('keydown', shopDesktopFilterEsc);
      } else {
        document.removeEventListener('click', shopDesktopFilterOutsideClick);
        document.removeEventListener('keydown', shopDesktopFilterEsc);
      }
    }
    window.shopToggleDesktopFilter = shopToggleDesktopFilter;

    function shopDesktopFilterOutsideClick(e) {
      var openPanel = document.querySelector('.shop-desktop-filter-panel.is-open');
      if (!openPanel) return;
      if (!openPanel.contains(e.target) && !e.target.closest('.segment-filter-btn') && !e.target.closest('.shop-desktop-filter-panel__close')) {
        shopToggleDesktopFilter();
      }
    }
    window.shopDesktopFilterOutsideClick = shopDesktopFilterOutsideClick;

    function shopDesktopFilterEsc(e) {
      if (e.key === 'Escape') shopToggleDesktopFilter();
    }
    window.shopDesktopFilterEsc = shopDesktopFilterEsc;

    function shopDesktopFilterApply() {
      shopUpdateFilterCount();
      var pageType = new URLSearchParams(window.location.search).get('type') || '';
      if (pageType === 'small-box' && typeof initSB === 'function') initSB();
      else if (pageType === 'big-box' && typeof initBB === 'function') initBB();
    }
    window.shopDesktopFilterApply = shopDesktopFilterApply;

    function shopDesktopFilterClear() {
      shopSheetFilters = { category: 'All', price: [], preference: [], boxType: '' };
      document.querySelectorAll('.shop-desktop-filter-panel .shop-df-chip').forEach(function (chip) { chip.classList.remove('active'); });
      document.querySelectorAll('.shop-filter-sheet__chips button').forEach(function (chip) { chip.classList.remove('active'); });
      shopUpdateFilterCount();
      updateGroupCount('price');
      updateGroupCount('preference');
      var pageType = new URLSearchParams(window.location.search).get('type') || '';
      if (pageType === 'small-box' && typeof initSB === 'function') initSB();
      else if (pageType === 'big-box' && typeof initBB === 'function') initBB();
    }
    window.shopDesktopFilterClear = shopDesktopFilterClear;

document.addEventListener('DOMContentLoaded', function(){
  initB2BPhoneValidation();
  var activePage = document.querySelector('.page.active');
  if (activePage && activePage.id) {
    var pageName = activePage.id.replace('page-', '');
    document.body.dataset.page = pageName;
  }

  /* Hide desktop header on scroll down (mirror shop.html) for small-box/big-box */
  var pricingScrollHandler = function () {
    var page = document.body.dataset.page;
    var desktop = window.matchMedia('(min-width: 768px)').matches;
    var isBoxPage = page === 'small-box' || page === 'big-box';
    document.body.classList.toggle('shop-header-hidden', isBoxPage && desktop && window.scrollY > 150);
  };
  window.addEventListener('scroll', pricingScrollHandler, { passive: true });
  window.addEventListener('resize', pricingScrollHandler);
  pricingScrollHandler();
});




