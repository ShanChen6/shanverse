// The Bách Linh Kỳ roster: creatures and heroes of Vietnamese folklore.
//
// A monster is data. Its abilities are built from a small set of effects
// (see Ability below) that rules.ts knows how to apply, so most new monsters
// are a new entry here and nothing else. A truly new kind of effect needs
// code in rules.ts, and Tianwu (the AI) has to learn it too.
//
// Teams take exactly one monster per level, so adding monsters adds choice
// at a level without upsetting the balance between levels.

export type Path = "land" | "water" | "air";

export type Ability =
  // Passive: always on.
  | { kind: "immune-ranged" } // cannot be hit by ranged attacks
  | { kind: "river-bonus"; levels: number } // fights at this many levels higher while standing on a river
  | { kind: "fake-level"; shown: number } // while face down, shows this level instead of its own
  | { kind: "guard-ranged" } // allies next to it cannot be hit by ranged attacks
  | { kind: "walk-mountain" } // can walk onto and through mountains
  // Active: once per game, takes the whole turn, reveals the monster.
  | { kind: "terraform"; to: "river" | "mountain"; count: number; radius: number }
  | { kind: "strike"; range: number; power: number }; // one ranged attack

export type Text = { vi: string; en: string };

export type Monster = {
  id: string;
  name: Text;
  level: 1 | 2 | 3 | 4 | 5;
  path: Path;
  /** Cells it can move per turn. */
  steps: number;
  /** Close-combat strength; only compared between monsters of equal level. */
  melee: number;
  /** Ranged attack, if it has one: strength and reach (in cells, diagonals count as one). */
  ranged: { power: number; range: number } | null;
  abilities: Ability[];
  /** In every player's collection from the start. Exactly one per level. */
  starter?: boolean;
  /** One line of folklore for the collection and tooltips. */
  lore: Text;
  /** Text for each ability, in the same order. */
  abilityText: Text[];
};

