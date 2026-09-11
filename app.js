'use strict';
const tracks = window.RADIO_TRACKS;
const $ = id => document.getElementById(id);
let selected = 0;
const buttons = tracks.map((track, index) => {
 const li = document.createElement('li');
 const button = document.createElement('button');
 button.className = 'track';
 button.setAttribute('aria-label', `${track.date} ${track.title} ${track.artist}`);
 for (const [className, value] of [['date',track.date],['name',track.title],['artist',track.artist]]) {
  const span = document.createElement('span'); span.className = className; span.textContent = value; button.append(span);
 }
 button.addEventListener('click', () => select(index)); li.append(button); $('tracks').append(li); return button;
});
function select(index) {
 selected = (index + tracks.length) % tracks.length;
 const track = tracks[selected];
 $('audio').pause(); $('audio').removeAttribute('src'); $('audio').load(); $('audio').hidden = true;
 $('video').replaceChildren(); $('video').hidden = true;
 $('now-title').textContent = track.title; $('now-artist').textContent = `${track.artist} · ${track.version}`;
 $('source').href = `https://www.youtube.com/watch?v=${track.video}`;
 $('status').textContent = track.audio ? '音频已就绪，点击播放。' : '选择的是官方在线版本，点击打开播放器。';
 $('play').textContent = track.audio ? '播放' : '打开播放器';
 buttons.forEach((button,i) => button.setAttribute('aria-pressed', String(i === selected)));
}
async function play() {
 const track = tracks[selected];
 if (track.audio) {
  const url = new URL(track.audio, location.href);
  if (!['http:','https:'].includes(url.protocol)) { $('status').textContent = '音源地址不可用。'; return; }
  const audio = $('audio'); audio.hidden = false;
  if (audio.src !== url.href) audio.src = url.href;
  if (!audio.paused) { audio.pause(); return; }
  try { await audio.play(); } catch { $('status').textContent = '暂时无法播放，请检查音源或稍后重试。'; }
  return;
 }
 const frame = document.createElement('iframe');
 frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(track.video)}?playsinline=1`;
 frame.title = `${track.title} · 官方播放器`; frame.allow = 'encrypted-media; fullscreen; picture-in-picture'; frame.allowFullscreen = true;
 frame.referrerPolicy = 'strict-origin-when-cross-origin';
 $('video').replaceChildren(frame); $('video').hidden = false;
 $('status').textContent = '请在播放器中点播放；若无法加载，可打开官方页面。';
 $('play').textContent = '重新打开播放器';
}
$('play').addEventListener('click', play);
$('previous').addEventListener('click', () => select(selected-1));
$('next').addEventListener('click', () => select(selected+1));
$('audio').addEventListener('play', () => { $('play').textContent='暂停'; $('status').textContent='正在播放'; });
$('audio').addEventListener('pause', () => { if(tracks[selected].audio) $('play').textContent='播放'; });
$('audio').addEventListener('error', () => { $('status').textContent='音频暂时不可用，请稍后重试。'; });
$('audio').addEventListener('ended', () => { select(selected+1); if(tracks[selected].audio) play(); });
select(0);
