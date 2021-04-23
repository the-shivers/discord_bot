// Config
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
}

let fruit_tiers = [
  {
    "name": "Trash",
    "fruit": ["🍂", "🪵", "🥚", "🥌", "🗿"],
    "fruit_str": ["fallen_leaf", "wood", "egg", "curling_stone", "moyai"],
    "rarity_int": 20,
    "rarity_prop": 0.2,
  },
  {
    "name": "Barely Fruit",
    "fruit": ["🫒", "🍅", "🌶️", "🍆", "🥑"],
    "fruit_str": ["olive", "tomato", "hot_pepper", "eggplant", "avocado"],
    "rarity_int": 30,
    "rarity_prop": 0.3
  },
  {
    "name": "Common Fruit",
    "fruit": ["🍏", "🍎", "🍐", "🍑", "🍌"],
    "fruit_str": ["green_apple", "apple", "pear", "peach", "banana"],
    "rarity_int": 34,
    "rarity_prop": 0.34
  },
  {
    "name": "Rare Fruit",
    "fruit": ["🍊", "🍋", "🍉", "🍈", "🥝"],
    "fruit_str": ["tangerine", "lemon", "watermelon", "melon", "kiwi"],
    "rarity_int": 12,
    "rarity_prop": 0.12
  },
  {
    "name": "Ultra Rare Fruit",
    "fruit": ["🍒", "🍓", "🍇", "🫐"],
    "fruit_str": ["cherries", "strawberry", "grapes", "blueberries"],
    "rarity_int": 3,
    "rarity_prop": 0.03
  },
  {
    "name": "Extraordinary Fruit",
    "fruit": ["🥭", "🥥", "🍍"],
    "fruit_str": ["mango", "coconut", "pineapple"],
    "rarity_int": 1,
    "rarity_prop": 0.01
  }
];

let tier_cutoffs = [fruit_tiers[0].rarity_int];
for (let i = 1; i < fruit_tiers.length; i++) {
  let new_cutoff = fruit_tiers[i].rarity_int + tier_cutoffs[i - 1];
  tier_cutoffs = tier_cutoffs.concat(new_cutoff);
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

let fruit_dict = {};
for (const [key, value] of Object.entries(emoji_to_string)) {
  fruit_dict[value] = {
    "str": value,
    "emoji": key,
  }
}

for (let i = 0; i < fruit_tiers.length; i++) {
  let curr_tier = fruit_tiers[i];
  for (let j = 0; j < curr_tier.fruit.length; j++) {
    let curr_emoji = curr_tier.fruit[j];
    let curr_str = emoji_to_string[curr_emoji];
    fruit_dict[curr_str]["tier"] = i + 1;
    fruit_dict[curr_str]["num_in_tier"] = j + 1;
    fruit_dict[curr_str]["exp"] = fruit_exp(i + 1, j + 1);
  }
}


let rare_trash_arr = ["microbe", "syringe", "briefs", "lungs", "pill"]
let rare_trash_emoji_arr = ["🦠","💉","🩲","🫁","💊"]
for (let i=0; i < 5; i++) {
  let curr_str = rare_trash_arr[i];
  fruit_dict[rare_trash_arr[i]]["tier"] = 0;
  fruit_dict[curr_str]["num_in_tier"] = 5;
  fruit_dict[curr_str]["exp"] = 100;
}

module.exports = {
  default_pick_limit, default_sides, default_delay, greedy, lucky,
  levels, min_perk_group, max_perk_group, ranks, greedy_perks, lucky_perks,
  tierRarity, fruit_arr_to_emoji_arr, fruit_arr_to_str_arr, emoji_to_string,
  fruit_dict, fruit_tiers, Fruit, tier_cutoffs, count_rare_fruits, perk_dict,
  Item, rare_trash_arr, rare_trash_emoji_arr, null_perk_l, null_perk_g,
  string_to_emoji, king_of_fruits, king_of_trash, empty_perk
};
