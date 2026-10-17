import { test } from "node:test";
import assert from "node:assert/strict";
import { freshDb, seed } from "./helpers.mjs";
import { alertNewSession, forwardVisitorMessage, handleTelegramUpdate, inQuietHours, provider } from "../functions/_lib/alerts.js";
import { onRequestPost as webhook } from "../functions/api/telegram/webhook.js";

const S1 = "aaaa1111bbbb2222cccc";
const S2 = "aaaa9999bbbb2222dddd";
const S3 = "c0de0000bbbb2222eeee";
const ENV = { TELEGRAM_BOT_TOKEN: "tok", TELEGRAM_CHAT_ID: "42", TELEGRAM_WEBHOOK_SECRET: "sek", ALERT_QUIET_HOURS: "0-0" };

/** A fake Telegram: records sendMessage calls and hands out message ids. */
function fakeTelegram() {
  const sent = [];
  let id = 100;
  const fetchImpl = async (url, init) => {
    assert.match(String(url), /^https:\/\/api\.telegram\.org\/bottok\/sendMessage$/);
    const body = JSON.parse(init.body);
    sent.push(body);
    return new Response(JSON.stringify({ ok: true, result: { message_id: ++id } }));
  };
  return { sent, fetchImpl };
}
const update = (text, extra = {}, chat = 42) => ({ message: { text, chat: { id: chat }, ...extra } });

test("quiet hours, including ranges that wrap midnight", () => {
  const at = (h) => new Date(`2026-10-10T${String(h).padStart(2, "0")}:30:00-06:00`); // Mountain Daylight Time
  assert.equal(inQuietHours({ ALERT_QUIET_HOURS: "22-7" }, at(23)), true);
  assert.equal(inQuietHours({ ALERT_QUIET_HOURS: "22-7" }, at(3)), true);
  assert.equal(inQuietHours({ ALERT_QUIET_HOURS: "22-7" }, at(12)), false);
  assert.equal(inQuietHours({ ALERT_QUIET_HOURS: "0-0" }, at(3)), false);
  assert.equal(inQuietHours({ ALERT_QUIET_HOURS: "9-17" }, at(12)), true);
});

test("provider is chosen by config and only when configured", () => {
  assert.equal(provider(ENV).name, "telegram");
  assert.equal(provider({}), null);
  assert.equal(provider({ ...ENV, ALERT_PROVIDER: "twilio" }), null); // not enabled until the campaign is approved
});

