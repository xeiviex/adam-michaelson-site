/** The admin console page. Visitor text is always inserted with textContent, never as HTML. */
export function adminPage(nonce) {
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow,noarchive">
<title>Chat console</title>
<style nonce="${nonce}">
:root{color-scheme:dark;--bg:#0b0d12;--panel:#12151c;--line:#232834;--ink:#e8eaf0;--mute:#8b93a7;--acc:#2f8fd1;--hot:#d98a2b}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.45 system-ui,-apple-system,Segoe UI,sans-serif}
button,input,select,textarea{font:inherit;color:inherit}
header{display:flex;align-items:center;gap:12px;padding:10px 16px;border-bottom:1px solid var(--line);position:sticky;top:0;background:var(--bg);z-index:2}
header h1{font-size:16px;margin:0;font-weight:600;flex:1}
.btn{background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:7px 12px;cursor:pointer}
.btn.pri{background:var(--acc);border-color:var(--acc);color:#fff}.btn:disabled{opacity:.5}
main{display:grid;grid-template-columns:minmax(300px,380px) 1fr;height:calc(100vh - 53px)}
#left{border-right:1px solid var(--line);display:flex;flex-direction:column;min-height:0}
#filters{padding:10px;display:grid;grid-template-columns:1fr 1fr;gap:8px;border-bottom:1px solid var(--line)}
#filters input,#filters select{background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:7px 9px;width:100%}
#q{grid-column:1/3}
#list{overflow:auto;flex:1}
.item{padding:10px 14px;border-bottom:1px solid var(--line);cursor:pointer}
.item:hover,.item.on{background:var(--panel)}
.row1{display:flex;gap:8px;align-items:center;font-size:12px;color:var(--mute)}
.row1 .sp{flex:1}.tag{border:1px solid var(--line);border-radius:99px;padding:0 7px;font-size:11px}
.tag.fit{color:var(--hot);border-color:var(--hot)}.tag.human{color:#fff;background:var(--acc);border-color:var(--acc)}
.prev{margin-top:3px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;word-break:break-word}
.snip{margin-top:3px;color:var(--mute);font-size:13px}mark{background:#5b4a14;color:#ffe9a8;border-radius:3px}
#right{display:flex;flex-direction:column;min-height:0}
#top{padding:10px 16px;border-bottom:1px solid var(--line);display:flex;gap:10px;align-items:center;flex-wrap:wrap}
#top .meta{flex:1;color:var(--mute);font-size:13px;min-width:200px}
#msgs{flex:1;overflow:auto;padding:16px;display:flex;flex-direction:column;gap:10px}
.m{max-width:min(720px,88%);padding:9px 13px;border-radius:14px;white-space:pre-wrap;word-break:break-word}
.m small{display:block;color:var(--mute);font-size:11px;margin-bottom:2px}
.m.visitor{align-self:flex-end;background:#e9ebf0;color:#14171f}.m.visitor small{color:#5d6475}
.m.bot{align-self:flex-start;background:#1c3b55}.m.adam{align-self:flex-start;background:#2c5b2f}
.att{font-size:12px;color:var(--mute);align-self:center}
#reply{display:flex;gap:8px;padding:10px 16px;border-top:1px solid var(--line)}
#reply textarea{flex:1;background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:9px;resize:none;height:44px}
.empty{margin:auto;color:var(--mute);padding:30px;text-align:center}
#panel{padding:12px 16px;border-bottom:1px solid var(--line);font-size:13px;color:var(--mute);display:none}
#panel.on{display:block}#panel .btn{margin:4px 6px 0 0}
#back{display:none}
@media(max-width:760px){main{grid-template-columns:1fr}#right{display:none}body.open #left{display:none}body.open #right{display:flex}#back{display:inline-block}}
</style></head><body>
<header><h1>Chat console</h1><button class="btn" id="settings">Settings</button></header>
<div id="panel"></div>
<main>
<section id="left">
 <div id="filters">
  <input id="q" type="search" placeholder="Search all messages" autocomplete="off">
  <select id="type"><option value="">All chats</option><option value="intro">Intro chat</option><option value="fit">Job-fit chat</option></select>
  <select id="mode"><option value="">Bot or human</option><option value="bot">Bot</option><option value="human">Human (me)</option></select>
  <input id="from" type="date" title="From"><input id="to" type="date" title="To">
 </div>
 <div id="list"></div>
</section>
<section id="right">
 <div id="top"><button class="btn" id="back">‹ Back</button><div class="meta" id="meta">Select a conversation</div>
  <button class="btn" id="handback" hidden>Hand back to bot</button></div>
 <div id="msgs"><div class="empty">Select a conversation to read it. New messages appear here within a few seconds.</div></div>
 <form id="reply" hidden><textarea id="text" placeholder="Reply as yourself. The visitor sees it live and the bot goes quiet." maxlength="2000"></textarea><button class="btn pri" id="send">Send</button></form>
</section>
</main>
<script nonce="${nonce}">
(function(){
var $=function(i){return document.getElementById(i)};
var cur=null,lastId=0,timer=null,listTimer=null;
function api(path,opts){opts=opts||{};opts.headers=Object.assign({'X-Admin':'1','Content-Type':'application/json'},opts.headers||{});
 return fetch('/api/admin/'+path,opts).then(function(r){return r.json().then(function(j){if(!r.ok)throw new Error(j.error||r.status);return j})})}
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function ago(iso){var s=(Date.now()-new Date(iso))/1000;if(s<60)return'just now';if(s<3600)return Math.floor(s/60)+'m ago';if(s<86400)return Math.floor(s/3600)+'h ago';return new Date(iso).toLocaleDateString()}
function stamp(iso){return new Date(iso).toLocaleString([], {month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}
function hl(node,text){var parts=text.split(/(\\u0001[^\\u0002]*\\u0002)/);parts.forEach(function(p){if(p.charAt(0)==='\\u0001'){var m=el('mark',null,p.slice(1,-1));node.appendChild(m)}else node.appendChild(document.createTextNode(p))})}
function filters(){var p=new URLSearchParams();['q','type','mode','from','to'].forEach(function(k){var v=$(k).value.trim();if(v)p.set(k,v)});return p.toString()}
function loadList(){return api('conversations?'+filters()).then(function(r){var box=$('list');box.textContent='';
 if(!r.conversations.length){box.appendChild(el('div','empty','No conversations match.'));return}
 r.conversations.forEach(function(c){var it=el('div','item'+(c.session_id===cur?' on':''));
  var r1=el('div','row1');r1.appendChild(el('span',null,ago(c.last_activity_at)));
  if(c.chat_type==='fit')r1.appendChild(el('span','tag fit','fit'));if(c.mode==='human')r1.appendChild(el('span','tag human','me'));
  r1.appendChild(el('span','sp'));r1.appendChild(el('span',null,c.message_count+' msgs · '+c.user_id));it.appendChild(r1);
  it.appendChild(el('div','prev',c.preview||'(no visitor message)'));
  if(c.snippet){var s=el('div','snip');hl(s,c.snippet);it.appendChild(s)}
  it.onclick=function(){openConv(c.session_id)};box.appendChild(it)})}).catch(function(e){$('list').textContent='Error: '+e.message})}
function row(m){var d=el('div','m '+m.role);d.appendChild(el('small',null,(m.role==='visitor'?'Visitor':m.role==='adam'?'You':'Assistant')+' · '+stamp(m.created_at)));d.appendChild(document.createTextNode(m.content));return d}
function render(c,append){var box=$('msgs');if(!append){box.textContent='';lastId=0}
 var atts={};c.attachments.forEach(function(a){atts[a.message_id]=a.url});
 c.messages.forEach(function(m){box.appendChild(row(m));if(atts[m.id]){var a=el('div','att','Link read: '+atts[m.id]);box.appendChild(a)}lastId=Math.max(lastId,m.id)});
 var s=c.session;$('meta').textContent=(s.chat_type==='fit'?'Job-fit chat':'Intro chat')+' · '+s.user_id+' · started '+stamp(s.created_at)+' · #'+s.session_id.slice(0,4)+(s.mode==='human'?' · you are in this conversation':'');
 $('handback').hidden=s.mode!=='human';$('reply').hidden=false;
 if(c.messages.length)box.scrollTop=box.scrollHeight}
function openConv(id){cur=id;history.replaceState(null,'','#'+id);document.body.classList.add('open');
 api('conversation?id='+encodeURIComponent(id)).then(function(c){render(c,false);loadList()}).catch(function(e){$('msgs').textContent='Error: '+e.message})}
function tick(){if(document.hidden)return;loadList();if(cur)api('conversation?id='+encodeURIComponent(cur)+'&after='+lastId).then(function(c){render(c,true)}).catch(function(){})}
$('reply').onsubmit=function(e){e.preventDefault();var t=$('text').value.trim();if(!t||!cur)return;$('send').disabled=true;
 api('reply',{method:'POST',body:JSON.stringify({sessionId:cur,text:t})}).then(function(){$('text').value='';tick()}).catch(function(e){alert('Not sent: '+e.message)}).then(function(){$('send').disabled=false})};
$('text').onkeydown=function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();$('reply').requestSubmit()}};
$('handback').onclick=function(){api('mode',{method:'POST',body:JSON.stringify({sessionId:cur,mode:'bot'})}).then(function(){openConv(cur)})};
$('back').onclick=function(){document.body.classList.remove('open');cur=null;history.replaceState(null,'',location.pathname)};
var deb;['q','type','mode','from','to'].forEach(function(k){$(k).addEventListener('input',function(){clearTimeout(deb);deb=setTimeout(loadList,250)})});
$('settings').onclick=function(){var p=$('panel');p.classList.toggle('on');if(!p.classList.contains('on'))return;p.textContent='Loading…';
 api('status').then(function(s){p.textContent='';p.appendChild(el('div',null,'Signed in as '+s.email+'. Alerts: '+(s.alertsConfigured?'on ('+s.alertProvider+')':'not configured')+'. Telegram token '+(s.telegram.token?'✓':'✗')+', chat id '+(s.telegram.chatId?'✓':'✗')+', webhook secret '+(s.telegram.webhookSecret?'✓':'✗')+'.'));
  var b1=el('button','btn','Connect Telegram webhook');b1.onclick=function(){api('telegram/webhook',{method:'POST',body:'{}'}).then(function(r){alert(r.ok?'Telegram webhook set.':'Failed: '+(r.description||r.error||'unknown'))}).catch(function(e){alert(e.message)})};
  var b2=el('button','btn','Send test alert');b2.onclick=function(){api('telegram/test',{method:'POST',body:'{}'}).then(function(r){alert(r.ok?'Sent. Check Telegram.':'Not sent: '+(r.reason||'check the Telegram settings'))}).catch(function(e){alert(e.message)})};
  var b3=el('button','btn','Delete conversations older than 12 months');b3.onclick=function(){if(confirm('Permanently delete every conversation with no activity in the last 12 months?'))api('purge',{method:'POST',body:JSON.stringify({days:365})}).then(function(r){alert('Deleted '+r.deletedConversations+' conversations.');loadList()}).catch(function(e){alert(e.message)})};
  p.appendChild(b1);p.appendChild(b2);p.appendChild(b3)}).catch(function(e){p.textContent='Error: '+e.message})};
if(location.hash.length>4)openConv(location.hash.slice(1));
loadList();setInterval(tick,4000);
})();
</script></body></html>`;
}
