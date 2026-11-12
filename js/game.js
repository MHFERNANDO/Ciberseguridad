'use strict';
const $=s=>document.querySelector(s);
const state={xp:0,done:[]};
const MAX_XP=300;
try{const s=JSON.parse(localStorage.getItem('crescendo')||'null');if(s){state.xp=s.xp;state.done=s.done}}catch(e){}
const save=()=>{try{localStorage.setItem('crescendo',JSON.stringify(state))}catch(e){}};
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),1800)}
function addXP(n){state.xp+=n;toast('+'+n+' XP ⭐');renderHud();save()}
function renderHud(){$('#xpFill').style.width=Math.min(100,state.xp/MAX_XP*100)+'%';$('#xpText').textContent=state.xp+' XP'}
function show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));$(id).classList.add('active');scrollTo(0,0)}
function finish(i){
 const first=!state.done.includes(i);if(first){state.done.push(i);addXP(40)}save();
 setTimeout(()=>{
  const last=i>=missions.length-1,o=document.createElement('div');o.className='overlay';
  o.innerHTML=`<div class="card win"><div class="badge">🎉</div><h2>¡Nivel ${i+1} completado!</h2><p>${first?'¡Ganaste +40 XP! ':''}${last?'¡Completaste todas las misiones!':'Ya puedes seguir con: <b>'+missions[i+1].t+'</b>'}</p><button class="btn" id="wn">${last?'🏆 Ver mi insignia':'▶ Continuar al siguiente nivel'}</button><button class="btn alt" id="wm">🗺️ Volver al mapa</button></div>`;
  document.body.appendChild(o);
  $('#wn').onclick=()=>{o.remove();show('#stage');last?final():missions[i+1].run(i+1)};
  $('#wm').onclick=()=>{o.remove();home()};
 },900);
}

const missions=[
 {ico:'⚔️',t:'Atacantes y defensores',d:'Aprende qué es la ciberseguridad',run:m1},
 {ico:'🔑',t:'Forja tu contraseña',d:'Crea una clave que nadie pueda adivinar',run:m2},
 {ico:'🎣',t:'Caza al phishing',d:'Encuentra las pistas del correo falso',run:m3},
 {ico:'🍯',t:'Trampa de miel',d:'Atrapa a un hacker con un honeypot',run:m4},
 {ico:'🐝',t:'Vuelo de la abeja',d:'Juego arcade: vuela por la respuesta correcta',run:m5}
];
const pos=[[11,74],[29,30],[50,68],[70,28],[89,66]];
function renderMap(){
 const nodes=missions.map((m,i)=>{
  const locked=i>0&&!state.done.includes(i-1),d=state.done.includes(i);
  return `<button class="pin${d?' done':''}${locked?' lock':''}" style="left:${pos[i][0]}%;top:${pos[i][1]}%" ${locked?'disabled':''} data-i="${i}" aria-label="Misión ${i+1}: ${m.t}"><span class="dot">${locked?'🔒':d?'✅':m.ico}</span><span class="tag">${m.t}</span></button>`}).join('');
 const trophy=state.done.length===missions.length?'<button class="btn" id="tr" style="margin-top:16px">🏆 Ver mi insignia final</button>':'';
 $('#map').innerHTML=`<div class="world"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
 <path class="land" d="M0 100V58C8 48 18 52 24 60S42 80 52 74 66 52 78 58 92 72 100 62V100Z"/>
 <path class="land l2" d="M12 8C22 0 38 6 40 16S30 34 18 30 4 16 12 8Z"/><path class="land l2" d="M60 4C72 -2 90 4 96 14S88 38 72 36 52 12 60 4Z"/>
 <path class="trail" d="M${pos.map(q=>q.join(' ')).join(' L')}" /></svg>
 <span class="deco" style="left:4%;top:20%">🏔️</span><span class="deco" style="left:44%;top:12%">🌲</span><span class="deco" style="left:80%;top:84%">🌴</span><span class="deco" style="left:22%;top:88%">⛵</span><span class="deco" style="left:62%;top:50%">🌊</span><span class="deco" style="left:92%;top:40%">🏰</span>${nodes}</div>${trophy}`;
 document.querySelectorAll('.pin').forEach(b=>b.onclick=()=>{show('#stage');missions[b.dataset.i].run(+b.dataset.i)});
 const t=$('#tr');if(t)t.onclick=()=>{show('#stage');final()};
}
function home(){renderMap();show('#home')}
const wrap=(h)=>{$('#stage').innerHTML=`<button class="back" onclick="home()">← Volver al mapa</button><div class="card">${h}</div>`};

