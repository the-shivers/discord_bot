// Config
let fruit = [
  {
    "name": "Trash",
    "fruit": ["🪵", "🍂", "🥌", "🥚", "🗿"],
    "rarity_int": 20,
    "rarity_prop": 0.2,
  },
  {
    "name": "Barely Fruit",
    "fruit": ["🍅", "🌶️", "🥑", "🍆", "🫒"],
    "rarity_int": 30,
    "rarity_prop": 0.3
  },
  {
    "name": "Common Fruit",
    "fruit": ["🍏", "🍎", "🍐", "🍊", "🍋"],
    "rarity_int": 34,
    "rarity_prop": 0.34
  },
  {
    "name": "Rare Fruit",
    "fruit": ["🥝", "🍌", "🍉", "🍑", "🍈"],
    "rarity_int": 12,
    "rarity_prop": 0.12
  },
  {
    "name": "Ultra Rare Fruit",
    "fruit": ["🫐", "🍓", "🍇", "🍒"],
    "rarity_int": 3,
    "rarity_prop": 0.03
  },
  {
    "name": "Extraordinary Fruit",
    "fruit": ["🥭", "🍍", "🥥"],
    "rarity_int": 1,
    "rarity_prop": 0.01
  }
];

let levels = [
  100, 200, 300, 500, 800, 1300, 2100, 3400, 5500, 9000, 14000, 20000
];

let daily_picks = 5;
let single_pick_limit = 2;

module.exports = { fruit, levels, daily_picks, single_pick_limit };
