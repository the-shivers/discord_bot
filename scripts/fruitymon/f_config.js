// Config
let fruit_dict = require('./fruit_dict.json');

class Fruit {
  constructor(str) {
    this.str = str;
    this.emoji = fruit_dict[str].emoji;
    this.tier = fruit_dict[str].tier;
    this.num_in_tier = fruit_dict[str].num_in_tier;
    this.exp = fruit_dict[str].exp;
  }
}

class Perk {
  constructor(str, group, description, effects) {
    this.str = str;
    if (str.length > 0) {
      this.proper = (
        str[0].toUpperCase() + str.substring(1)
      ).split("_").join(" ");
    } else {
      this.proper = ""
    }
    this.group = group;
    this.desc = description;
    this.effects = effects;
  }
}

class Item {
  constructor(str) {
    this.name = str;
    this.desc = item_dict[str].desc;
    this.exp = item_dict[str].exp;
    this.price = item_dict[str].price;
  }
}

let item_dict = {
  "lucky_test_item": {
    "name": "lucky_test_item",
    "desc": "It's a test item for lucky people.",
    "exp": 120,
    "price": 50
  },
  "greedy_test_item": {
    "name": "greedy_test_item",
    "desc": "It's a test item for greedy people.",
    "exp": 120,
    "price": 50
  },
  "greedy_test_item_expensive": {
    "name": "greedy_test_item_expensive",
    "desc": "It's an expensive test item for greedy people.",
    "exp": 120,
    "price": 1000000000
  },
  "megaluck": {
    "name": "megaluck",
    "desc": "Much luckier rolls for 24 hours",
    "exp": 3600 * 24,
    "price": 1000000000000000000
  }
  ,
  "megagreed": {
    "name": "megagreed",
    "desc": "5 extra fruits per pick for 24 hours",
    "exp": 3600 * 24,
    "price": 20000000000000000000
  }
  ,
  "deperker": {
    "name": "deperker",
    "desc": "Resets your perks. Also removes boons/curses from God.",
    "exp": 0,
    "price": 20000
  }
  ,
  "lock": {
    "name": "lock",
    "desc": "Locks up your shit for a day so people can't steal it. Lasts 24 hours.",
    "exp": 3600 * 24,
    "price": 2000
  }
}

let levels = [
  0, 100, 200, 300, 500, 800, 1300, 2100, 3400, 5500, 9000, 14000, 20000, 34000
];
levels = levels.map(function(x) { return x * 20; });
let ranks = [
  'broken',
  "Seed Sniffer",
  "Fruitlet",
  "Pulp Punk",
  "Fructose Apprentice",
  "Citric Scholar",
  "Fruitographer",
  "Berry Bandit",
  "Mayor of Fruitytown",
  "📜 Fructose Sage 📜",
  "💰 Fructose Tycoon 💰",
  "👑 Legendary Fruit Lord 👑",
  "👑💎 God-King of Fruit 💎👑"
]