/* Misión 1: Cazahackers */
function m1(i){
 const T=[['Correo falso para robar tu clave','a'],['Verificación en dos pasos','d'],['Virus escondido en un juego','a'],['Actualizar el celular','d'],['Probar miles de claves','a'],['Firewall bloqueando intrusos','d'],['Antivirus activo','d'],['Mensaje falso del banco','a']];
 let zap=0,lives=3,tick=0,over=false,started=false;const live=[];
 wrap(`<h2>Misión 1: Cazahackers</h2><p>Los <b>atacantes</b> intentan robar o dañar. Los <b>defensores</b> nos protegen. Toca solo los <b>ataques</b> antes de que lleguen al fondo. ¡No toques las defensas! Elimina 8. Lee con calma: el juego empieza cuando pulses el botón.</p><div class="arena" id="ar"></div><div class="fb" id="fb"></div><div id="end"></div>`);
 const ar=$('#ar'),hud=()=>$('#fb').innerHTML=`Eliminados: ${zap}/8 &nbsp; Vidas: ${'❤️'.repeat(Math.max(lives,0))}`;hud();
 ar.innerHTML='<button class="btn" id="st1" style="display:block;margin:150px auto 0">▶ ¡Listo, empezar!</button>';
 $('#st1').onclick=()=>{ar.innerHTML='';started=true};
 function end(w){over=true;ar.innerHTML='';$('#end').innerHTML=w?'<p class="ok">¡Zona limpia! Ya distingues quién ataca y quién defiende.</p><button class="btn" onclick="home()">Volver al mapa</button>':'<p class="bad">Los hackers ganaron esta vez.</p><button class="btn" id="rt">Reintentar</button>';if(w)finish(i);else $('#rt').onclick=()=>m1(i)}
 const hit=m=>{lives--;toast(m);hud();if(lives<=0)end(false)};
 const iv=setInterval(()=>{
  if(!document.body.contains(ar)||over){clearInterval(iv);return}
  if(!started)return;
  tick++;
  if(tick%40===1){const [t,k]=T[Math.floor(Math.random()*T.length)],e=document.createElement('button'),o={e,k,y:-50};e.className='fall';e.textContent=t;e.style.left=Math.random()*55+'%';e.style.top='-50px';
   e.onclick=()=>{if(over||o.dead)return;o.dead=true;e.remove();if(k==='a'){zap++;addXP(4);hud();if(zap>=8)end(true)}else hit('🛡️ Eso era una defensa, ¡nos protege!')};ar.appendChild(e);live.push(o)}
  live.forEach(o=>{if(o.dead)return;o.y+=2.2;o.e.style.top=o.y+'px';if(o.y>330){o.dead=true;o.e.remove();if(o.k==='a')hit('👾 Se coló: '+o.e.textContent)}});
 },30);
}

