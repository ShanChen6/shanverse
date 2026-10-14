// The Bách Linh Kỳ roster: 50 creatures and heroes of Vietnamese folklore,
// laid out as 5 elements × 5 levels × 2. The two monsters sharing an
// element and a level play differently (a fighter and a shooter, a
// tank and a trickster...), so picking between them is picking a style.
//
// A monster is data. Its abilities are built from a small set of effects
// (see Ability below) that rules.ts knows how to apply, so most new monsters
// are a new entry here and nothing else. A truly new kind of effect needs
// code in rules.ts, and Tianwu (the AI) has to learn it too.
//
// Teams take exactly one monster per level, so adding monsters adds choice
// at a level without upsetting the balance between levels.

export type Path = "land" | "water" | "air";

export type Text = { vi: string; en: string };

/**
 * Ngũ hành, the five elements. In a fight, a monster whose element overcomes
 * (khắc) its opponent's fights one level higher; a defender standing next to
 * an ally whose element feeds (sinh) its own defends one level higher. While
 * face down, a monster's element is hidden.
 */
export type Element = "kim" | "moc" | "thuy" | "hoa" | "tho";
export const ELEMENTS: Element[] = ["kim", "moc", "thuy", "hoa", "tho"];
export const ELEMENT_NAME: Record<Element, Text> = {
  kim: { vi: "Kim", en: "Metal" },
  moc: { vi: "Mộc", en: "Wood" },
  thuy: { vi: "Thủy", en: "Water" },
  hoa: { vi: "Hỏa", en: "Fire" },
  tho: { vi: "Thổ", en: "Earth" },
};
/** Tương khắc: each element overcomes the next (Kim chặt Mộc, Mộc hút Thổ, Thổ ngăn Thủy, Thủy dập Hỏa, Hỏa nung Kim). */
export const OVERCOMES: Record<Element, Element> = { kim: "moc", moc: "tho", tho: "thuy", thuy: "hoa", hoa: "kim" };
/** Tương sinh: each element feeds the next (Kim sinh Thủy, Thủy sinh Mộc, Mộc sinh Hỏa, Hỏa sinh Thổ, Thổ sinh Kim). */
export const FEEDS: Record<Element, Element> = { kim: "thuy", thuy: "moc", moc: "hoa", hoa: "tho", tho: "kim" };

export type Ability =
  // Passive: always on (unless the monster is sealed).
  | { kind: "immune-ranged" } // cannot be hit by ranged attacks
  | { kind: "river-bonus"; levels: number } // fights at this many levels higher while standing on a river
  | { kind: "fake-level"; shown: number } // while face down, shows this level instead of its own
  | { kind: "guard-ranged" } // allies next to it cannot be hit by ranged attacks
  | { kind: "walk-mountain" } // can walk onto and through mountains
  | { kind: "aura"; on: "attack" | "defense" } // allies next to it fight one level higher when attacking / defending
  | { kind: "revive" } // the first time it falls, it comes back on its home rows
  // Active: once per game, takes the whole turn, reveals the monster.
  | { kind: "terraform"; to: "river" | "mountain"; count: number; radius: number }
  | { kind: "strike"; range: number; power: number } // one ranged attack
  | { kind: "leap"; range: number } // jump to any cell in range, ignoring the way there; onto an enemy is a melee attack
  | { kind: "bind"; range: number; turns: number } // an enemy in range cannot act for this many of its turns
  | { kind: "seal"; range: number } // an enemy in range shows its true face and loses every ability for good
  | { kind: "swap"; range: number } // trade places with any monster in range, friend or foe
  | { kind: "rise" } // grows one level for good (up to the maximum)
  | { kind: "recall"; maxLevel: number }; // brings back the last fallen ally of at most this level, onto the home rows

export const ACTIVE_KINDS = ["terraform", "strike", "leap", "bind", "seal", "swap", "rise", "recall"] as const;
export type ActiveAbility = Extract<Ability, { kind: (typeof ACTIVE_KINDS)[number] }>;

