// Bách Linh Kỳ balance check: Tianwu plays itself and reports how teams,
// monsters, maps and the first move fare. Run after adding or changing a
// monster or a map:
//
//   pnpm blk:balance                       # 120 games, medium vs medium
//   pnpm blk:balance --games 20 --a hard --b medium
//   pnpm blk:balance --worlds 2 --seed 7   # faster, less accurate AI
//
// Teams are random (from the whole roster), maps rotate, and the first move
// alternates, so a monster's win rate is the share of games its team won.
// Around 50% is balanced; a monster far above or below is worth a look.

import { chooseAction, type Difficulty } from "../src/features/games/bach-linh-ky/ai";
import { MAPS, buildBoard } from "../src/features/games/bach-linh-ky/maps";
import { MONSTERS } from "../src/features/games/bach-linh-ky/monsters";
import { apply, autoPlace, newGame, randomTeam, viewFor, type GameEvent, type Side } from "../src/features/games/bach-linh-ky/rules";

const args = new Map<string, string>();
for (let i = 2; i < process.argv.length; i += 2) args.set(process.argv[i].replace(/^--/, ""), process.argv[i + 1]);
const games = Number(args.get("games") ?? 120);
const aLevel = (args.get("a") ?? "medium") as Difficulty;
const bLevel = (args.get("b") ?? "medium") as Difficulty;
const worlds = args.has("worlds") ? Number(args.get("worlds")) : undefined;
let seed = Number(args.get("seed") ?? 1);
const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

type Tally = { games: number; wins: number; draws: number };
const tally = (): Tally => ({ games: 0, wins: 0, draws: 0 });
const monsterStats = new Map(MONSTERS.map((m) => [m.id, tally()]));
const mapStats = new Map(MAPS.map((m) => [m.id, { games: 0, turns: 0, eliminations: 0, draws: 0 }]));
const levelStats = { a: 0, b: 0, draws: 0 };
const firstMove = tally();
const pool = MONSTERS.map((m) => m.id);
const started = Date.now();

for (let g = 0; g < games; g++) {
  const map = MAPS[g % MAPS.length];
  const { terrain } = buildBoard(map);
  // AI "a" plays side 0 in even games, side 1 in odd ones; the first mover alternates every two games.
  const aSide: Side = g % 2 === 0 ? 0 : 1;
  const first: Side = Math.floor(g / 2) % 2 === 0 ? 0 : 1;
  const teams = [randomTeam(pool, random), randomTeam(pool, random)];
  let state = newGame(map.id, autoPlace(0, teams[0], terrain, random), autoPlace(1, teams[1], terrain, random), first);
  let end: Extract<GameEvent, { type: "end" }> | undefined;
  while (state.winner === null) {
    const side = state.toMove;
    const level = side === aSide ? aLevel : bLevel;
    const { action } = chooseAction(viewFor(state, side), level, random, worlds ? { worlds } : {});
    const result = apply(state, action);
    state = result.state;
    end = result.events.find((e): e is Extract<GameEvent, { type: "end" }> => e.type === "end") ?? end;
  }
  const winner = state.winner;
  const stats = mapStats.get(map.id)!;
  stats.games++;
  stats.turns += state.turn;
  if (end?.reason === "eliminated") stats.eliminations++;
  if (winner === "draw") {
    stats.draws++;
    levelStats.draws++;
    firstMove.draws++;
  } else {
    if (winner === aSide) levelStats.a++;
    else levelStats.b++;
    if (winner === first) firstMove.wins++;
  }
  firstMove.games++;
  teams.forEach((team, side) => {
    for (const id of team) {
      const t = monsterStats.get(id)!;
      t.games++;
      if (winner === "draw") t.draws++;
      else if (winner === side) t.wins++;
    }
  });
  if ((g + 1) % 10 === 0) process.stderr.write(`  ${g + 1}/${games} games, ${Math.round((Date.now() - started) / 1000)} s\n`);
}

const pct = (n: number, d: number) => (d ? `${((n / d) * 100).toFixed(0)}%` : "–");
/** Wins count 1, draws ½. */
const score = (t: Tally) => (t.games ? (t.wins + t.draws / 2) / t.games : 0);

console.log(`\nBách Linh Kỳ balance: ${games} games, ${aLevel} vs ${bLevel}${worlds ? `, ${worlds} worlds` : ""}, ${Math.round((Date.now() - started) / 1000)} s\n`);
console.log(`${aLevel} (a) won ${levelStats.a}, ${bLevel} (b) won ${levelStats.b}, ${levelStats.draws} draws`);
console.log(`First mover scored ${pct(firstMove.wins + firstMove.draws / 2, firstMove.games)} (50% means no first-move advantage)\n`);
console.log("Map            games  avg turns  ended by elimination  draws");
for (const map of MAPS) {
  const s = mapStats.get(map.id)!;
  console.log(`${map.id.padEnd(14)} ${String(s.games).padStart(5)}  ${(s.turns / Math.max(1, s.games)).toFixed(1).padStart(9)}  ${pct(s.eliminations, s.games).padStart(20)}  ${pct(s.draws, s.games).padStart(5)}`);
}
console.log("\nMonster          lvl  games  team score");
for (const m of [...MONSTERS].sort((a, b) => a.level - b.level || score(monsterStats.get(b.id)!) - score(monsterStats.get(a.id)!))) {
  const t = monsterStats.get(m.id)!;
  const s = score(t);
  const flag = t.games >= 10 && (s > 0.62 ? "  ▲ strong?" : s < 0.38 ? "  ▼ weak?" : "");
  console.log(`${m.id.padEnd(16)} ${String(m.level).padStart(3)}  ${String(t.games).padStart(5)}  ${pct(s * t.games, t.games).padStart(10)}${flag || ""}`);
}