test("new-chat alert: sent once per chat, with preview and admin link; hot alert for fit; quiet hours and daily cap respected", async () => {
  const { sqlite, db } = freshDb();
  const tg = fakeTelegram();
  await alertNewSession({ db, env: ENV, sessionId: S1, chatType: "intro", ip: "1.1.1.1", text: "What have you built?" }, tg.fetchImpl);
  await alertNewSession({ db, env: ENV, sessionId: S1, chatType: "intro", ip: "1.1.1.1", text: "again" }, tg.fetchImpl);
  assert.equal(tg.sent.length, 1);
  assert.match(tg.sent[0].text, /\[aaaa\]/);
  assert.match(tg.sent[0].text, /What have you built\?/);
  assert.match(tg.sent[0].text, /adam-michaelson\.com\/admin#aaaa1111bbbb2222cccc/);
  await alertNewSession({ db, env: ENV, sessionId: S2, chatType: "fit", ip: "2.2.2.2", text: "https://jobs.example-co.com/1", hot: true }, tg.fetchImpl);
  assert.match(tg.sent[1].text, /Job description sent/);
  await alertNewSession({ db, env: { ...ENV, ALERT_QUIET_HOURS: "0-24" }, sessionId: S3, chatType: "intro", ip: "3.3.3.3", text: "quiet" }, tg.fetchImpl);
  assert.equal(tg.sent.length, 2); // 0-24 = always quiet
  await alertNewSession({ db, env: { ...ENV, ALERT_DAILY_CAP: "2" }, sessionId: S3, chatType: "intro", ip: "3.3.3.3", text: "capped" }, tg.fetchImpl);
  assert.equal(tg.sent.length, 2);
  // no provider: silently nothing
  await alertNewSession({ db, env: {}, sessionId: S3, chatType: "intro", ip: "3.3.3.3", text: "x" }, tg.fetchImpl);
  assert.equal(tg.sent.length, 2);
});

test("forwarded visitor messages are capped per chat per hour", async () => {
  const { db } = freshDb();
  const tg = fakeTelegram();
  for (let i = 0; i < 25; i++) await forwardVisitorMessage({ db, env: ENV, sessionId: S1, text: "msg " + i }, tg.fetchImpl);
  assert.equal(tg.sent.length, 20);
  assert.match(tg.sent[0].text, /visitor:\nmsg 0/);
});

test("takeover by Telegram: reply-to, #code, plain message, /bot, and who is allowed", async () => {
  const { sqlite, db } = freshDb();
  const tg = fakeTelegram();
  seed(sqlite, { id: S1, msgs: [["visitor", "hello from one"]] });
  seed(sqlite, { id: S3, msgs: [["visitor", "hello from three"]] });
  await alertNewSession({ db, env: ENV, sessionId: S1, chatType: "intro", ip: "1.1.1.1", text: "hello from one" }, tg.fetchImpl); // alert msg id 101
  await alertNewSession({ db, env: ENV, sessionId: S3, chatType: "intro", ip: "3.3.3.3", text: "hello from three" }, tg.fetchImpl); // alert msg id 102
  const h = (u) => handleTelegramUpdate({ db, env: ENV, update: u }, tg.fetchImpl);
  const adamMsgs = (sid) => sqlite.prepare("SELECT content FROM chat_messages WHERE session_id=? AND role='adam' ORDER BY id").all(sid).map((r) => r.content);
  const mode = (sid) => sqlite.prepare("SELECT mode FROM chat_sessions WHERE session_id=?").get(sid).mode;

  // replying to the first alert targets chat one even though three alerted later
  assert.equal(await h(update("on it", { reply_to_message: { message_id: 101 } })), "sent");
  assert.deepEqual(adamMsgs(S1), ["on it"]);
  assert.equal(mode(S1), "human");
  assert.equal(mode(S3), "bot");
  // a plain message goes to the most recent alerted chat
  assert.equal(await h(update("hi three")), "sent");
  assert.deepEqual(adamMsgs(S3), ["hi three"]);
  // #code targets a specific chat
  assert.equal(await h(update("#aaaa still there?")), "sent");
  assert.deepEqual(adamMsgs(S1), ["on it", "still there?"]);
  // hand back
  assert.equal(await h(update("#aaaa /bot")), "handback");
  assert.equal(mode(S1), "bot");
  assert.equal(await h(update("/bot")), "handback"); // most recent = three
  assert.equal(mode(S3), "bot");
  // unknown or ambiguous code
  assert.equal(await h(update("#zzzz hello")), "nomatch");
  seed(sqlite, { id: S2, msgs: [["visitor", "x"]] }); // shares the code "aaaa" with S1
  assert.equal(await h(update("#aaaa hello")), "nomatch");
  // strangers are ignored and change nothing
  assert.equal(await h(update("hi there", {}, 999)), "ignored");
  assert.equal(adamMsgs(S3).length, 1);
  assert.equal(await h(update("/help")), "help");
});

test("Telegram setup: with no chat id configured, the bot tells the sender their id and does nothing else", async () => {
  const { db } = freshDb();
  const calls = [];
  const fetchImpl = async (url, init) => { calls.push(JSON.parse(init.body)); return new Response("{}"); };
  const r = await handleTelegramUpdate({ db, env: { TELEGRAM_BOT_TOKEN: "tok" }, update: update("hello", {}, 777) }, fetchImpl);
  assert.equal(r, "setup");
  assert.match(calls[0].text, /Your chat id is 777/);
});

test("webhook endpoint requires the secret token", async () => {
  const { sqlite, db } = freshDb();
  seed(sqlite, { id: S1, msgs: [["visitor", "hi"]] });
  const call = (headers, body = update("hello")) => webhook({ request: new Request("https://adam-michaelson.com/api/telegram/webhook", { method: "POST", headers, body: JSON.stringify(body) }), env: { ...ENV, SMS_OPTIN_DB: db } });
  assert.equal((await call({})).status, 401);
  assert.equal((await call({ "X-Telegram-Bot-Api-Secret-Token": "wrong" })).status, 401);
  assert.equal(sqlite.prepare("SELECT COUNT(*) n FROM chat_messages WHERE role='adam'").get().n, 0);
  assert.equal((await webhook({ request: new Request("https://x/api/telegram/webhook", { method: "POST", body: "{}" }), env: { SMS_OPTIN_DB: db } })).status, 503);
});