export type Monster = {
  id: string;
  name: Text;
  level: 1 | 2 | 3 | 4 | 5;
  element: Element;
  path: Path;
  /** Cells it can move per turn. */
  steps: number;
  /** Close-combat strength; only compared between monsters fighting at equal level. */
  melee: number;
  /** Ranged attack, if it has one: strength and reach (in cells, diagonals count as one). */
  ranged: { power: number; range: number } | null;
  abilities: Ability[];
  /** In every player's collection from the start. Two per level, one of each set of five elements across a set. */
  starter?: boolean;
  /** One line of folklore for the collection and tooltips. */
  lore: Text;
  /** Text for each ability, in the same order. */
  abilityText: Text[];
};

type Stats = Pick<Monster, "level" | "element" | "path" | "steps" | "melee" | "ranged">;
const t = (vi: string, en: string): Text => ({ vi, en });
const m = (id: string, name: Text, stats: Stats, abilities: Ability[], lore: Text, abilityText: Text[] = [], starter = false): Monster => ({
  id,
  name,
  ...stats,
  abilities,
  lore,
  abilityText,
  ...(starter ? { starter } : {}),
});

export const MONSTERS: Monster[] = [
  // --- Kim (Metal): sharp, unyielding, war and guard --------------------------------
  m("chim-lac", t("Chim Lạc", "Lạc Bird"), { level: 1, element: "kim", path: "air", steps: 3, melee: 1, ranged: null }, [],
    t("Chim thiêng khắc trên mặt trống đồng, bay trước đoàn quân.", "The sacred bird on the bronze drums, flying ahead of the army.")),
  m("ma-tranh", t("Ma Trành", "Tiger's Thrall"), { level: 1, element: "kim", path: "land", steps: 2, melee: 2, ranged: null }, [{ kind: "fake-level", shown: 2 }],
    t("Hồn người bị hổ vồ, phải dẫn đường cho hổ.", "The ghost of a tiger's victim, bound to lead it to prey."),
    [t("Đội lốt hổ: khi còn úp, hiện cấp 2.", "Tiger's shadow: shows level 2 while face down.")]),
  m("dai-bang", t("Đại Bàng", "Giant Eagle"), { level: 2, element: "kim", path: "air", steps: 3, melee: 2, ranged: null }, [],
    t("Chim khổng lồ từng bắt công chúa trong truyện Thạch Sanh.", "The giant bird that carried off the princess in Thạch Sanh's tale.")),
  m("ong-ba-muoi", t("Ông Ba Mươi", "Old Thirty"), { level: 2, element: "kim", path: "land", steps: 2, melee: 3, ranged: null }, [{ kind: "leap", range: 3 }],
    t("Ông hổ trong rừng, ai bắt được thưởng ba mươi quan.", "The forest tiger, worth thirty strings of coins to whoever catches it."),
    [t("Vồ mồi (1 lần): nhảy tới ô bất kỳ trong 3 ô, nhảy vào địch là đánh cận chiến.", "Pounce (once): leap to any cell within 3; onto an enemy is a melee attack.")]),
  m("con-kim", t("Con Kìm", "Roof Guardian"), { level: 3, element: "kim", path: "land", steps: 1, melee: 3, ranged: null }, [{ kind: "guard-ranged" }],
    t("Đầu rồng đuôi cá trên nóc đình, trấn giữ hỏa hoạn.", "Dragon-headed, fish-tailed guardian on temple roofs, warding off fire."),
    [t("Trấn trạch: đồng minh kề bên không bị đánh tầm xa.", "Roof ward: allies next to it cannot be hit by ranged attacks.")]),
  m("cao-bien", t("Cao Biền", "Gao Pian"), { level: 3, element: "kim", path: "land", steps: 2, melee: 2, ranged: { power: 2, range: 2 } }, [{ kind: "seal", range: 3 }],
    t("Thuật sĩ yểm bùa, trấn long mạch bằng kiếm đồng.", "A sorcerer who pinned the land's dragon veins with bronze swords."),
    [t("Yểm bùa (1 lần): một kẻ địch trong 3 ô lộ mặt và mất mọi kỹ năng.", "Seal (once): an enemy within 3 is revealed and loses all its abilities.")]),
  m("an-duong-vuong", t("An Dương Vương", "King An Dương"), { level: 4, element: "kim", path: "land", steps: 2, melee: 2, ranged: { power: 4, range: 3 } }, [],
    t("Vua xây thành Cổ Loa, giữ nỏ thần Liên Châu.", "The king who built Cổ Loa and held the magic crossbow."), [], true),
  m("ly-thuong-kiet", t("Lý Thường Kiệt", "Lý Thường Kiệt"), { level: 4, element: "kim", path: "land", steps: 2, melee: 5, ranged: null }, [{ kind: "aura", on: "defense" }],
    t("Danh tướng nhà Lý, gắn với bài thơ thần Nam quốc sơn hà.", "The Lý general of the poem Mountains and Rivers of the Southern Country."),
    [t("Nam quốc sơn hà: đồng minh kề bên +1 cấp khi bị đánh.", "Southern land: allies next to it defend one level higher.")]),
  m("bach-ho", t("Bạch Hổ", "White Tiger"), { level: 5, element: "kim", path: "land", steps: 3, melee: 5, ranged: null }, [{ kind: "leap", range: 3 }],
    t("Thánh thú phương Tây, tiếng gầm trấn áp tà ma.", "Sacred beast of the West whose roar cows every demon."),
    [t("Hổ vồ (1 lần): nhảy tới ô bất kỳ trong 3 ô, nhảy vào địch là đánh cận chiến.", "Pounce (once): leap to any cell within 3; onto an enemy is a melee attack.")], true),
  m("tran-hung-dao", t("Trần Hưng Đạo", "Trần Hưng Đạo"), { level: 5, element: "kim", path: "land", steps: 2, melee: 4, ranged: { power: 3, range: 2 } }, [{ kind: "aura", on: "attack" }],
    t("Đức Thánh Trần, ba lần đánh tan quân Nguyên.", "Saint Trần, who beat back the Mongol armies three times."),
    [t("Hịch tướng sĩ: đồng minh kề bên +1 cấp khi tấn công.", "Call to arms: allies next to it attack one level higher.")]),

  // --- Mộc (Wood): growth, roots, binding --------------------------------------------
  m("moc-tinh-non", t("Mộc Tinh non", "Sapling Spirit"), { level: 1, element: "moc", path: "land", steps: 1, melee: 1, ranged: { power: 2, range: 2 } }, [],
    t("Cây non vừa thành tinh, đã biết bắn gai.", "A young tree just come to life, already shooting thorns.")),
  m("ma-cay-gao", t("Ma Cây Gạo", "Kapok Ghost"), { level: 1, element: "moc", path: "land", steps: 2, melee: 2, ranged: null }, [{ kind: "bind", range: 1, turns: 1 }],
    t("Ma ẩn trong gốc gạo đầu làng, níu chân người qua đêm.", "The ghost of the village kapok tree, catching night walkers by the ankle."),
    [t("Níu chân (1 lần): một kẻ địch kề bên đứng yên 1 lượt.", "Snag (once): an adjacent enemy cannot act for 1 turn.")]),
  m("chu-cuoi", t("Chú Cuội", "Cuội"), { level: 2, element: "moc", path: "land", steps: 2, melee: 2, ranged: null }, [{ kind: "recall", maxLevel: 3 }],
    t("Chàng Cuội có cây đa thần cải tử hoàn sinh.", "Cuội, keeper of the banyan whose leaves bring the dead back."),
    [t("Lá đa thần (1 lần): gọi lại đồng minh cấp ≤ 3 vừa ngã về hàng nhà.", "Banyan leaf (once): brings the last fallen ally of level 3 or less back to the home rows.")]),
  m("vuon-than", t("Vượn Thần", "Spirit Ape"), { level: 2, element: "moc", path: "land", steps: 3, melee: 3, ranged: null }, [{ kind: "walk-mountain" }],
    t("Linh thú hầu cận Mẫu Thượng Ngàn, chuyền cành vượt núi.", "The Forest Mother's ape, swinging over the mountains."),
    [t("Leo núi: đi được trên núi.", "Climber: can walk onto and over mountains.")]),
  m("bach-ke-tinh", t("Bạch Kê Tinh", "White Rooster Spirit"), { level: 3, element: "moc", path: "air", steps: 3, melee: 2, ranged: null }, [{ kind: "bind", range: 2, turns: 1 }],
    t("Gà trắng thành tinh, phá thành Cổ Loa mỗi đêm.", "The white rooster spirit that tore down Cổ Loa's walls each night."),
    [t("Tiếng gáy mê hoặc (1 lần): một kẻ địch trong 2 ô đứng yên 1 lượt.", "Spellbinding crow (once): an enemy within 2 cannot act for 1 turn.")]),
  m("tien-dung", t("Tiên Dung", "Princess Tiên Dung"), { level: 3, element: "moc", path: "land", steps: 2, melee: 2, ranged: { power: 2, range: 2 } }, [{ kind: "aura", on: "defense" }],
    t("Công chúa đời Hùng, kết duyên với Chử Đồng Tử bên bãi cát.", "The Hùng princess who wed Chử Đồng Tử on a sandbank."),
    [t("Che chở: đồng minh kề bên +1 cấp khi bị đánh.", "Shelter: allies next to her defend one level higher.")]),
  m("chu-dong-tu", t("Chử Đồng Tử", "Chử Đồng Tử"), { level: 4, element: "moc", path: "land", steps: 2, melee: 3, ranged: null }, [{ kind: "terraform", to: "mountain", count: 2, radius: 1 }],
    t("Một trong Tứ bất tử, cắm gậy úp nón hóa thành quách trong một đêm.", "One of the Four Immortals, who raised a citadel overnight with a staff and a hat."),
    [t("Thành quách (1 lần): dựng núi trên tối đa 2 ô đồng bằng kề bên.", "Citadel (once): raises mountains on up to 2 plains next to him.")], true),
  m("chan-tinh", t("Chằn Tinh", "Ogre"), { level: 4, element: "moc", path: "land", steps: 2, melee: 5, ranged: null }, [],
    t("Yêu tinh ăn thịt người, bị Thạch Sanh hạ bằng búa thần.", "The man-eating ogre Thạch Sanh slew with his magic axe.")),
  m("mau-thuong-ngan", t("Mẫu Thượng Ngàn", "Mother of the Forests"), { level: 5, element: "moc", path: "land", steps: 2, melee: 3, ranged: { power: 3, range: 2 } }, [{ kind: "walk-mountain" }, { kind: "bind", range: 3, turns: 2 }],
    t("Thánh Mẫu cai quản núi rừng.", "The Holy Mother who rules the mountains and forests."),
    [t("Chúa rừng: đi được trên núi.", "Forest queen: can walk onto and over mountains."), t("Dây leo (1 lần): một kẻ địch trong 3 ô đứng yên 2 lượt.", "Vines (once): an enemy within 3 cannot act for 2 turns.")], true),
  m("xuong-cuong", t("Mộc Tinh Xương Cuồng", "Xương Cuồng"), { level: 5, element: "moc", path: "land", steps: 1, melee: 5, ranged: { power: 2, range: 3 } }, [{ kind: "immune-ranged" }],
    t("Cây cổ thụ ngàn năm thành yêu từ thời Hùng Vương.", "A thousand-year tree demon from the age of the Hùng kings."),
    [t("Vỏ ngàn năm: không bị đánh tầm xa.", "Ancient bark: cannot be hit by ranged attacks.")]),

  // --- Thủy (Water): waves, rivers, healing -------------------------------------------
  m("ma-da", t("Ma Da", "Ma Da"), { level: 1, element: "thuy", path: "water", steps: 2, melee: 3, ranged: null }, [{ kind: "river-bonus", levels: 1 }],
    t("Hồn ma dưới nước, chờ kéo chân kẻ lội sông.", "A water ghost waiting to drag waders under."),
    [t("Kéo chân: đứng trên sông thì +1 cấp.", "Drag under: fights one level higher on a river.")]),
  m("ca-chep", t("Cá Chép", "Carp"), { level: 1, element: "thuy", path: "water", steps: 3, melee: 1, ranged: null }, [{ kind: "rise" }],
    t("Cá chép vượt vũ môn hóa rồng.", "The carp that leaps the Dragon Gate and becomes a dragon."),
    [t("Vượt vũ môn (1 lần): lên 1 cấp vĩnh viễn.", "Dragon Gate (once): grows one level for good.")]),
  m("mai-an-tiem", t("Mai An Tiêm", "Mai An Tiêm"), { level: 2, element: "thuy", path: "land", steps: 2, melee: 1, ranged: { power: 2, range: 2 } }, [],
    t("Bị đày ra đảo hoang, trồng dưa hấu mà sống.", "Exiled to a desert island, he lived by growing watermelons."), [], true),
  m("da-trang", t("Dã Tràng", "Sand Crab"), { level: 2, element: "thuy", path: "water", steps: 2, melee: 3, ranged: null }, [{ kind: "immune-ranged" }],
    t("Dã tràng xe cát biển Đông, nhọc lòng mà chẳng nên công cán gì.", "The crab rolling sand balls on the shore, forever toiling for nothing."),
    [t("Mai cua: không bị đánh tầm xa.", "Crab shell: cannot be hit by ranged attacks.")]),
  m("nguu-tinh", t("Ngưu Tinh", "Water Buffalo Spirit"), { level: 3, element: "thuy", path: "water", steps: 2, melee: 5, ranged: null }, [{ kind: "river-bonus", levels: 1 }],
    t("Trâu tinh dưới đáy hồ, gọi mưa và húc ngã đối thủ.", "A buffalo demon in the lake bed that calls rain and gores its foes."),
    [t("Húc dưới nước: đứng trên sông thì +1 cấp.", "River charge: fights one level higher on a river.")], true),
  m("ngu-tinh", t("Ngư Tinh", "Fish Demon"), { level: 3, element: "thuy", path: "water", steps: 2, melee: 3, ranged: { power: 2, range: 2 } }, [],
    t("Cá thành tinh ở biển Đông, bị Lạc Long Quân diệt.", "The sea fish demon slain by the Dragon Lord.")),
  m("thuy-tinh", t("Thủy Tinh", "Water God"), { level: 4, element: "thuy", path: "water", steps: 2, melee: 3, ranged: { power: 2, range: 2 } }, [{ kind: "terraform", to: "river", count: 3, radius: 1 }],
    t("Thần nước, hô mưa gọi gió đánh Sơn Tinh mỗi năm.", "God of the waters, raising storms against the Mountain God every year."),
    [t("Dâng nước (1 lần): biến tối đa 3 ô đồng bằng kề bên thành sông.", "Flood (once): turns up to 3 plains next to it into river.")]),
  m("thuong-luong", t("Thuồng Luồng", "River Dragon"), { level: 4, element: "thuy", path: "water", steps: 2, melee: 5, ranged: null }, [{ kind: "river-bonus", levels: 1 }],
    t("Giao long mình rắn có chân, đánh đắm thuyền bè.", "The legged river serpent that sinks boats."),
    [t("Sóng dữ: đứng trên sông thì +1 cấp.", "Wild waves: fights one level higher on a river.")]),
  m("lac-long-quan", t("Lạc Long Quân", "Dragon Lord"), { level: 5, element: "thuy", path: "water", steps: 2, melee: 4, ranged: { power: 3, range: 2 } }, [{ kind: "leap", range: 3 }],
    t("Vua biển cả, cha của trăm con Rồng cháu Tiên.", "Lord of the sea, father of the hundred children of the Dragon and the Fairy."),
    [t("Hóa rồng (1 lần): bay tới ô bất kỳ trong 3 ô, đáp vào địch là đánh cận chiến.", "Dragon form (once): fly to any cell within 3; onto an enemy is a melee attack.")]),
  m("mau-thoai", t("Mẫu Thoải", "Mother of Waters"), { level: 5, element: "thuy", path: "water", steps: 2, melee: 3, ranged: { power: 3, range: 3 } }, [{ kind: "recall", maxLevel: 4 }],
    t("Thánh Mẫu cai quản sông hồ.", "The Holy Mother who rules the rivers and lakes."),
    [t("Nước cam lồ (1 lần): gọi lại đồng minh cấp ≤ 4 vừa ngã về hàng nhà.", "Healing waters (once): brings the last fallen ally of level 4 or less back to the home rows.")]),

  // --- Hỏa (Fire): heat, lightning, fury ------------------------------------------------
  m("coc-tia", t("Cóc Tía", "Purple Toad"), { level: 1, element: "hoa", path: "land", steps: 2, melee: 1, ranged: null }, [{ kind: "terraform", to: "river", count: 1, radius: 1 }],
    t("Con cóc là cậu ông trời, ai mà đánh cóc thì trời đánh cho.", "The toad is Heaven's uncle; strike it and Heaven strikes back."),
    [t("Cóc kiện trời (1 lần): biến 1 ô đồng bằng kề bên thành sông.", "Suing Heaven (once): turns a plain next to it into river.")], true),
  m("ma-troi", t("Ma Trơi", "Will-o'-the-Wisp"), { level: 1, element: "hoa", path: "air", steps: 3, melee: 1, ranged: { power: 1, range: 2 } }, [],
    t("Đốm lửa ma lập lòe trên bãi tha ma.", "A ghost flame flickering over the graves.")),
  m("ho-tinh", t("Hồ Tinh", "Fox Spirit"), { level: 2, element: "hoa", path: "land", steps: 3, melee: 3, ranged: null }, [{ kind: "fake-level", shown: 3 }],
    t("Cáo chín đuôi đầm Dạ Trạch, giỏi biến hình.", "The nine-tailed fox of Dạ Trạch marsh, a master of disguise."),
    [t("Biến hình: khi còn úp, hiện cấp 3.", "Disguise: shows level 3 while face down.")]),
  m("ong-tao", t("Ông Táo", "Kitchen God"), { level: 2, element: "hoa", path: "land", steps: 2, melee: 2, ranged: null }, [{ kind: "aura", on: "attack" }],
    t("Thần bếp, cưỡi cá chép về trời báo chuyện nhân gian.", "The kitchen god who rides a carp to Heaven to report on the year."),
    [t("Lửa bếp: đồng minh kề bên +1 cấp khi tấn công.", "Hearth fire: allies next to him attack one level higher.")]),
  m("xa-tinh", t("Xà Tinh", "Fire Serpent"), { level: 3, element: "hoa", path: "land", steps: 3, melee: 4, ranged: { power: 2, range: 1 } }, [],
    t("Rắn tinh tu ngàn năm, phun độc lửa.", "A thousand-year serpent spitting fiery venom.")),
  m("ngua-sat", t("Ngựa Sắt", "Iron Horse"), { level: 3, element: "hoa", path: "air", steps: 3, melee: 2, ranged: { power: 2, range: 1 } }, [],
    t("Ngựa sắt phun lửa, đưa Thánh Gióng bay về trời.", "The fire-breathing iron horse that carried Gióng to the sky."), [], true),
  m("phuong-hoang", t("Phượng Hoàng", "Phoenix"), { level: 4, element: "hoa", path: "air", steps: 3, melee: 2, ranged: { power: 2, range: 2 } }, [{ kind: "revive" }],
    t("Chim lửa phương Nam, tái sinh từ tro tàn.", "Fire bird of the South, reborn from its ashes."),
    [t("Tái sinh: lần đầu ngã xuống, hồi sinh ở hàng nhà.", "Rebirth: the first time it falls, it returns on its home rows.")]),
  m("than-set", t("Thần Sét", "Thunder God"), { level: 4, element: "hoa", path: "air", steps: 2, melee: 3, ranged: null }, [{ kind: "strike", range: 4, power: 4 }],
    t("Thần cầm búa đá giáng sét xuống trần gian.", "The god who hurls lightning with a stone hammer."),
    [t("Giáng sét (1 lần): đánh tầm xa 4 ô với sức 4.", "Thunderbolt (once): a ranged attack up to 4 cells with strength 4.")]),
  m("phu-dong", t("Phù Đổng Thiên Vương", "Saint Gióng"), { level: 5, element: "hoa", path: "land", steps: 3, melee: 5, ranged: null }, [{ kind: "rise" }],
    t("Cậu bé làng Phù Đổng vươn vai thành tráng sĩ đánh giặc Ân.", "The boy of Phù Đổng who grew into a giant to drive out the invaders."),
    [t("Vươn vai (1 lần): lên 1 cấp vĩnh viễn.", "Stand tall (once): grows one level for good.")]),
  m("lieu-hanh", t("Mẫu Liễu Hạnh", "Holy Mother Liễu Hạnh"), { level: 5, element: "hoa", path: "land", steps: 2, melee: 3, ranged: { power: 4, range: 3 } }, [{ kind: "fake-level", shown: 4 }],
    t("Đứng đầu Tứ bất tử, biến hóa khôn lường.", "First of the Four Immortals, endlessly shape-shifting."),
    [t("Biến hóa: khi còn úp, hiện cấp 4.", "Shape-shift: shows level 4 while face down.")]),

  // --- Thổ (Earth): stone, mountains, steadfast guard ------------------------------------
  m("thach-tinh", t("Thạch Tinh", "Stone Spirit"), { level: 1, element: "tho", path: "land", steps: 1, melee: 3, ranged: null }, [{ kind: "walk-mountain" }],
    t("Hòn đá lâu năm thành tinh.", "A boulder so old it came to life."),
    [t("Đá núi: đi được trên núi.", "Of the mountain: can walk onto and over mountains.")]),
  m("rua-con", t("Rùa Con", "Little Turtle"), { level: 1, element: "tho", path: "water", steps: 1, melee: 2, ranged: null }, [{ kind: "immune-ranged" }],
    t("Chậm mà chắc, mai cứng chẳng sợ tên bay.", "Slow and steady; arrows bounce off its shell."),
    [t("Mai cứng: không bị đánh tầm xa.", "Hard shell: cannot be hit by ranged attacks.")], true),
  m("lan", t("Lân", "Lân"), { level: 2, element: "tho", path: "land", steps: 2, melee: 3, ranged: null }, [{ kind: "guard-ranged" }],
    t("Linh vật trong Tứ linh, múa xua tà ma.", "One of the Four Sacred Beasts, dancing evil away."),
    [t("Hộ vệ: đồng minh kề bên không bị đánh tầm xa.", "Guardian: allies next to it cannot be hit by ranged attacks.")], true),
  m("ong-dia", t("Ông Địa", "Earth God"), { level: 2, element: "tho", path: "land", steps: 2, melee: 2, ranged: null }, [{ kind: "terraform", to: "mountain", count: 1, radius: 1 }],
    t("Thần đất giữ nhà, bụng phệ cười hiền.", "The pot-bellied, smiling god who guards the home ground."),
    [t("Đắp đất (1 lần): dựng núi trên 1 ô đồng bằng kề bên.", "Raise the ground (once): raises a mountain on one plain next to him.")]),
  m("tu-dao-hanh", t("Từ Đạo Hạnh", "Từ Đạo Hạnh"), { level: 3, element: "tho", path: "land", steps: 2, melee: 2, ranged: null }, [{ kind: "swap", range: 3 }],
    t("Thiền sư đắc đạo, có phép hóa thân và dời đất đá.", "A Zen master who could change bodies and move stone."),
    [t("Dời hình đổi bóng (1 lần): đổi chỗ với một quân bất kỳ trong 3 ô.", "Shift (once): trades places with any monster within 3.")]),
  m("voi-chin-nga", t("Voi Chín Ngà", "Nine-Tusk Elephant"), { level: 3, element: "tho", path: "land", steps: 1, melee: 5, ranged: null }, [],
    t("Sính lễ Sơn Tinh mang tới cầu hôn Mị Nương.", "One of the wedding gifts the Mountain God brought for Mị Nương.")),
  m("mau-dia", t("Mẫu Địa", "Mother Earth"), { level: 4, element: "tho", path: "land", steps: 2, melee: 3, ranged: { power: 3, range: 2 } }, [{ kind: "bind", range: 2, turns: 1 }],
    t("Thánh Mẫu cai quản đất đai, bồi đắp phù sa.", "The Holy Mother of the land and its silt."),
    [t("Đầm lầy (1 lần): một kẻ địch trong 2 ô đứng yên 1 lượt.", "Mire (once): an enemy within 2 cannot act for 1 turn.")]),
  m("nghe", t("Nghê", "Nghê"), { level: 4, element: "tho", path: "land", steps: 2, melee: 4, ranged: null }, [{ kind: "aura", on: "defense" }],
    t("Linh thú thuần Việt giữ cổng đình, hóm hỉnh mà uy nghiêm.", "The truly Vietnamese guardian beast at temple gates, playful yet stern."),
    [t("Trấn giữ: đồng minh kề bên +1 cấp khi bị đánh.", "Gatekeeper: allies next to it defend one level higher.")]),
  m("son-tinh", t("Sơn Tinh", "Mountain God"), { level: 5, element: "tho", path: "land", steps: 2, melee: 5, ranged: { power: 3, range: 2 } }, [{ kind: "walk-mountain" }, { kind: "terraform", to: "mountain", count: 2, radius: 2 }],
    t("Thần núi Tản Viên, nước dâng bao nhiêu núi cao bấy nhiêu.", "God of Mount Tản Viên: however high the water, the mountain rises higher."),
    [t("Chúa núi: đi được trên núi.", "Lord of the mountain: can walk onto and over mountains."), t("Dời non (1 lần): dựng núi trên tối đa 2 ô đồng bằng trong 2 ô.", "Raise the peaks (once): raises mountains on up to 2 plains within 2.")]),
  m("kim-quy", t("Kim Quy", "Golden Turtle"), { level: 5, element: "tho", path: "water", steps: 1, melee: 3, ranged: { power: 5, range: 2 } }, [{ kind: "immune-ranged" }],
    t("Thần Kim Quy trao móng làm nỏ thần cho An Dương Vương.", "The Golden Turtle who gave King An Dương his magic crossbow."),
    [t("Mai thần: không bị đánh tầm xa. Nỏ thần bắn mạnh nhất trận.", "Divine shell: cannot be hit by ranged attacks. Its crossbow hits hardest.")]),
];