/* Misión 2: Carrera contra el hacker */
function m2(i){
 wrap(`<h2>Misión 2: Protege la bóveda</h2><p>Un hacker robot 🤖 corre hacia tu bóveda 🔐. Escribe una contraseña inventada (¡nunca la real!): mientras más fuerte, más lento va. Mantén las 5 casillas marcadas durante 4 segundos.</p>
 <input type="text" id="pw" autocomplete="off" placeholder="Escribe para empezar la carrera…">
 <div class="track"><span id="bot">🤖</span><span class="vault">🔐</span></div><p id="crack" class="big"></p>
 <ul class="checks" id="ck"><li>12 o más caracteres</li><li>Mayúsculas y minúsculas</li><li>Números</li><li>Símbolos (!@#$)</li><li>No es una clave común</li></ul><div id="end"></div>`);
 const common=['123456','password','qwerty','admin','contraseña','12345678','iloveyou','abc123'];
 let score=0,pos=0,hold=0,go=false,won=false;
 $('#pw').addEventListener('input',()=>{
  go=true;const p=$('#pw').value;
  const c=[p.length>=12,/[a-z]/.test(p)&&/[A-Z]/.test(p),/\d/.test(p),/[^\w\s]/.test(p),p.length>0&&!common.some(w=>p.toLowerCase().includes(w))];
  document.querySelectorAll('#ck li').forEach((l,k)=>l.classList.toggle('on',c[k]));score=c.filter(Boolean).length;
  $('#crack').textContent=['💥 El hacker la adivina al instante','😬 Muy débil','🙂 Regular','💪 Casi fuerte','🏰 Fuerte, ¡aguanta!','🏰 ¡Fuerte! Resiste unos segundos…'][score];
 });
 const iv=setInterval(()=>{
  if(!document.body.contains($('#pw'))||won){clearInterval(iv);return}
  if(!go)return;
  pos=Math.max(0,pos+(score>=5?-2:(5-score)*.4));
  if(pos>=100){pos=0;hold=0;toast('💥 ¡El hacker abrió la bóveda! Mejora tu clave')}
  hold=score>=5?hold+1:0;
  $('#bot').style.left=pos*.86+'%';
  if(hold>=40){won=true;$('#end').innerHTML='<p class="ok">🔒 Bóveda segura. Truco: una frase larga como <i>MiGatoComeP1zza!Hoy</i> es fuerte y fácil de recordar.</p><button class="btn" onclick="home()">Volver al mapa</button>';finish(i)}
 },100);
}

/* Misión 3: Bandeja de entrada contrarreloj */
function m3(i){
 const E=[['soporte@banc0-seguro.com','¡URGENTE! Tu cuenta se bloquea en 1 hora','Confirma tus datos aquí: bit.ly/verifica-ya',1,'Dominio con un 0, mucha prisa y enlace acortado'],
 ['mama@gmail.com','Fotos del domingo','Te mando las fotos de ayer, ¡qué linda quedó la torta!',0,'Contacto conocido y no te pide nada raro'],
 ['premios@sorteo-gana.xyz','¡Ganaste un iPhone gratis!','Solo paga $2 de envío con tu tarjeta',1,'Premios que nunca pediste que terminan pidiendo dinero'],
 ['seguridad@tu-universidad.edu','Cambio de clave solicitado','Si fuiste tú, ignora este aviso. Si no, entra a la web oficial.',0,'No pide datos ni trae enlaces; te manda a la web oficial'],
 ['rrhh@empresa-ayuda.net','Tu rol de pagos','Abre el adjunto: rol_de_pagos.exe',1,'Un .exe es un programa, no un documento'],
 ['envios@correos-ec.top','Tu paquete llegó, paga la tasa','Ingresa los datos de tu tarjeta en correos-pago.top',1,'Dominio raro y te piden la tarjeta']].sort(()=>Math.random()-.5);
 let n=0,ok=0,t=100,lock=true;
 wrap(`<h2>Misión 3: Bandeja contrarreloj</h2><p>Llegan 6 correos. Tendrás unos segundos por correo para decidir si es <b>phishing</b> (estafa) o <b>seguro</b>. Necesitas 5 aciertos. Lee con calma y pulsa el botón cuando estés listo: el tiempo no corre hasta entonces.</p><div id="mail"></div><div class="fb" id="fb"></div><div id="end"></div>`);
 function draw(){
  if(n>=E.length){const w=ok>=5;$('#mail').innerHTML='';$('#end').innerHTML=w?`<p class="ok">¡${ok}/6! Regla de oro: no hagas clic; entra tú mismo a la web oficial.</p><button class="btn" onclick="home()">Volver al mapa</button>`:`<p class="bad">${ok}/6, necesitas 5.</p><button class="btn" id="rt">Reintentar</button>`;if(w)finish(i);else $('#rt').onclick=()=>m3(i);return}
  const e=E[n];t=100;lock=false;$('#fb').textContent='';
  $('#mail').innerHTML=`<div class="mail"><div class="hd"><b>De:</b> ${e[0]}<br><b>Asunto:</b> ${e[1]}</div><p>${e[2]}</p></div><div class="meter"><i id="tm" style="width:100%;background:var(--honey)"></i></div><button class="btn red" data-a="1">🚩 Phishing</button><button class="btn green" data-a="0">✅ Seguro</button> (${n+1}/6)`;
  document.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>ans(+b.dataset.a));
 }
 function ans(a){if(lock)return;lock=true;const e=E[n],r=a===e[3];if(r){ok++;addXP(5)}
  $('#fb').className='fb '+(r?'ok':'bad');$('#fb').textContent=(r?'✔ ':a<0?'⏰ Tiempo. ':'✘ ')+e[4];n++;setTimeout(draw,1700)}
 const iv=setInterval(()=>{if(!document.body.contains($('#mail'))){clearInterval(iv);return}
  if(lock||n>=E.length)return;t-=0.4;const b=$('#tm');if(b)b.style.width=t+'%';if(t<=0)ans(-1)},100);
 $('#mail').innerHTML='<button class="btn" id="st">▶ ¡Estoy listo, empezar!</button>';$('#st').onclick=draw;
}