let default_pick_limit = 5;
let default_sides = 100;
let default_delay = 1800;
// Define perk strings where we keep lowest or highest rolls
greedy = new Perk(
  "greedy", "greedy", "Get twice as many fruit, but far fewer rare fruit!",
  {"Pick Limit": 5, "Number of Dice": 7}
);
struggle = new Perk(
  "struggle", "greedy", "15 more picks, but they'll be less rare!",
  {"Pick Limit": 15, "Number of Dice": 18}
);
acceptance = new Perk(
  "acceptance", "greedy", "15 more picks, but you'll never get another ultra rare or better!",
  {"Pick Limit": 15, "Number of Dice": 15, "Dice Sides": -4}
);
raccoon = new Perk(
  "raccoon", "greedy", "10 free trash every pick. Can now find rare trash!",
  {"Roll Delay": 0}
);
pawnstar = new Perk(
  "pawnstar", "greedy", "Trash sells for 2x as much! Can sell trash any day of the week.",
  {"Roll Delay": 0}
);
lucky = new Perk(
  "lucky", "lucky", "Increases your chances of getting rare fruit!",
  {"Number of Dice": 2}
);
gambler = new Perk(
  "gambler", "lucky", "7x your chances of getting extraordinary fruit!",
  {"Dice Sides": 6}
);
diversify = new Perk(
  "diversify", "lucky", "Larger hauls that still retain their luck!",
  {"Pick Limit": 7, "Number of Dice": 7}
);
blessed = new Perk(
  "blessed", "lucky", "Your rolls will be insanely lucky!",
  {"Number of Dice": 15}
);
beloved = new Perk(
  "beloved", "lucky", "Ultra rares and extraordinaries sell for 2x!",
  {"Roll Delay": 0}
);
null_perk_l = new Perk(
  "null_perk_l", "lucky", "Placeholder. Do not take this perk!!! YOU WERE WARNED!",
  {"Roll Delay": 0}
);
null_perk_g = new Perk(
  "null_perk_g", "greedy", "Placeholder. Do not take this perk!!! YOU WERE WARNED!",
  {"Roll Delay": 0}
);
king_of_fruits = new Perk(
  "king_of_fruits", "lucky", "If you pick a pineapple, get to immediately pick agin!",
  {"Roll Delay": 0}
);
king_of_trash = new Perk(
  "king_of_trash", "greedy", "Your first pick of the day is a megapick!",
  {"Roll Delay": 0}
);
empty_perk = new Perk(
  "", "", "", {}
)

let perk_dict = {
  "greedy": greedy,
  "lucky": lucky,
  "struggle": struggle,
  "acceptance": acceptance,
  "raccoon": raccoon,
  "pawnstar": pawnstar,
  "gambler": gambler,
  "diversify": diversify,
  "blessed": blessed,
  "beloved": beloved,
  "null_perk_l": null_perk_l,
  "null_perk_g": null_perk_g,
  "king_of_fruits": king_of_fruits,
  "king_of_trash": king_of_trash,
  "empty_perk": empty_perk
}

let min_perk_group = ["greedy"];
let max_perk_group = ["lucky"];

let greedy_perks = [
  greedy,
  [struggle, acceptance],
  [raccoon, pawnstar],
  [null_perk_g, null_perk_g],
  [null_perk_g, null_perk_g],
  [null_perk_g, null_perk_g],
  [null_perk_g, null_perk_g],
  [null_perk_g, null_perk_g]
]
let lucky_perks = [
  lucky,
  [gambler, diversify],
  [blessed, beloved],
  [null_perk_l, null_perk_l],
  [null_perk_l, null_perk_l],
  [null_perk_l, null_perk_l]
]

let emoji_to_string = {
  "🪵": "wood",
  "🍂": "fallen_leaf",
  "🥌": "curling_stone",
  "🥚": "egg",
  "🗿": "moyai",
  "🍅": "tomato",
  "🌶️": "hot_pepper",
  "🥑": "avocado",
  "🍆": "eggplant",
  "🫒": "olive",
  "🍏": "green_apple",
  "🍎": "apple",
  "🍐": "pear",
  "🍊": "tangerine",
  "🍋": "lemon",
  "🥝": "kiwi",
  "🍌": "banana",
  "🍉": "watermelon",
  "🍑": "peach",
  "🍈": "melon",
  "🫐": "blueberries",
  "🍓": "strawberry",
  "🍇": "grapes",
  "🍒": "cherries",
  "🥭": "mango",
  "🍍": "pineapple",
  "🥥": "coconut",
  "🦠": "microbe",
  "💉": "syringe",
  "🩲": "briefs",
  "🫁": "lungs",
  "💊": "pill"
};

function swap(json){
  var ret = {};
  for(var key in json){
    ret[json[key]] = key;
  }
  return ret;
}


let string_to_emoji = swap(emoji_to_string);

function fruit_exp(tier, num_in_tier) {
  let tier_exp = [10, 20, 40, 75, 125, 250][tier - 1];
  let num_in_tier_exp = tier**2 * num_in_tier;
  return tier_exp + num_in_tier_exp;
}

