"use client";

import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/cn";
import { ElementDot, Token } from "./art";
import { abilityFx, fxSrc, pairSrc } from "./assets";
import { ACTIVE_KINDS, ELEMENT_NAME, PARTNERS, RIVALS, monster, type Ability } from "./monsters";
import type { UnitView } from "./rules";

const PATH_KEY = { land: "games.blkPathLand", water: "games.blkPathWater", air: "games.blkPathAir" } as const;

/** Name and stats of a monster, as the player may see them. */
export function MonsterInfo({ unit, monsterId, mine, showToken = true }: { unit?: UnitView; monsterId?: string; mine?: boolean; showToken?: boolean }) {
  const { t, locale } = useI18n();
  const lang = locale === "en" ? "en" : "vi";
  const id = unit ? unit.monster : (monsterId ?? null);

  if (!id) {
    // A face-down enemy: only its (possibly fake) level is known.
    return (
      <div className="flex items-start gap-3">
        <Token monsterId={null} level={unit?.level ?? 1} side={1} className="size-14 shrink-0" />
        <div className="space-y-1">
          <p className="font-semibold">{t("games.blkHiddenLevel", { n: unit?.level ?? 1 })}</p>
          <p className="text-sm text-foreground-secondary">{t("games.blkHiddenNote")}</p>
          <Status unit={unit} />
        </div>
      </div>
    );
  }

  const m = monster(id);
  const level = unit?.level ?? m.level;
  const partners = PARTNERS.filter((pair) => pair.includes(id)).map((pair) => monster(pair[0] === id ? pair[1] : pair[0]).name[lang]);
  const rivals = RIVALS.filter((pair) => pair.includes(id)).map((pair) => monster(pair[0] === id ? pair[1] : pair[0]).name[lang]);
  const pairs = [...PARTNERS, ...RIVALS].filter((pair) => pair.includes(id)).flatMap((pair) => pairSrc(pair[0], pair[1]) ?? []);

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        {showToken ? <Token monsterId={id} level={level} side={unit?.side ?? 0} className="size-14 shrink-0" /> : null}
        <div className={showToken ? "min-w-0 space-y-0.5" : "w-full min-w-0 space-y-0.5 text-center"}>
          <p className="font-semibold leading-tight">{m.name[lang]}</p>
          <p className={showToken ? "flex items-center gap-1.5 text-xs text-foreground-secondary" : "flex items-center justify-center gap-1.5 text-xs text-foreground-secondary"}>
            <ElementDot element={m.element} lang={lang} />
            {ELEMENT_NAME[m.element][lang]} · {t("games.blkLevel", { n: level })}
          </p>
          <p className="text-xs italic text-muted">{m.lore[lang]}</p>
        </div>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        <dt className="text-muted">{t("games.blkInfoMove")}</dt>
        <dd>{t("games.blkSteps", { path: t(PATH_KEY[m.path]), n: m.steps })}</dd>
        <dt className="text-muted">{t("games.blkMelee")}</dt>
        <dd>{m.melee}</dd>
        <dt className="text-muted">{t("games.blkRanged")}</dt>
        <dd>{m.ranged ? t("games.blkRangedValue", { p: m.ranged.power, r: m.ranged.range }) : t("games.blkNone")}</dd>
      </dl>
      {m.abilityText.length ? (
        <ul className="space-y-1 text-sm">
          {m.abilityText.map((text, i) => (
            <li key={i} className={cn("flex items-start gap-2", unit?.sealed && "line-through opacity-60")}>
              <AbilityFx ability={m.abilities[i]} />
              <span>{text[lang]}</span>
              {unit?.abilityUsed && (ACTIVE_KINDS as readonly string[]).includes(m.abilities[i].kind) ? (
                <span className="ml-1 text-xs text-muted">({t("games.blkUsed")})</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
      {pairs.map((src) => (
        <img key={src} src={src} alt="" width={960} height={540} className="aspect-video w-full rounded-lg object-cover" loading="lazy" decoding="async" />
      ))}
      {partners.length || rivals.length ? (
        <p className="text-xs text-foreground-secondary">
          {partners.map((name) => t("games.blkPartner", { name })).join(" · ")}
          {partners.length && rivals.length ? " · " : ""}
          {rivals.map((name) => t("games.blkRival", { name })).join(" · ")}
        </p>
      ) : null}
      <Status unit={unit} mine={mine} />
    </div>
  );
}

/** The painted effect of an ability, small, beside its description. */
function AbilityFx({ ability }: { ability: Ability | undefined }) {
  const fx = ability ? abilityFx(ability) : null;
  return fx ? <img src={fxSrc(fx)} alt="" className="size-7 shrink-0 rounded-full bg-surface-hover" loading="lazy" decoding="async" /> : null;
}

function Status({ unit, mine }: { unit?: UnitView; mine?: boolean }) {
  const { t } = useI18n();
  if (!unit) return null;
  const notes: string[] = [];
  if (mine) notes.push(unit.revealed ? t("games.blkKnownToEnemy") : t("games.blkFaceDownToEnemy"));
  if (unit.evolved > 0) notes.push(t("games.blkEvolved", { n: unit.evolved }));
  if (unit.sealed) notes.push(t("games.blkSealed"));
  if (unit.revived) notes.push(t("games.blkRevived"));
  if (unit.boundUntil > 0) notes.push(t("games.blkBound", { n: unit.boundUntil }));
  if (!notes.length) return null;
  return (
    <ul className="space-y-0.5 text-xs text-foreground-secondary">
      {notes.map((note) => (
        <li key={note}>{note}</li>
      ))}
    </ul>
  );
}