export const MONSTERS: Monster[] = [
  {
    id: "rua-con",
    name: { vi: "Rùa con", en: "Little Turtle" },
    level: 1,
    path: "water",
    steps: 1,
    melee: 2,
    ranged: null,
    abilities: [{ kind: "immune-ranged" }],
    starter: true,
    lore: { vi: "Chậm mà chắc, mai cứng chẳng sợ tên bay.", en: "Slow and steady; arrows bounce off its shell." },
    abilityText: [{ vi: "Mai cứng: không bị đánh tầm xa.", en: "Hard shell: cannot be hit by ranged attacks." }],
  },
  {
    id: "coc-tia",
    name: { vi: "Cóc tía", en: "Purple Toad" },
    level: 1,
    path: "land",
    steps: 2,
    melee: 1,
    ranged: null,
    abilities: [{ kind: "terraform", to: "river", count: 1, radius: 1 }],
    lore: { vi: "Con cóc là cậu ông trời, ai mà đánh cóc thì trời đánh cho.", en: "The toad is Heaven's uncle; strike it and Heaven strikes back." },
    abilityText: [{ vi: "Cóc kiện trời (1 lần): biến 1 ô đồng bằng kề bên thành sông.", en: "Suing Heaven (once): turns a plain next to it into river." }],
  },
  {
    id: "ma-da",
    name: { vi: "Ma Da", en: "Ma Da" },
    level: 1,
    path: "water",
    steps: 2,
    melee: 3,
    ranged: null,
    abilities: [{ kind: "river-bonus", levels: 1 }],
    lore: { vi: "Hồn ma dưới nước, chờ kéo chân kẻ lội sông.", en: "A water ghost waiting to drag waders under." },
    abilityText: [{ vi: "Kéo chân: đứng trên sông thì đánh như cấp 2.", en: "Drag under: fights as level 2 while on a river." }],
  },
  {
    id: "moc-tinh",
    name: { vi: "Mộc Tinh", en: "Tree Spirit" },
    level: 2,
    path: "land",
    steps: 1,
    melee: 1,
    ranged: { power: 3, range: 2 },
    abilities: [],
    starter: true,
    lore: { vi: "Cây cổ thụ thành tinh, bắn gai từ xa.", en: "An ancient tree turned spirit, shooting thorns from afar." },
    abilityText: [],
  },
  {
    id: "ho-tinh",
    name: { vi: "Hồ Tinh", en: "Fox Spirit" },
    level: 2,
    path: "land",
    steps: 3,
    melee: 3,
    ranged: null,
    abilities: [{ kind: "fake-level", shown: 3 }],
    lore: { vi: "Cáo chín đuôi giỏi hoá phép, đổi dạng lừa người.", en: "The nine-tailed fox, a master of disguise." },
    abilityText: [{ vi: "Đổi dạng: khi còn úp, đối thủ thấy cấp 3.", en: "Disguise: while face down, it shows as level 3." }],
  },
  {
    id: "dai-bang",
    name: { vi: "Đại Bàng tinh", en: "Giant Eagle" },
    level: 2,
    path: "air",
    steps: 3,
    melee: 2,
    ranged: null,
    abilities: [],
    lore: { vi: "Chim khổng lồ từng bắt công chúa trong truyện Thạch Sanh.", en: "The giant bird that carried off the princess in Thạch Sanh's tale." },
    abilityText: [],
  },
  {
    id: "lan",
    name: { vi: "Lân", en: "Lân" },
    level: 3,
    path: "land",
    steps: 2,
    melee: 3,
    ranged: null,
    abilities: [{ kind: "guard-ranged" }],
    starter: true,
    lore: { vi: "Linh vật trong Tứ linh, múa xua tà ma.", en: "One of the Four Sacred Beasts, dancing evil away." },
    abilityText: [{ vi: "Múa lân: quân mình kề bên Lân không bị đánh tầm xa.", en: "Lion dance: allies next to it cannot be hit by ranged attacks." }],
  },
  {
    id: "chan-tinh",
    name: { vi: "Chằn Tinh", en: "Chằn Tinh" },
    level: 3,
    path: "land",
    steps: 2,
    melee: 5,
    ranged: null,
    abilities: [],
    lore: { vi: "Yêu tinh ăn thịt người, bị Thạch Sanh hạ bằng búa thần.", en: "The man-eating ogre Thạch Sanh slew with his magic axe." },
    abilityText: [],
  },
  {
    id: "ngua-sat",
    name: { vi: "Ngựa sắt", en: "Iron Horse" },
    level: 3,
    path: "air",
    steps: 3,
    melee: 2,
    ranged: { power: 2, range: 1 },
    abilities: [],
    lore: { vi: "Ngựa sắt phun lửa, đưa Thánh Gióng bay về trời.", en: "The fire-breathing iron horse that carried Gióng to the sky." },
    abilityText: [],
  },
  {
    id: "son-tinh",
    name: { vi: "Sơn Tinh", en: "Mountain God" },
    level: 4,
    path: "land",
    steps: 2,
    melee: 4,
    ranged: null,
    abilities: [{ kind: "walk-mountain" }, { kind: "terraform", to: "mountain", count: 1, radius: 2 }],
    starter: true,
    lore: { vi: "Thần núi Tản Viên, nước dâng bao nhiêu núi cao bấy nhiêu.", en: "God of Mount Tản Viên: however high the water, the mountain rises higher." },
    abilityText: [
      { vi: "Đi được trên núi.", en: "Walks over mountains." },
      { vi: "Dựng núi (1 lần): biến 1 ô đồng bằng trống trong 2 ô thành núi.", en: "Raise mountain (once): turns an empty plain within 2 cells into a mountain." },
    ],
  },
  {
    id: "thuy-tinh",
    name: { vi: "Thủy Tinh", en: "Water God" },
    level: 4,
    path: "water",
    steps: 2,
    melee: 3,
    ranged: { power: 2, range: 2 },
    abilities: [{ kind: "terraform", to: "river", count: 3, radius: 1 }],
    lore: { vi: "Thần nước, hô mưa gọi gió đánh Sơn Tinh mỗi năm.", en: "God of the waters, raising storms against the Mountain God every year." },
    abilityText: [{ vi: "Dâng nước (1 lần): biến tối đa 3 ô đồng bằng quanh mình thành sông.", en: "Flood (once): turns up to 3 plains around it into river." }],
  },
  {
    id: "phuong-hoang",
    name: { vi: "Phượng Hoàng", en: "Phoenix" },
    level: 4,
    path: "air",
    steps: 3,
    melee: 2,
    ranged: { power: 3, range: 2 },
    abilities: [],
    lore: { vi: "Chim thần trong Tứ linh, điềm lành của thái bình.", en: "Sacred bird of the Four Beasts, an omen of peace." },
    abilityText: [],
  },
  {
    id: "thanh-giong",
    name: { vi: "Thánh Gióng", en: "Saint Gióng" },
    level: 5,
    path: "land",
    steps: 3,
    melee: 5,
    ranged: null,
    abilities: [{ kind: "strike", range: 4, power: 5 }],
    starter: true,
    lore: { vi: "Cậu bé làng Phù Đổng vươn vai thành tráng sĩ đánh giặc Ân.", en: "The boy of Phù Đổng who grew into a giant to drive out the invaders." },
    abilityText: [{ vi: "Nhổ tre (1 lần): đánh tầm xa 4 ô với sức 5.", en: "Bamboo sweep (once): a ranged attack up to 4 cells with strength 5." }],
  },
  {
    id: "rong",
    name: { vi: "Rồng thiêng", en: "Sacred Dragon" },
    level: 5,
    path: "air",
    steps: 2,
    melee: 4,
    ranged: { power: 3, range: 2 },
    abilities: [],
    lore: { vi: "Tổ tiên con Rồng cháu Tiên, phun lửa từ trời.", en: "Ancestor of the Dragon's children, breathing fire from the sky." },
    abilityText: [],
  },
  {
    id: "kim-quy",
    name: { vi: "Kim Quy", en: "Golden Turtle" },
    level: 5,
    path: "water",
    steps: 1,
    melee: 3,
    ranged: { power: 5, range: 3 },
    abilities: [{ kind: "immune-ranged" }],
    lore: { vi: "Thần Kim Quy trao móng làm nỏ thần cho An Dương Vương.", en: "The Golden Turtle who gave King An Dương his magic crossbow." },
    abilityText: [{ vi: "Mai thần: không bị đánh tầm xa. Nỏ thần bắn xa nhất trận.", en: "Divine shell: cannot be hit by ranged attacks. Its crossbow reaches the farthest." }],
  },
];

export const MONSTER_BY_ID = new Map(MONSTERS.map((monster) => [monster.id, monster]));

export function monster(id: string): Monster {
  const found = MONSTER_BY_ID.get(id);
  if (!found) throw new Error(`Unknown monster "${id}"`);
  return found;
}

export const hasAbility = <K extends Ability["kind"]>(m: Monster, kind: K): Extract<Ability, { kind: K }> | undefined =>
  m.abilities.find((ability): ability is Extract<Ability, { kind: K }> => ability.kind === kind);

/** The active ability, if any (at most one per monster). */
export const activeAbility = (m: Monster) => m.abilities.find((a) => a.kind === "terraform" || a.kind === "strike") as Extract<Ability, { kind: "terraform" | "strike" }> | undefined;

export const LEVELS = [1, 2, 3, 4, 5] as const;
export const STARTERS = MONSTERS.filter((m) => m.starter).map((m) => m.id);