/**
 * Đồng tâm: partners from the same tale. A monster attacking while its
 * partner stands next to it fights one level higher.
 */
export const PARTNERS: [string, string][] = [
  ["chu-dong-tu", "tien-dung"],
  ["an-duong-vuong", "kim-quy"],
  ["phu-dong", "ngua-sat"],
  ["son-tinh", "voi-chin-nga"],
  ["mau-thuong-ngan", "vuon-than"],
  ["ong-ba-muoi", "ma-tranh"],
];

/** Mối thù thiên thu: when these two fight, whoever strikes first fights one level higher. */
export const RIVALS: [string, string][] = [["son-tinh", "thuy-tinh"]];

const pairKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);
const PARTNER_SET = new Set(PARTNERS.map(([a, b]) => pairKey(a, b)));
const RIVAL_SET = new Set(RIVALS.map(([a, b]) => pairKey(a, b)));
export const arePartners = (a: string, b: string) => PARTNER_SET.has(pairKey(a, b));
export const areRivals = (a: string, b: string) => RIVAL_SET.has(pairKey(a, b));

export const MONSTER_BY_ID = new Map(MONSTERS.map((monster) => [monster.id, monster]));

export function monster(id: string): Monster {
  const found = MONSTER_BY_ID.get(id);
  if (!found) throw new Error(`Unknown monster "${id}"`);
  return found;
}

export const hasAbility = <K extends Ability["kind"]>(m: Monster, kind: K): Extract<Ability, { kind: K }> | undefined =>
  m.abilities.find((ability): ability is Extract<Ability, { kind: K }> => ability.kind === kind);

/** The active ability, if any (at most one per monster). */
export const activeAbility = (m: Monster) => m.abilities.find((a): a is ActiveAbility => (ACTIVE_KINDS as readonly string[]).includes(a.kind));

export const LEVELS = [1, 2, 3, 4, 5] as const;
export const STARTERS = MONSTERS.filter((m) => m.starter).map((m) => m.id);
