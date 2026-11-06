#!/usr/bin/env node
// Codastra — creates (or updates) the "Server Partner" role in a Discord server.
//
// What it does:
//   1. Looks up the existing "Partner" role.
//   2. Picks orange (#FF8C00) if no other role already uses an orange colour;
//      otherwise it falls back to a distinct amber/red-orange that is still free.
//   3. Creates "Server Partner" (or updates it if it already exists):
//      hoisted (own group in the member list), mentionable, same permissions as Partner.
//   4. Moves it directly above "Partner" so it shows above the partners in the member list.
//   5. Optionally gives the role to one or more members (e.g. Lachly, owner of FaithfulMC).
//
// Usage (Node 18+, no dependencies):
//   DISCORD_TOKEN=xxx GUILD_ID=123 node create-server-partner-role.mjs
//   DISCORD_TOKEN=xxx GUILD_ID=123 MEMBER_IDS=111,222 node create-server-partner-role.mjs
//   add DRY_RUN=1 to only print what would happen.
//
// The bot needs the "Manage Roles" permission and its own role must be ABOVE "Partner"
// in Server Settings → Roles, otherwise Discord refuses to place the new role there.

const API = 'https://discord.com/api/v10';
const {
  DISCORD_TOKEN,
  GUILD_ID,
  MEMBER_IDS = '',
  PARTNER_ROLE_NAME = 'Partner',
  ROLE_NAME = 'Server Partner',
  DRY_RUN,
} = process.env;

// Preferred colour first; fallbacks are only used if the preferred one is taken.
const PREFERRED = 0xff8c00; // orange
const FALLBACKS = [0xff6a00, 0xffa31a, 0xff4f00]; // red-orange, amber, vermilion

const hex = (n) => '#' + n.toString(16).padStart(6, '0').toUpperCase();

function hue(n) {
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  if (d === 0) return { h: 0, s: 0, v: max };
  let h;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  return { h, s: d / max, v: max };
}

// "Orange-ish": hue 18°–45°, clearly saturated and not too dark.
export const isOrange = (n) => {
  if (!n) return false;
  const { h, s, v } = hue(n);
  return h >= 18 && h <= 45 && s >= 0.55 && v >= 0.6;
};

// Two colours are "too close" when every channel differs by less than 40.
const tooClose = (a, b) =>
  [16, 8, 0].every((sh) => Math.abs(((a >> sh) & 255) - ((b >> sh) & 255)) < 40);

export function pickColour(roles, ownRoleId) {
  const used = roles.filter((r) => r.id !== ownRoleId && r.color).map((r) => r.color);
  if (!used.some(isOrange)) return { colour: PREFERRED, orangeTaken: false };
  const free = FALLBACKS.find((c) => !used.some((u) => tooClose(u, c)));
  return { colour: free ?? FALLBACKS[0], orangeTaken: true };
}

async function api(method, path, body, reason) {
  if (DRY_RUN && method !== 'GET') {
    console.log(`[dry-run] ${method} ${path}`, body ? JSON.stringify(body) : '');
    return body && !Array.isArray(body) ? { id: 'dry-run', ...body } : null;
  }
  const res = await fetch(API + path, {
    method,
    headers: {
      Authorization: `Bot ${DISCORD_TOKEN}`,
      'Content-Type': 'application/json',
      ...(reason ? { 'X-Audit-Log-Reason': encodeURIComponent(reason) } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status} ${JSON.stringify(data)}`);
  }
  return data;
}

async function main() {
  if (!DISCORD_TOKEN || !GUILD_ID) {
    console.error('Set DISCORD_TOKEN and GUILD_ID (see the header of this file).');
    process.exit(1);
  }
  const reason = 'Codastra: Server Partner role for partner-server owners';

  const roles = await api('GET', `/guilds/${GUILD_ID}/roles`);
  const byName = (name) => roles.find((r) => r.name.toLowerCase() === name.toLowerCase());

  const partner = byName(PARTNER_ROLE_NAME);
  if (!partner) throw new Error(`Role "${PARTNER_ROLE_NAME}" not found in this server.`);

  const existing = byName(ROLE_NAME);
  const { colour, orangeTaken } = pickColour(roles, existing?.id);
  if (orangeTaken) {
    const owners = roles.filter((r) => r.id !== existing?.id && isOrange(r.color));
    console.log(
      `Orange is already used by: ${owners.map((r) => `${r.name} (${hex(r.color)})`).join(', ')}` +
        ` → using ${hex(colour)} instead.`,
    );
  }

  const settings = {
    name: ROLE_NAME,
    color: colour,
    hoist: true, // separate group in the member list
    mentionable: true,
    permissions: partner.permissions, // at least everything a Partner can do
  };

  const role = existing
    ? await api('PATCH', `/guilds/${GUILD_ID}/roles/${existing.id}`, settings, reason)
    : await api('POST', `/guilds/${GUILD_ID}/roles`, settings, reason);
  console.log(`${existing ? 'Updated' : 'Created'} role "${ROLE_NAME}" (${hex(colour)}).`);

  // Higher position = higher in the list. Put it right above Partner.
  await api(
    'PATCH',
    `/guilds/${GUILD_ID}/roles`,
    [{ id: role.id, position: partner.position + 1 }],
    reason,
  );
  console.log(`Placed "${ROLE_NAME}" directly above "${partner.name}".`);

  for (const userId of MEMBER_IDS.split(',').map((s) => s.trim()).filter(Boolean)) {
    await api('PUT', `/guilds/${GUILD_ID}/members/${userId}/roles/${role.id}`, null, reason);
    console.log(`Gave "${ROLE_NAME}" to member ${userId}.`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err.message);
    if (/50013|Missing Permissions/.test(err.message)) {
      console.error(
        'Tip: give the bot "Manage Roles" and drag its role above "Partner" in Server Settings → Roles.',
      );
    }
    process.exit(1);
  });
}