function fruit_arr_to_emoji_arr(arr) {
  let my_arr = []
  for (let i=0; i < arr.length; i++) {my_arr = my_arr.concat(arr[i].emoji)}
  return my_arr;
}

function fruit_arr_to_str_arr(arr) {
  let my_arr = []
  for (let i=0; i < arr.length; i++) {my_arr = my_arr.concat(arr[i].str)}
  return my_arr;
}

function count_rare_fruits(arr) {
  let cnt = 0;
  for (let i=0; i < arr.length; i++) {
    if (arr[i].tier===6) {
      cnt += 1;
    }
  }
  return cnt;
}

function tierRarity(n) {
  // Returns a number between 1 and n inclusive, with n being rarer.
  let my_arr = []
  for (let i = 0; i < n; i++) {
    my_arr = my_arr.concat(Array(n - i).fill(i + 1))
  }
  return_val = my_arr[Math.floor(Math.random() * my_arr.length)];
  return return_val;
}

let fruit_dict2 = {
   "wood":{
      "str":"wood",
      "emoji":"🪵",
      "tier":1,
      "num_in_tier":2,
      "exp":12,
      "period": 1,
      "offset": 0,
      "amplitude": 1,
      "rw_amplitude": 2
   },
   "fallen_leaf":{
      "str":"fallen_leaf",
      "emoji":"🍂",
      "tier":1,
      "num_in_tier":1,
      "exp":11,
      "period": 1,
      "offset": 0,
      "amplitude": 1,
      "rw_amplitude": 1
   },
   "curling_stone":{
      "str":"curling_stone",
      "emoji":"🥌",
      "tier":1,
      "num_in_tier":4,
      "exp":14,
      "period": 1,
      "offset": 0,
      "amplitude": 1,
      "rw_amplitude": 4
   },
   "egg":{
      "str":"egg",
      "emoji":"🥚",
      "tier":1,
      "num_in_tier":3,
      "exp":13,
      "period": 1,
      "offset": 0,
      "amplitude": 1,
      "rw_amplitude": 3
   },
   "moyai":{
      "str":"moyai",
      "emoji":"🗿",
      "tier":1,
      "num_in_tier":5,
      "exp":15,
      "period": 1,
      "offset": 0,
      "amplitude": 1,
      "rw_amplitude": 5
   },
   "olive":{
      "str":"olive",
      "emoji":"🫒",
      "tier":2,
      "num_in_tier":1,
      "exp":24,
      "period": 2,
      "offset": 1,
      "amplitude": 12,
      "rw_amplitude": 2
   },
   "tomato":{
      "str":"tomato",
      "emoji":"🍅",
      "tier":2,
      "num_in_tier":2,
      "exp":28,
      "period": 7,
      "offset": 2,
      "amplitude": 8,
      "rw_amplitude": 4
   },
   "hot_pepper":{
      "str":"hot_pepper",
      "emoji":"🌶️",
      "tier":2,
      "num_in_tier":3,
      "exp":32,
      "period": 10,
      "offset": 5,
      "amplitude": 9,
      "rw_amplitude": 6
   },
   "eggplant":{
      "str":"eggplant",
      "emoji":"🍆",
      "tier":2,
      "num_in_tier":4,
      "exp":36,
      "period": 3,
      "offset": 1,
      "amplitude": 4,
      "rw_amplitude": 2
   },
   "avocado":{
      "str":"avocado",
      "emoji":"🥑",
      "tier":2,
      "num_in_tier":5,
      "exp":40,
      "period": 5,
      "offset": 2,
      "amplitude": 30,
      "rw_amplitude": 6
   },
   "green_apple":{
      "str":"green_apple",
      "emoji":"🍏",
      "tier":3,
      "num_in_tier":1,
      "exp":49,
      "period": 14,
      "offset": 2,
      "amplitude": 30,
      "rw_amplitude": 20
   },
   "apple":{
      "str":"apple",
      "emoji":"🍎",
      "tier":3,
      "num_in_tier":2,
      "exp":58,
      "period": 14,
      "offset": 2,
      "amplitude": 20,
      "rw_amplitude": 6
   },
   "pear":{
      "str":"pear",
      "emoji":"🍐",
      "tier":3,
      "num_in_tier":3,
      "exp":67,
      "period": 14,
      "offset": 2,
      "amplitude": 30,
      "rw_amplitude": 10
   },
   "peach":{
      "str":"peach",
      "emoji":"🍑",
      "tier":3,
      "num_in_tier":4,
      "exp":76,
      "period": 14,
      "offset": 2,
      "amplitude": 34,
      "rw_amplitude": 12
   },
   "banana":{
      "str":"banana",
      "emoji":"🍌",
      "tier":3,
      "num_in_tier":5,
      "exp":85,
      "period": 14,
      "offset": 2,
      "amplitude": 40,
      "rw_amplitude": 16
   },
   "tangerine":{
      "str":"tangerine",
      "emoji":"🍊",
      "tier":4,
      "num_in_tier":1,
      "exp":91,
      "period": 24,
      "offset": 12,
      "amplitude": 91,
      "rw_amplitude": 30
   },
   "lemon":{
      "str":"lemon",
      "emoji":"🍋",
      "tier":4,
      "num_in_tier":2,
      "exp":107,
      "period": 19,
      "offset": 4,
      "amplitude": 107,
      "rw_amplitude": 30
   },
   "watermelon":{
      "str":"watermelon",
      "emoji":"🍉",
      "tier":4,
      "num_in_tier":3,
      "exp":123,
      "period": 15,
      "offset": 11,
      "amplitude": 123,
      "rw_amplitude": 40
   },
   "melon":{
      "str":"melon",
      "emoji":"🍈",
      "tier":4,
      "num_in_tier":4,
      "exp":139,
      "period": 30,
      "offset": 22,
      "amplitude": 139,
      "rw_amplitude": 30
   },
   "kiwi":{
      "str":"kiwi",
      "emoji":"🥝",
      "tier":4,
      "num_in_tier":5,
      "exp":155,
      "period": 35,
      "offset": 29,
      "amplitude": 155,
      "rw_amplitude": 36
   },
   "cherries":{
      "str":"cherries",
      "emoji":"🍒",
      "tier":5,
      "num_in_tier":1,
      "exp":150,
      "period": 60,
      "offset": 20,
      "amplitude": 70,
      "rw_amplitude": 30
   },
   "strawberry":{
      "str":"strawberry",
      "emoji":"🍓",
      "tier":5,
      "num_in_tier":2,
      "exp":175,
      "period": 65,
      "offset": 32,
      "amplitude": 90,
      "rw_amplitude": 36
   },
   "grapes":{
      "str":"grapes",
      "emoji":"🍇",
      "tier":5,
      "num_in_tier":3,
      "exp":200,
      "period": 75,
      "offset": 72,
      "amplitude": 130,
      "rw_amplitude": 46
   },
   "blueberries":{
      "str":"blueberries",
      "emoji":"🫐",
      "tier":5,
      "num_in_tier":4,
      "exp":225,
      "period": 85,
      "offset": 45,
      "amplitude": 180,
      "rw_amplitude": 30
   },
   "mango":{
      "str":"mango",
      "emoji":"🥭",
      "tier":6,
      "num_in_tier":1,
      "exp":286,
      "period": 45,
      "offset": 12,
      "amplitude": 200,
      "rw_amplitude": 65
   },
   "pineapple":{
      "str":"pineapple",
      "emoji":"🍍",
      "tier":6,
      "num_in_tier":3,
      "exp":358,
      "period": 42,
      "offset": 4,
      "amplitude": 300,
      "rw_amplitude": 100
   },
   "coconut":{
      "str":"coconut",
      "emoji":"🥥",
      "tier":6,
      "num_in_tier":2,
      "exp":322,
      "period": 39,
      "offset": 20,
      "amplitude": 280,
      "rw_amplitude": 89
   },
   "microbe":{
      "str":"microbe",
      "emoji":"🦠",
      "tier":0,
      "num_in_tier":5,
      "exp":100,
      "period": 1,
      "offset": 0,
      "amplitude": 1,
      "rw_amplitude": 10
   },
   "syringe":{
      "str":"syringe",
      "emoji":"💉",
      "tier":0,
      "num_in_tier":5,
      "exp":100,
      "period": 1,
      "offset": 0,
      "amplitude": 1,
      "rw_amplitude": 10
   },
   "briefs":{
      "str":"briefs",
      "emoji":"🩲",
      "tier":0,
      "num_in_tier":5,
      "exp":100,
      "period": 1,
      "offset": 0,
      "amplitude": 1,
      "rw_amplitude": 10
   },
   "lungs":{
      "str":"lungs",
      "emoji":"🫁",
      "tier":0,
      "num_in_tier":5,
      "exp":100,
      "period": 1,
      "offset": 0,
      "amplitude": 1,
      "rw_amplitude": 10
   },
   "pill":{
      "str":"pill",
      "emoji":"💊",
      "tier":0,
      "num_in_tier":5,
      "exp":100,
      "period": 1,
      "offset": 0,
      "amplitude": 1,
      "rw_amplitude": 10
   }
};