/* Misión 4: Despliega tus honeypots */
function m4(i){
 const real=[0,4,8].map(k=>k===4?[2,4,6,8][Math.floor(Math.random()*4)]:k);const R=[...new Set(real)];
 while(R.length<3){const k=Math.floor(Math.random()*9);if(!R.includes(k))R.push(k)}
 let H=[],busy=false;
 wrap(`<h2>Misión 4: Despliega tus honeypots</h2><p>Un <b>honeypot</b> (tarro de miel) es un sistema <b>falso</b> que atrae atacantes para estudiarlos sin riesgo. Tu red tiene 3 servidores reales 🗄️. Coloca <b>3 honeypots</b> 🍯 en las casillas vacías y suelta a los atacantes: ¡no dejes que dañen más de 2 veces los reales!</p><div class="net" id="net"></div><div id="end"></div><div class="term" id="term" hidden></div>`);
 const tiles=[...Array(9).keys()].map(k=>{const b=document.createElement('button');b.className='tile';b.textContent=R.includes(k)?'🗄️':'⬜';b.setAttribute('aria-label','casilla '+(k+1));
  b.onclick=()=>{if(busy||R.includes(k))return;if(H.includes(k)){H=H.filter(x=>x!==k);b.textContent='⬜'}else if(H.length<3){H.push(k);b.textContent='🍯'}
   $('#end').innerHTML=H.length===3?'<button class="btn" id="go">👾 ¡Soltar atacantes!</button>':`<p>Honeypots: ${H.length}/3</p>`;if(H.length===3)$('#go').onclick=run};
  $('#net').appendChild(b);return b});
 function run(){busy=true;$('#end').innerHTML='';const t=$('#term');t.hidden=false;t.textContent='';let n=0,dmg=0,trap=0;
  const w=tiles.map((_,k)=>H.includes(k)?5:R.includes(k)?1:.7),sum=w.reduce((a,b)=>a+b);
  const iv=setInterval(()=>{let r=Math.random()*sum,k=0;while(r>w[k]){r-=w[k];k++}
   tiles[k].classList.add('hit');setTimeout(()=>tiles[k].classList.remove('hit'),500);
   if(H.includes(k)){trap++;t.textContent+=`> Atacante ${n+1}: cayó en el honeypot 🍯 (registrado)\n`}else if(R.includes(k)){dmg++;t.textContent+=`> Atacante ${n+1}: ¡dañó un servidor real! 💥\n`}else t.textContent+=`> Atacante ${n+1}: no encontró nada\n`;
   n++;if(n>=8){clearInterval(iv);const w=dmg<=2;$('#end').innerHTML=`<p class="${w?'ok':'bad'}">Atrapaste ${trap} atacantes y hubo ${dmg} daños. ${w?'Así funciona Crescendo: los honeypots nos enseñan cómo atacan, sin arriesgar nada real.':'Prueba otra distribución de señuelos.'}</p>`+(w?'<button class="btn" onclick="home()">Volver al mapa</button>':'<button class="btn" id="rt">Reintentar</button>');if(w)finish(i);else $('#rt').onclick=()=>m4(i)}},800)}
}

