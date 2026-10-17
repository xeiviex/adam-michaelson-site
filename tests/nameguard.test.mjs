import { test } from "node:test";
import assert from "node:assert/strict";
import { blockedNames, redact, makeNameFilter, REPLACEMENT } from "../functions/_lib/nameguard.js";

test("blockedNames merges the default with CHAT_BLOCKED_NAMES", () => {
  assert.deepEqual(blockedNames({}), ["Joshua"]);
  assert.deepEqual(blockedNames({ CHAT_BLOCKED_NAMES: "Ava, Ben\nCleo,Joshua" }), ["Joshua", "Ava", "Ben", "Cleo"]);
});

test("redact replaces whole-word, case-insensitive matches only", () => {
  const n = ["Joshua", "Ava"];
  assert.equal(redact("Joshua and ava met Joshuas and Avalon. JOSHUA's room.", n), `${REPLACEMENT} and ${REPLACEMENT} met Joshuas and Avalon. one of my kids' room.`);
  assert.equal(redact("Josh Custer joined", n), "Josh Custer joined");
});

test("streaming filter catches names split across chunks and passes everything else through in order", () => {
  const n = ["Joshua", "Mary Ann"];
  for (const split of [1, 2, 3, 5, 7, 50]) {
    const text = "Our oldest, Joshua, was born in 2001. Mary Ann is next. Joshua's bike. Joshuas stays.";
    const f = makeNameFilter(n);
    let out = "";
    for (let i = 0; i < text.length; i += split) out += f.push(text.slice(i, i + split));
    out += f.flush();
    assert.equal(out, redact(text, n), `split ${split}`);
    assert.ok(!/Joshua\b|Mary Ann/i.test(out));
  }
});

test("with no names the filter is a pass-through", () => {
  const f = makeNameFilter([]);
  assert.equal(f.push("hello"), "hello");
  assert.equal(f.flush(), "");
});
