const $=id=>document.getElementById(id);
const enc=new TextEncoder(),dec=new TextDecoder();
function toast(m){const t=$('toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.i);toast.i=setTimeout(()=>t.classList.remove('on'),1800)}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function err(el,m){el.textContent='ข้อผิดพลาด: '+m}
/* navigation */
const tabs=[['home','หน้าแรก'],['pw','รหัสผ่าน'],['aes','AES'],['hash','Hash'],['url','ลิงก์'],['jwt','JWT'],['hdr','Headers'],['dev','Dev'],['lab','Lab']];
tabs.forEach(([k,l])=>{const b=document.createElement('button');b.textContent=l;b.dataset.go=k;$('nav').appendChild(b)});
function go(k){document.querySelectorAll('section').forEach(s=>s.classList.toggle('on',s.id===k));document.querySelectorAll('[data-go]').forEach(b=>{if(b.closest('nav'))b.classList.toggle('on',b.dataset.go===k)});scrollTo(0,0);try{history.replaceState(null,'','#'+k)}catch(e){}}
document.addEventListener('click',e=>{const g=e.target.closest('[data-go]');if(g)go(g.dataset.go);const c=e.target.closest('[data-copy]');if(c){const t=$(c.dataset.copy).textContent;if(!t)return toast('ยังไม่มีข้อมูลให้คัดลอก');navigator.clipboard.writeText(t).then(()=>toast('คัดลอกแล้ว'),()=>toast('คัดลอกไม่สำเร็จ'))}});
addEventListener('hashchange',()=>{const k=location.hash.slice(1);if(tabs.some(t=>t[0]===k))go(k)});
$('theme').onclick=()=>{const r=document.documentElement;const dark=(r.dataset.theme||(matchMedia('(prefers-color-scheme:light)').matches?'light':'dark'))==='dark';r.dataset.theme=dark?'light':'dark'};
/* random */
function ri(n){const lim=Math.floor(4294967296/n)*n;const a=new Uint32Array(1);let x;do{crypto.getRandomValues(a);x=a[0]}while(x>=lim);return x%n}
const WORDS="amber anchor arrow badge basil beacon birch bridge cable candle canyon castle cedar cipher cloud comet coral crest delta dune eagle ember falcon fern flint forest gale garnet glacier harbor hazel helm indigo iris jade jasmine kernel lagoon lantern lemon lotus maple marble meadow mint nectar nimbus oasis olive onyx orbit otter pearl pepper pine plume quartz quill raven reef ridge river saffron sage shadow silver sky slate spark spruce stone summit tango thistle thunder tulip umber valley velvet violet willow winter zephyr zinc".split(" ");
function genPw(){const L=+$('pwLen').value;if($('cP').checked){const n=Math.max(4,Math.round(L/5));const w=[];for(let i=0;i<n;i++)w.push(WORDS[ri(WORDS.length)]);return{v:w.join('-')+'-'+ri(100),bits:n*Math.log2(WORDS.length)+Math.log2(100)}}
const sets=[[$('cU'),'ABCDEFGHIJKLMNOPQRSTUVWXYZ'],[$('cL'),'abcdefghijklmnopqrstuvwxyz'],[$('cN'),'0123456789'],[$('cS'),'!@#$%^&*()-_=+[]{};:,.?']].filter(s=>s[0].checked).map(s=>s[1]);
if(!sets.length)return null;const all=sets.join('');const ch=sets.map(s=>s[ri(s.length)]);while(ch.length<L)ch.push(all[ri(all.length)]);for(let i=ch.length-1;i>0;i--){const j=ri(i+1);[ch[i],ch[j]]=[ch[j],ch[i]]}return{v:ch.join(''),bits:L*Math.log2(all.length)}}
function level(b){return b<40?['อ่อนมาก','var(--er)',20]:b<60?['พอใช้','var(--wn)',45]:b<80?['ดี','var(--cy)',70]:['แข็งแรง','var(--ok)',100]}
function showPw(){const g=genPw();if(!g){$('pwOut').textContent='เลือกชุดอักขระอย่างน้อยหนึ่งชุด';return}$('pwOut').textContent=g.v;const l=level(g.bits);$('pwBar').style.width=l[2]+'%';$('pwBar').style.background=l[1];$('pwInfo').textContent=`ความแข็งแรง: ${l[0]} (ประมาณ ${Math.round(g.bits)} บิต)`}
$('pwGen').onclick=showPw;$('pwLen').oninput=()=>{$('pwLenV').textContent=$('pwLen').value;showPw()};['cU','cL','cN','cS','cP'].forEach(i=>$(i).onchange=showPw);showPw();
const COMMON=['password','123456','12345678','qwerty','111111','abc123','letmein','iloveyou','admin','welcome','monkey','dragon','passw0rd','1q2w3e','000000'];
$('pwChk').oninput=()=>{const p=$('pwChk').value;if(!p){$('pwChkOut').textContent='';return}const low=p.toLowerCase();let pool=0;if(/[a-z]/.test(p))pool+=26;if(/[A-Z]/.test(p))pool+=26;if(/\d/.test(p))pool+=10;if(/[^A-Za-z0-9]/.test(p))pool+=30;let bits=p.length*Math.log2(pool||1);const w=[];
if(COMMON.some(c=>low.includes(c))){bits=Math.min(bits,20);w.push('มีรูปแบบที่พบบ่อยในรหัสผ่านรั่วไหล')}if(/(.)\1{2,}/.test(p)){bits-=8;w.push('มีอักขระซ้ำติดกัน')}if(/(0123|1234|2345|3456|abcd|bcde|qwer|asdf)/i.test(p)){bits-=10;w.push('มีลำดับที่เดาง่าย')}if(p.length<12)w.push('สั้นกว่า 12 ตัวอักษร');
bits=Math.max(bits,0);const l=level(bits);$('pwChkOut').textContent=`${l[0]} (ประมาณ ${Math.round(bits)} บิต)${w.length?' | '+w.join(', '):''}`};
/* AES */
const b64=u=>{let s='';u.forEach(x=>s+=String.fromCharCode(x));return btoa(s)};
const unb64=s=>Uint8Array.from(atob(s.replace(/\s/g,'')),c=>c.charCodeAt(0));
const ITER=600000,MAGIC=[0x4f,0x50,0x53,0x31];
async function key(pw,salt,it){const k=await crypto.subtle.importKey('raw',enc.encode(pw),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:it,hash:'SHA-256'},k,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
async function seal(pw,data){const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));const k=await key(pw,salt,ITER);const ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},k,data));const h=new Uint8Array(5+4+16+12);h.set(MAGIC);h[4]=1;new DataView(h.buffer).setUint32(5,ITER);h.set(salt,9);h.set(iv,25);const o=new Uint8Array(h.length+ct.length);o.set(h);o.set(ct,h.length);return o}
async function open(pw,u){if(u.length<54||MAGIC.some((m,i)=>u[i]!==m)||u[4]!==1)throw new Error('รูปแบบข้อมูลไม่ถูกต้องหรือเวอร์ชันไม่รองรับ');const it=new DataView(u.buffer,u.byteOffset).getUint32(5);if(it<100000||it>5000000)throw new Error('ข้อมูลส่วนหัวผิดปกติ');const k=await key(pw,u.slice(9,25),it);try{return new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:u.slice(25,37)},k,u.slice(37)))}catch(e){throw new Error('รหัสผ่านไม่ถูกต้องหรือข้อมูลถูกแก้ไข')}}
function dl(name,bytes,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([bytes],{type:type||'application/octet-stream'}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000);toast('ดาวน์โหลดแล้ว')}
async function busy(btn,fn){const t=btn.textContent;btn.disabled=true;btn.textContent='กำลังทำงาน...';try{await fn()}catch(e){toast(e.message||'เกิดข้อผิดพลาด')}finally{btn.disabled=false;btn.textContent=t}}
$('aEnc').onclick=e=>busy(e.target,async()=>{const pw=$('aPw').value,t=$('aTx').value;if(!pw)throw new Error('กรอกรหัสผ่านก่อน');if(!t)throw new Error('กรอกข้อความก่อน');$('aOut').textContent=b64(await seal(pw,enc.encode(t)));toast('เข้ารหัสแล้ว')});
$('aDec').onclick=e=>busy(e.target,async()=>{const pw=$('aPw').value,t=$('aTx').value.trim();if(!pw||!t)throw new Error('กรอกรหัสผ่านและข้อความเข้ารหัส');let u;try{u=unb64(t)}catch(x){throw new Error('ข้อความไม่ใช่ Base64 ที่ถูกต้อง')}$('aOut').textContent=dec.decode(await open(pw,u));toast('ถอดรหัสแล้ว')});
function getFile(){const f=$('aFile').files[0];if(!f)throw new Error('เลือกไฟล์ก่อน');if(!$('aPw').value)throw new Error('กรอกรหัสผ่านก่อน');if(f.size>200*1048576)throw new Error('ไฟล์ใหญ่เกิน 200 MB');return f}
$('aFEnc').onclick=e=>busy(e.target,async()=>{const f=getFile();dl(f.name+'.obx',await seal($('aPw').value,new Uint8Array(await f.arrayBuffer())))});
$('aFDec').onclick=e=>busy(e.target,async()=>{const f=getFile();const out=await open($('aPw').value,new Uint8Array(await f.arrayBuffer()));dl(f.name.replace(/\.obx$/,'')||'decrypted.bin',out)});
/* Hash */
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
$('hGo').onclick=e=>busy(e.target,async()=>{const f=$('hFile').files[0];if(!f&&!$('hTx').value)throw new Error('ใส่ข้อความหรือเลือกไฟล์');const d=f?await f.arrayBuffer():enc.encode($('hTx').value);$('hOut').textContent=hex(await crypto.subtle.digest($('hAlg').value,d));cmp()});
function cmp(){const a=$('hOut').textContent.trim().toLowerCase(),b=$('hCmp').value.trim().toLowerCase();const o=$('hCmpOut');if(!a||!b){o.textContent='';return}o.innerHTML=a===b?'<span class="pill good">ตรงกัน</span>':'<span class="pill bad">ไม่ตรงกัน</span>'}
$('hCmp').oninput=cmp;$('hDl').onclick=()=>{const t=$('hOut').textContent;if(!t)return toast('ยังไม่มีผลลัพธ์');dl('hash.txt',enc.encode($('hAlg').value+': '+t+'\n'),'text/plain')};
/* URL */
const SHORT=['bit.ly','tinyurl.com','t.co','goo.gl','ow.ly','is.gd','buff.ly','cutt.ly','rebrand.ly','shorturl.at','t.ly'];
const BRANDS=['paypal','google','apple','microsoft','facebook','instagram','line','kbank','scb','bangkokbank','krungsri','amazon','netflix','lazada','shopee','dhl','thailandpost'];
function riskLabel(l){return{LOW:'ความเสี่ยงต่ำ',MEDIUM:'ความเสี่ยงปานกลาง',HIGH:'ความเสี่ยงสูง'}[l]}
$('uGo').onclick=()=>{let raw=$('uIn').value.trim();const o=$('uOut');if(!raw){o.innerHTML='<p class="note">วาง URL ก่อน</p>';return}if(!/^[a-z][a-z0-9+.-]*:/i.test(raw))raw='http://'+raw;let u;try{u=new URL(raw)}catch(e){o.innerHTML='<p class="note">URL ไม่ถูกต้อง</p>';return}
const r=[];let s=0;const add=(n,t)=>{s+=n;r.push(t)};const h=u.hostname.toLowerCase();
if(!/^https?:$/.test(u.protocol))add(3,'โปรโตคอล '+u.protocol+' ไม่ใช่เว็บทั่วไป');else if(u.protocol==='http:')add(2,'ไม่ใช้ HTTPS ข้อมูลอาจถูกดักอ่านได้');
if(/^\d+\.\d+\.\d+\.\d+$/.test(h)||h.includes(':')||/^0x/i.test(h))add(3,'ใช้ IP Address แทนชื่อโดเมน');
if(u.username||u.password)add(3,'มีชื่อผู้ใช้ในลิงก์ (รูปแบบ user@host ที่มักใช้หลอกให้เห็นโดเมนผิด)');
if(u.port&&!['80','443'].includes(u.port))add(2,'ใช้พอร์ตผิดปกติ ('+u.port+')');
if(h.split('.').some(p=>p.startsWith('xn--')))add(3,'มี Punycode ซึ่งอาจเป็นอักขระที่หน้าตาคล้ายกัน');
if(/[^\x00-\x7f]/.test(decodeURIComponent(raw.split('?')[0])))add(2,'มีอักขระ Unicode นอก ASCII');
if(SHORT.includes(h))add(2,'เป็นลิงก์ย่อ ปลายทางจริงถูกซ่อนอยู่');
if(h.split('.').length>4)add(1,'มี Subdomain จำนวนมากผิดปกติ');
if(/\.(zip|mov|top|xyz|click|work|country|gq|tk|ml)$/.test(h))add(1,'นามสกุลโดเมนที่พบบ่อยในลิงก์หลอกลวง');
const root=h.split('.').slice(-2).join('.');BRANDS.forEach(b=>{if(h.includes(b)&&!(root.startsWith(b+'.')))add(3,'ชื่อโดเมนมีคำว่า "'+b+'" แต่โดเมนหลักไม่ใช่ของแบรนด์นั้น')});
if(h.includes('-')&&(h.match(/-/g)||[]).length>2)add(1,'โดเมนมีขีดจำนวนมาก');
const lv=s>=4?'HIGH':s>=2?'MEDIUM':'LOW';
o.innerHTML=`<p><span class="pill ${lv}">${riskLabel(lv)}</span></p><div class="sub">โดเมน: <b>${esc(h)}</b></div>`+(r.length?'<ul class="r">'+r.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'<p class="sub">ไม่พบสัญญาณเสี่ยงตามกฎพื้นฐาน</p>')+'<p class="note">นี่เป็นเพียงการประเมินเบื้องต้นจากรูปแบบของ URL ไม่ได้ยืนยันว่าเว็บไซต์ปลอดภัย โปรดระวังเสมอ</p>'};
/* JWT */
function b64u(s){s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return dec.decode(unb64(s))}
$('jGo').onclick=()=>{const o=$('jOut'),t=$('jIn').value.trim().replace(/^Bearer\s+/i,'');const p=t.split('.');if(p.length!==3){o.innerHTML='<p class="note">โครงสร้างไม่ถูกต้อง JWT ต้องมี 3 ส่วนคั่นด้วยจุด</p>';return}
try{const H=JSON.parse(b64u(p[0])),P=JSON.parse(b64u(p[1]));const now=Date.now()/1000;const d=v=>typeof v==='number'?new Date(v*1000).toLocaleString('th-TH'):null;let st='';if(typeof P.exp==='number'){st=P.exp<now?'<span class="pill bad">หมดอายุแล้ว</span>':'<span class="pill good">ยังไม่หมดอายุตามเวลาเครื่อง</span>'}else st='<span class="pill mid">ไม่มี exp</span>';
const times=['iat','nbf','exp'].filter(k=>typeof P[k]==='number').map(k=>`<li>${k}: ${esc(d(P[k]))}</li>`).join('');
o.innerHTML=`<p>${st}${H.alg==='none'?' <span class="pill bad">alg: none</span>':''}</p>${times?'<ul class="r">'+times+'</ul>':''}<label>Header</label><div class="out">${esc(JSON.stringify(H,null,2))}</div><label>Payload</label><div class="out">${esc(JSON.stringify(P,null,2))}</div><p class="note">ลายเซ็นยังไม่ได้รับการตรวจสอบ</p>`}catch(e){o.innerHTML='<p class="note">ถอดรหัสไม่ได้: Header หรือ Payload ไม่ใช่ JSON ที่ถูกต้อง</p>'}};
/* Headers */
$('xGo').onclick=()=>{const txt=$('xIn').value;const o=$('xOut');if(!txt.trim()){o.innerHTML='<p class="note">วาง Headers ก่อน</p>';return}const H={},C=[];txt.split(/\r?\n/).forEach(l=>{const i=l.indexOf(':');if(i<1)return;const k=l.slice(0,i).trim().toLowerCase(),v=l.slice(i+1).trim();if(k==='set-cookie')C.push(v);else H[k]=v});
const res=[];const chk=(k,name,ok,fix,warn)=>{const v=H[k];res.push(!v?['bad',name,'ยังไม่ได้ตั้งค่า',fix]:warn&&warn(v)?['mid',name,warn(v),fix]:['good',name,'ตั้งค่าแล้ว','']) };
chk('content-security-policy','Content-Security-Policy',0,"Content-Security-Policy: default-src 'self'; object-src 'none'; frame-ancestors 'none'",v=>/unsafe-inline|unsafe-eval|\*\s|default-src\s+\*/.test(v)?'มีค่าที่ผ่อนปรน (unsafe-inline, unsafe-eval หรือ *)':'');
chk('strict-transport-security','Strict-Transport-Security',0,'Strict-Transport-Security: max-age=31536000; includeSubDomains',v=>{const m=/max-age=(\d+)/i.exec(v);return!m||+m[1]<15552000?'max-age สั้นกว่า 180 วัน':''});
chk('x-content-type-options','X-Content-Type-Options',0,'X-Content-Type-Options: nosniff',v=>/nosniff/i.test(v)?'':'ค่าควรเป็น nosniff');
chk('x-frame-options','X-Frame-Options',0,'X-Frame-Options: DENY (หรือใช้ frame-ancestors ใน CSP)',v=>/deny|sameorigin/i.test(v)?'':'ค่าควรเป็น DENY หรือ SAMEORIGIN');
chk('referrer-policy','Referrer-Policy',0,'Referrer-Policy: strict-origin-when-cross-origin',v=>/unsafe-url|no-referrer-when-downgrade/i.test(v)?'ค่านี้ส่ง URL เต็มออกไปมากเกินไป':'');
chk('permissions-policy','Permissions-Policy',0,'Permissions-Policy: camera=(), microphone=(), geolocation=()');
let html=res.map(x=>`<div class="card"><span class="pill ${x[0]}">${x[0]==='good'?'ผ่าน':x[0]==='mid'?'ควรปรับ':'ขาด'}</span> <b>${x[1]}</b><div class="sub" style="margin:4px 0 0">${esc(x[2])}</div>${x[3]?'<div class="out">'+esc(x[3])+'</div>':''}</div>`).join('');
if(C.length)html+=C.map(c=>{const miss=[];if(!/;\s*secure/i.test(c))miss.push('Secure');if(!/;\s*httponly/i.test(c))miss.push('HttpOnly');if(!/;\s*samesite=(lax|strict|none)/i.test(c))miss.push('SameSite');return `<div class="card"><span class="pill ${miss.length?'mid':'good'}">${miss.length?'ควรปรับ':'ผ่าน'}</span> <b>Cookie: ${esc(c.split('=')[0])}</b><div class="sub" style="margin:4px 0 0">${miss.length?'ขาด: '+miss.join(', '):'มี Secure, HttpOnly และ SameSite'}</div></div>`}).join('');else html+='<p class="sub">ไม่พบ Set-Cookie ในข้อมูลที่วาง</p>';
o.innerHTML=html};
/* Dev */
const dev={b64e:s=>b64(enc.encode(s)),b64d:s=>dec.decode(unb64(s)),ue:encodeURIComponent,ud:decodeURIComponent,he:esc,hd:s=>{const t=document.createElement('textarea');t.innerHTML=s;return t.value},js:s=>JSON.stringify(JSON.parse(s),null,2),
ts:s=>{s=s.trim();if(!s)return new Date().toISOString()+'\nunix: '+Math.floor(Date.now()/1000);if(/^-?\d+$/.test(s)){const n=+s,d=new Date(Math.abs(n)>1e11?n:n*1000);if(isNaN(d))throw new Error('เวลาไม่ถูกต้อง');return d.toISOString()+'\nท้องถิ่น: '+d.toLocaleString('th-TH')}const d=new Date(s);if(isNaN(d))throw new Error('รูปแบบวันที่ไม่ถูกต้อง');return 'unix: '+Math.floor(d/1000)+'\nISO: '+d.toISOString()},
col:s=>{s=s.trim();let r,g,b;const m=/^#?([0-9a-f]{6})$/i.exec(s);if(m){const n=parseInt(m[1],16);r=n>>16;g=n>>8&255;b=n&255}else{const p=s.split(/[\s,]+/).map(Number);if(p.length!==3||p.some(x=>!(x>=0&&x<=255)))throw new Error('ใส่ #RRGGBB หรือ R,G,B (0-255)');[r,g,b]=p}const mx=Math.max(r,g,b)/255,mn=Math.min(r,g,b)/255,l=(mx+mn)/2,d=mx-mn;let h=0,sa=0;if(d){sa=d/(1-Math.abs(2*l-1));const R=r/255,G=g/255,B=b/255;h=mx===R?((G-B)/d)%6:mx===G?(B-R)/d+2:(R-G)/d+4;h=Math.round((h*60+360)%360)}return '#'+[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('')+`\nrgb(${r}, ${g}, ${b})\nhsl(${h}, ${Math.round(sa*100)}%, ${Math.round(l*100)}%)`},diff:()=>{const a=$('dIn').value.split('\n'),b=$('dIn2').value.split('\n'),o=[];for(let i=0;i<Math.max(a.length,b.length);i++){if(a[i]===b[i])o.push('  '+a[i]);else{if(a[i]!==undefined)o.push('- '+a[i]);if(b[i]!==undefined)o.push('+ '+b[i])}}return o.join('\n')},uuid:()=>crypto.randomUUID(),tok:()=>b64(crypto.getRandomValues(new Uint8Array(32))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'')};
document.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{try{$('dOut').textContent=dev[b.dataset.d]($('dIn').value)}catch(e){err($('dOut'),e.message||'แปลงไม่ได้')}});
$('xsI').value='<img src=x onerror=alert(1)>';
$('sqGo').onclick=()=>{const u=$('sqU').value,p=$('sqP').value,safe=$('sqSafe').checked,o=$('sqOut');
let q,ok;if(safe){q="SELECT * FROM users WHERE name = ? AND pass = ?\nparams: ["+JSON.stringify(u)+", "+JSON.stringify(p)+"]";ok=u==='admin'&&p==='S3cret!'}
else{q="SELECT * FROM users WHERE name = '"+u+"' AND pass = '"+p+"'";ok=(u==='admin'&&p==='S3cret!')||/'\s*(--|#)/.test(u)||/'\s*or\s+'?(\w+)'?\s*=\s*'?\1/i.test(u+p)}
const inj=!safe&&ok&&!(u==='admin'&&p==='S3cret!');
o.innerHTML='<div class="out">'+esc(q)+'</div><p><span class="pill '+(ok?'bad':'good')+'">'+(inj?'ถูกเจาะ: เข้าสู่ระบบโดยไม่รู้รหัสผ่าน':ok?'ล็อกอินสำเร็จ (ข้อมูลถูกต้อง)':'ล็อกอินไม่สำเร็จ')+'</span></p><p class="sub">'+(inj?'ข้อมูลที่ผู้ใช้ใส่ถูกต่อเข้าไปในคำสั่ง SQL จึงเปลี่ยนความหมายของคำสั่ง เครื่องหมาย -- ทำให้เงื่อนไขรหัสผ่านถูกตัดทิ้ง วิธีป้องกัน: ใช้ Parameterized Query เสมอ ตรวจสอบ Input และให้สิทธิ์ฐานข้อมูลน้อยที่สุด':'ในโหมดปลอดภัย ข้อมูลถูกส่งแยกจากคำสั่ง จึงถูกมองเป็นค่าธรรมดา ไม่เปลี่ยนโครงสร้างคำสั่ง')+'</p>'};
$('xsGo').onclick=()=>{const v=$('xsI').value,safe=$('xsSafe').checked,o=$('xsOut');const html=safe?esc(v):v;const risky=!safe&&(/<\s*script/i.test(v)||/<[^>]+\son\w+\s*=/i.test(v)||/javascript:/i.test(v));
o.innerHTML='<label>HTML ที่หน้าเว็บจะได้รับ</label><div class="out">'+esc(html)+'</div><p><span class="pill '+(risky?'bad':'good')+'">'+(risky?'โค้ดนี้จะถูกรันในเบราว์เซอร์ผู้ใช้':'ปลอดภัย: แสดงเป็นข้อความธรรมดา')+'</span></p><p class="sub">'+(risky?'แอปนำข้อมูลของผู้ใช้ไปใส่ในหน้าเว็บโดยไม่เข้ารหัส เบราว์เซอร์จึงตีความเป็นโค้ด ผู้โจมตีอาจขโมย Session หรือแก้หน้าเว็บ วิธีป้องกัน: Output Encoding, ใช้ textContent แทน innerHTML และตั้ง Content-Security-Policy':'อักขระพิเศษถูกแปลงเป็น Entity เบราว์เซอร์จึงไม่ตีความเป็นโค้ด')+'</p>'};
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').then(r=>r.addEventListener('updatefound',()=>toast('มีเวอร์ชันใหม่ รีโหลดเพื่ออัปเดต'))).catch(()=>{}));
const k0=location.hash.slice(1);if(tabs.some(t=>t[0]===k0))go(k0);else go('home');