/* Misión 5: Vuelo de la abeja (estilo flappy) */
function m5(i){
 const Q=[['Recibes un correo "URGENTE: confirma tu clave". ¿Qué haces?',['Ignorarlo y avisar','Entrar al enlace'],0,'Los correos con prisa buscan que no pienses. Nunca des tu clave por enlaces.'],
 ['¿Cuál es una clave más fuerte?',['MiGatoComePizza!7','123456'],0,'Larga, con mezcla de caracteres y fácil de recordar para ti.'],
 ['Wi-Fi gratis del café: ¿qué es más seguro?',['Evitar el banco ahí','Entrar al banco'],0,'Las redes públicas pueden espiarse. Para cosas sensibles usa tus datos móviles.'],
 ['¿Para qué sirve la verificación en dos pasos?',['Un candado extra','Para olvidar la clave'],0,'Aunque roben tu clave, necesitan además tu celular.'],
 ['¿Qué es un honeypot?',['Un sistema señuelo','Un antivirus'],0,'Es una trampa falsa que atrae atacantes para estudiarlos sin riesgo.'],
 ['Tu celular pide actualizarse. ¿Y ahora?',['Actualizar hoy','Posponer meses'],0,'Las actualizaciones tapan agujeros de seguridad que los atacantes conocen.']];
 wrap(`<h2>Misión 5: Vuelo de la abeja</h2><p>Toca la pantalla, haz clic o pulsa <b>espacio</b> para aletear. Atraviesa el hueco con la <b>respuesta correcta</b>. Tienes 5 vidas.</p><p class="big" id="q">Toca para empezar</p><canvas id="cv" width="480" height="520"></canvas><div class="fb" id="fb"></div><div id="end"></div>`);
 const cv=$('#cv'),c=cv.getContext('2d'),W=480,H=520,GH=210,WX=60,BX=90,R=14;
 let y=H/2,v=0,lives=5,n=0,score=0,wall=null,started=false,wait=0,dead=false,bg=0;
 const order=Q.map((_,k)=>k).sort(()=>Math.random()-.5).slice(0,5);
 const flap=e=>{if(e&&e.type==='keydown'){if(e.code!=='Space')return;e.preventDefault()}if(dead)return;started=true;v=-3.8};
 document.addEventListener('keydown',flap);cv.addEventListener('pointerdown',flap);
 function spawn(){
  const q=Q[order[n]],top=Math.random()<.5?0:1;
  const qe=$('#q');qe.classList.remove('flash');void qe.offsetWidth;qe.classList.add('flash');
  wall={x:W,ans:top?[q[1][1],q[1][0]]:[q[1][0],q[1][1]],ok:top,got:null,q};
  $('#q').textContent=q[0];
 }
 const lose=msg=>{lives--;$('#fb').className='fb bad';$('#fb').textContent=msg+' ❤️ '.repeat(0)+'  Vidas: '+'🍯'.repeat(Math.max(lives,0));wall=null;wait=90;
  if(lives<=0){dead=true;$('#end').innerHTML='<p class="bad">Se acabaron las vidas.</p><button class="btn" id="rt">Reintentar</button>';$('#rt').onclick=()=>m5(i)}};
 function label(t,x,yy){c.font='600 14px Fredoka,sans-serif';const w=t.split(' ');let l1=t,l2='';if(t.length>16){let h=Math.ceil(w.length/2);l1=w.slice(0,h).join(' ');l2=w.slice(h).join(' ')}
  c.textAlign='right';c.fillStyle='#fff';c.fillText(l1,x,yy-(l2?4:-5));if(l2)c.fillText(l2,x,yy+14)}
 function loop(){
  if(!document.body.contains(cv)){document.removeEventListener('keydown',flap);return}
  bg=(bg+1)%W;c.fillStyle='#2e2570';c.fillRect(0,0,W,H);c.fillStyle='#3a2f8a';
  for(let k=0;k<6;k++){c.beginPath();c.arc(((k*130-bg*.5)%(W+60)+W+60)%(W+60),90+k*70,22,0,7);c.fill()}
  if(started&&!dead){v+=.17;y+=v}else if(!dead){y=H/2+Math.sin(Date.now()/250)*8}
  if(y<R){y=R;v=0}if(y>H-R){y=H-R;v=0}
  if(wait>0){wait--;if(wait===0&&!dead)spawn()}
  if(started&&!wall&&wait===0&&!dead&&n<5)spawn();
  if(wall&&!dead){
   wall.x-=0.9;const gaps=[[130-GH/2,130+GH/2],[390-GH/2,390+GH/2]];
   const segs=[[0,gaps[0][0]],[gaps[0][1],gaps[1][0]],[gaps[1][1],H]];
   c.fillStyle='#ffb62e';segs.forEach(s=>c.fillRect(wall.x,s[0],WX,s[1]-s[0]));
   label(wall.ans[0],wall.x-8,130);label(wall.ans[1],wall.x-8,390);
   if(BX+R>wall.x&&BX-R<wall.x+WX){
    const gi=gaps.findIndex(g=>y-R>g[0]&&y+R<g[1]);
    if(gi<0){lose('¡Choque con el muro!')}else wall.got=gi}
   else if(wall&&wall.x+WX<BX-R){
    const good=wall.got===wall.ok;wall.q&&($('#fb').textContent='');
    if(good){score++;n++;addXP(8);$('#fb').className='fb ok';$('#fb').textContent='✔ '+wall.q[3];wall=null;wait=110;
     if(n>=5){dead=true;finish(i);$('#q').textContent='¡Terminaste el vuelo!';$('#end').innerHTML='<button class="btn" onclick="home()">Volver al mapa</button>'}}
    else lose('✘ Respuesta incorrecta. '+wall.q[3]);
   }
  }
  c.save();c.translate(BX,y);c.rotate(Math.max(-.5,Math.min(.8,v/10)));c.font='32px serif';c.textAlign='center';c.textBaseline='middle';c.fillText('🐝',0,0);c.restore();c.textBaseline='alphabetic';
  c.textAlign='left';c.font='600 16px Fredoka,sans-serif';c.fillStyle='#fff';c.fillText('Aciertos: '+score+'/5   Vidas: '+'🍯'.repeat(Math.max(lives,0)),12,24);
  requestAnimationFrame(loop);
 }
 loop();
}

function final(){
 wrap(`<div class="badge">🏆</div><h2 style="text-align:center">¡Eres un Defensor Crescendo!</h2><p style="text-align:center">Ya sabes qué es la ciberseguridad, cómo crear claves fuertes, detectar phishing y usar un honeypot. Ahora cuéntaselo a alguien.</p><p style="text-align:center"><button class="btn" onclick="home()">Volver al mapa</button> <button class="btn alt" onclick="state.xp=0;state.done=[];save();renderHud();home()">Jugar de nuevo</button></p>`);
}
renderHud();home();