let fruit_tiers = [
  {
    "name": "Rare Trash",
    "fruit": [],
    "fruit_str": [],
    "rarity_int": 0,
    "rarity_prop": 0
  },
  {
    "name": "Trash",
    "fruit": [],
    "fruit_str": [],
    "rarity_int": 20,
    "rarity_prop": 0.2,
  },
  {
    "name": "Barely Fruit",
    "fruit": [],
    "fruit_str": [],
    "rarity_int": 30,
    "rarity_prop": 0.3
  },
  {
    "name": "Common Fruit",
    "fruit": [],
    "fruit_str": [],
    "rarity_int": 34,
    "rarity_prop": 0.34
  },
  {
    "name": "Rare Fruit",
    "fruit": [],
    "fruit_str": [],
    "rarity_int": 12,
    "rarity_prop": 0.12
  },
  {
    "name": "Ultra Rare Fruit",
    "fruit": [],
    "fruit_str": [],
    "rarity_int": 3,
    "rarity_prop": 0.03
  },
  {
    "name": "Extraordinary Fruit",
    "fruit": [],
    "fruit_str": [],
    "rarity_int": 1,
    "rarity_prop": 0.01
  }
];

for (const key of Object.keys(fruit_dict)) {
  fruit_tiers[fruit_dict[key].tier]["fruit"].push(fruit_dict[key].emoji)
  fruit_tiers[fruit_dict[key].tier]["fruit_str"].push(fruit_dict[key].str)
}

let ticker_to_string = {};
for (const key of Object.keys(fruit_dict)) {
  ticker_to_string[fruit_dict[key].ticker] = fruit_dict[key]
}

let tier_cutoffs = [fruit_tiers[0].rarity_int];
for (let i = 1; i < fruit_tiers.length; i++) {
  let new_cutoff = fruit_tiers[i].rarity_int + tier_cutoffs[i - 1];
  tier_cutoffs = tier_cutoffs.concat(new_cutoff);
}

module.exports = {
  default_pick_limit, default_sides, default_delay, greedy, lucky,
  levels, min_perk_group, max_perk_group, ranks, greedy_perks, lucky_perks,
  tierRarity, fruit_arr_to_emoji_arr, fruit_arr_to_str_arr, emoji_to_string,
  fruit_dict, fruit_tiers, Fruit, tier_cutoffs, count_rare_fruits, perk_dict,
  Item, null_perk_l, null_perk_g, ticker_to_string,
  string_to_emoji, king_of_fruits, king_of_trash, empty_perk, item_dict
};
