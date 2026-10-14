// The three looks of the chain-reaction game. Rules are the same in all of
// them; a theme only changes the pictures and the words: what the targets
// are, what the player throws, and what winning and losing are called.
//
// Strings use {placeholders}, filled in with `fill`.

export type ThemeId = "lantern" | "space" | "fleet";
export const THEME_IDS: ThemeId[] = ["lantern", "space", "fleet"];
export const DEFAULT_THEME: ThemeId = "lantern";

type Text = { vi: string; en: string };

export type Theme = {
  id: ThemeId;
  /** Short name for the theme picker. */
  chip: Text;
  /** The game's name in this theme, shown above the board. */
  name: Text;
  intro: Text;
  /** A target at strength 1, 2, 3, 4, in that order (index = strength - 1). */
  states: [Text, Text, Text, Text];
  /** An empty cell. */
  empty: Text;
  /** What the player throws, plural, for the ammo meter. */
  ammo: Text;
  ammoLeft: Text;
  targetsLeft: Text;
  dealing: Text;
  boardLabel: Text;
  tip: Text;
  winTitle: Text;
  winText: Text;
  loseTitle: Text;
  loseText: Text;
  stuckText: Text;
  hintShown: Text;
};

export const THEMES: Record<ThemeId, Theme> = {
  lantern: {
    id: "lantern",
    chip: { vi: "Hoa đăng", en: "Lanterns" },
    name: { vi: "Thả đèn hoa đăng", en: "Lantern River" },
    intro: {
      vi: "Thắp sáng cả dòng sông. Đèn rực rỡ được châm thêm sẽ bung thành pháo hoa và châm lửa sang bốn phía.",
      en: "Light up the whole river. A blazing lantern lit once more bursts into fireworks and lights its neighbours four ways.",
    },
    states: [
      { vi: "đèn rực rỡ", en: "blazing lantern" },
      { vi: "đèn đang sáng", en: "glowing lantern" },
      { vi: "đèn le lói", en: "flickering lantern" },
      { vi: "đèn chưa thắp", en: "unlit lantern" },
    ],
    empty: { vi: "mặt sông", en: "open river" },
    ammo: { vi: "Mồi lửa", en: "Sparks" },
    ammoLeft: { vi: "Còn {n} mồi lửa", en: "{n} sparks left" },
    targetsLeft: { vi: "Đèn còn", en: "Lanterns" },
    dealing: { vi: "Đang thả đèn xuống sông…", en: "Setting lanterns on the river…" },
    boardLabel: { vi: "Dòng sông 6×6. Chạm vào một chiếc đèn để châm lửa.", en: "A 6×6 river. Tap a lantern to light it." },
    tip: {
      vi: "Chạm vào một chiếc đèn để châm lửa. Đèn rực rỡ được châm thêm sẽ bung pháo hoa ra bốn phía.",
      en: "Tap a lantern to light it. A blazing lantern lit again bursts into fireworks four ways.",
    },
    winTitle: { vi: "Cả dòng sông rực sáng!", en: "The whole river is aglow!" },
    winText: { vi: "Thắp hết đèn với {used} mồi lửa, còn dư {left}.", en: "Every lantern lit with {used} sparks, {left} to spare." },
    loseTitle: { vi: "Hết mồi lửa rồi!", en: "Out of sparks!" },
    loseText: {
      vi: "Còn {n} chiếc đèn chưa bung. Chơi lại bàn này hoặc thử bàn mới nhé.",
      en: "{n} lanterns are still waiting. Replay this board or try a new one.",
    },
    stuckText: { vi: "Không còn cách thắp hết đèn với {n} mồi lửa còn lại.", en: "There is no way to light every lantern with the {n} sparks left." },
    hintShown: { vi: "{name} gợi ý: hãy châm chiếc đèn đang nhấp nháy.", en: "{name}'s hint: light the lantern that is blinking." },
  },
  space: {
    id: "space",
    chip: { vi: "Vũ trụ", en: "Space" },
    name: { vi: "Tianwu phá thiên thạch", en: "Tianwu's Asteroid Belt" },
    intro: {
      vi: "Dọn sạch vành đai thiên thạch cho Tianwu. Thiên thạch vỡ tung sẽ bắn mảnh ra bốn phía.",
      en: "Clear the asteroid belt for Tianwu. A shattering asteroid throws shards four ways.",
    },
    states: [
      { vi: "thiên thạch sắp vỡ", en: "crumbling asteroid" },
      { vi: "thiên thạch nóng đỏ", en: "red-hot asteroid" },
      { vi: "thiên thạch nứt", en: "cracked asteroid" },
      { vi: "thiên thạch nguyên vẹn", en: "intact asteroid" },
    ],
    empty: { vi: "khoảng không", en: "empty space" },
    ammo: { vi: "Tên lửa", en: "Rockets" },
    ammoLeft: { vi: "Còn {n} tên lửa", en: "{n} rockets left" },
    targetsLeft: { vi: "Thiên thạch", en: "Asteroids" },
    dealing: { vi: "Đang dò vành đai thiên thạch…", en: "Scanning the asteroid belt…" },
    boardLabel: { vi: "Vành đai thiên thạch 6×6. Chạm vào một thiên thạch để bắn tên lửa.", en: "A 6×6 asteroid belt. Tap an asteroid to fire a rocket." },
    tip: {
      vi: "Chạm vào một thiên thạch để bắn tên lửa. Thiên thạch sắp vỡ trúng thêm sẽ vỡ tung, bắn mảnh ra bốn phía.",
      en: "Tap an asteroid to fire a rocket. A crumbling asteroid hit again shatters and throws shards four ways.",
    },
    winTitle: { vi: "Vành đai đã sạch bóng!", en: "The belt is clear!" },
    winText: { vi: "Phá hết thiên thạch với {used} tên lửa, còn dư {left}.", en: "Every asteroid gone with {used} rockets, {left} to spare." },
    loseTitle: { vi: "Hết tên lửa rồi!", en: "Out of rockets!" },
    loseText: {
      vi: "Còn {n} thiên thạch trôi lơ lửng. Chơi lại bàn này hoặc thử bàn mới nhé.",
      en: "{n} asteroids are still drifting. Replay this board or try a new one.",
    },
    stuckText: { vi: "Không còn cách phá hết thiên thạch với {n} tên lửa còn lại.", en: "There is no way to clear the belt with the {n} rockets left." },
    hintShown: { vi: "{name} gợi ý: hãy bắn vào thiên thạch đang nhấp nháy.", en: "{name}'s hint: fire at the asteroid that is blinking." },
  },
  fleet: {
    id: "fleet",
    chip: { vi: "Xích Bích", en: "Red Cliffs" },
    name: { vi: "Hỏa thiêu Xích Bích", en: "Red Cliffs Fire" },
    intro: {
      vi: "Đốt sạch đội thuyền trên sông. Thuyền thiêu trụi trúng thêm đuốc sẽ nổ tung và phóng lửa ra bốn phía.",
      en: "Burn the whole fleet on the river. A burnt-out ship hit again explodes and sends fire four ways.",
    },
    states: [
      { vi: "thuyền thiêu trụi", en: "burnt-out ship" },
      { vi: "thuyền đang cháy", en: "burning ship" },
      { vi: "thuyền bốc khói", en: "smoking ship" },
      { vi: "thuyền an toàn", en: "safe ship" },
    ],
    empty: { vi: "mặt nước", en: "open water" },
    ammo: { vi: "Đuốc", en: "Torches" },
    ammoLeft: { vi: "Còn {n} ngọn đuốc", en: "{n} torches left" },
    targetsLeft: { vi: "Thuyền còn", en: "Ships" },
    dealing: { vi: "Đang dàn trận…", en: "Lining up the fleet…" },
    boardLabel: { vi: "Đội thuyền 6×6. Chạm vào một thuyền để ném đuốc.", en: "A 6×6 fleet. Tap a ship to throw a torch." },
    tip: {
      vi: "Chạm vào một thuyền để ném đuốc. Thuyền thiêu trụi trúng thêm sẽ nổ và phóng lửa ra bốn phía.",
      en: "Tap a ship to throw a torch. A burnt-out ship hit again explodes and sends fire four ways.",
    },
    winTitle: { vi: "Đại thắng!", en: "Victory!" },
    winText: { vi: "Đốt sạch đội thuyền với {used} ngọn đuốc, còn dư {left}.", en: "The whole fleet burned with {used} torches, {left} to spare." },
    loseTitle: { vi: "Hết đuốc rồi!", en: "Out of torches!" },
    loseText: {
      vi: "Còn {n} thuyền chưa chìm. Chơi lại bàn này hoặc thử bàn mới nhé.",
      en: "{n} ships are still afloat. Replay this board or try a new one.",
    },
    stuckText: { vi: "Không còn cách nào thắng với {n} ngọn đuốc còn lại.", en: "There is no way to win with the {n} torches left." },
    hintShown: { vi: "{name} gợi ý: hãy ném đuốc vào thuyền đang nhấp nháy.", en: "{name}'s hint: throw a torch at the ship that is blinking." },
  },
};

export const isThemeId = (value: unknown): value is ThemeId => typeof value === "string" && (THEME_IDS as string[]).includes(value);

/** Picks the language and fills {placeholders}. */
export function fill(text: Text, lang: "vi" | "en", values: Record<string, string | number> = {}): string {
  return text[lang].replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

/** A theme's name for a target at this strength (1 to 4), or for an empty cell (0). */
export const stateText = (theme: Theme, strength: number): Text => (strength <= 0 ? theme.empty : theme.states[strength - 1]);

/** Where the game keeps the chosen theme and speed (per browser). */
export const PREFS_KEY = "shanverse:red-cliffs:prefs";
/** Fired on window when the player picks a theme, so the rules' state list can follow. */
export const THEME_EVENT = "red-cliffs:theme";

/** The saved theme, or the default when nothing (valid) is saved or storage is unavailable. */
export function readStoredTheme(): ThemeId {
  try {
    const value = JSON.parse(window.localStorage.getItem(PREFS_KEY) ?? "null") as { theme?: unknown } | null;
    return isThemeId(value?.theme) ? value.theme : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}
