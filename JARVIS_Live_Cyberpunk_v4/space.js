/* Lightweight full-screen star field and shooting-particle layer. */
const COLORS=['#62d7ff','#4b9dff','#4effb3','#ff6588','#d7efff'];
const NEBULA_COLORS=['26,132,255','44,239,180','255,76,130','110,114,255'];
const between=(min,max)=>min+Math.random()*(max-min);

export class SpaceField {
  constructor(canvas){
    this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:true});this.enabled=true;this.w=0;this.h=0;this.time=0;this.last=0;this.raf=0;this.dust=[];this.stars=[];this.nebulas=[];this.shooters=[];this.nextShooter=.06;
    this.resize=this.resize.bind(this);this.frame=this.frame.bind(this);
    this.observer=new ResizeObserver(this.resize);this.observer.observe(canvas);this.resize();this.raf=requestAnimationFrame(this.frame);
  }
  resize(){const box=this.canvas.getBoundingClientRect();this.w=box.width;this.h=box.height;const d=Math.min(devicePixelRatio||1,1.5);this.canvas.width=Math.max(1,Math.round(this.w*d));this.canvas.height=Math.max(1,Math.round(this.h*d));this.ctx.setTransform(d,0,0,d,0,0);const count=Math.max(170,Math.min(300,Math.round(this.w*this.h/3500))),dustCount=1000;this.linkDistance=Math.max(82,Math.min(122,Math.sqrt(this.w*this.h)/8));this.dust=Array.from({length:dustCount},()=>this.dustParticle());this.stars=Array.from({length:count},()=>this.star());this.nebulas=Array.from({length:4},()=>this.nebula());}
  dustParticle(){return {x:Math.random()*this.w,y:Math.random()*this.h,r:between(.65,1.45),a:between(.52,.96),vx:between(-6.6,6.6),vy:between(-4.8,4.8),phase:Math.random()*Math.PI*2,color:Math.random()<.55?'#e8f9ff':COLORS[Math.floor(Math.random()*COLORS.length)]};}
  star(){return {x:Math.random()*this.w,y:Math.random()*this.h,r:between(.3,1.75),a:between(.18,.95),speed:between(.7,2.8),phase:Math.random()*Math.PI*2,vx:between(-11,11),vy:between(-9,9),color:COLORS[Math.floor(Math.random()*COLORS.length)]};}
  nebula(){return {x:between(this.w*.05,this.w*.95),y:between(this.h*.04,this.h*.88),r:between(Math.max(180,this.w*.19),Math.max(330,this.w*.38)),a:between(.07,.14),speed:between(.05,.14),phase:Math.random()*Math.PI*2,color:NEBULA_COLORS[Math.floor(Math.random()*NEBULA_COLORS.length)]};}
  addShooter(){const leftToRight=Math.random()>.5;this.shooters.push({x:leftToRight?between(-55,this.w*.3):between(this.w*.7,this.w+55),y:between(0,this.h*.78),vx:leftToRight?between(330,560):between(-560,-330),vy:between(135,290),length:between(95,190),life:0,max:between(.85,1.45),color:COLORS[Math.floor(Math.random()*COLORS.length)]});}
  setEnabled(value){this.enabled=!!value;if(!this.enabled)this.ctx.clearRect(0,0,this.w,this.h);}
  destroy(){cancelAnimationFrame(this.raf);this.observer.disconnect();}
  frame(ms){const dt=this.last?Math.min((ms-this.last)/1000,.05):.017;this.last=ms;if(this.enabled&&this.w&&this.h){this.time+=dt;this.draw(dt);}this.raf=requestAnimationFrame(this.frame);}
  draw(dt){const c=this.ctx;c.clearRect(0,0,this.w,this.h);
    for(const n of this.nebulas){const drift=Math.sin(this.time*n.speed+n.phase),g=c.createRadialGradient(n.x+drift*22,n.y+drift*12,0,n.x+drift*22,n.y+drift*12,n.r);g.addColorStop(0,`rgba(${n.color},${n.a})`);g.addColorStop(.42,`rgba(${n.color},${n.a*.28})`);g.addColorStop(1,'rgba(0,0,0,0)');c.globalAlpha=1;c.fillStyle=g;c.fillRect(n.x-n.r,n.y-n.r,n.r*2,n.r*2);}
    for(const dust of this.dust){dust.x+=dust.vx*dt;dust.y+=dust.vy*dt;if(dust.x<-2)dust.x=this.w+2;else if(dust.x>this.w+2)dust.x=-2;if(dust.y<-2)dust.y=this.h+2;else if(dust.y>this.h+2)dust.y=-2;c.fillStyle=dust.color;c.globalAlpha=dust.a*(.62+.38*Math.sin(this.time*2+dust.phase));c.fillRect(dust.x,dust.y,dust.r,dust.r);}
    for(const star of this.stars){star.x+=star.vx*dt;star.y+=star.vy*dt;if(star.x<-8)star.x=this.w+8;else if(star.x>this.w+8)star.x=-8;if(star.y<-8)star.y=this.h+8;else if(star.y>this.h+8)star.y=-8;}
    const link=this.linkDistance,linkSq=link*link;c.globalAlpha=1;c.strokeStyle='rgba(65,171,255,.11)';c.lineWidth=.5;c.beginPath();for(let i=0;i<this.stars.length;i++){const a=this.stars[i];for(let j=i+1;j<this.stars.length;j++){const b=this.stars[j],dx=a.x-b.x,dy=a.y-b.y;if(dx*dx+dy*dy<linkSq){c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);}}}c.stroke();
    for(const star of this.stars){const alpha=star.a*(.53+.47*Math.sin(this.time*star.speed+star.phase));c.fillStyle=star.color;c.globalAlpha=alpha;c.beginPath();c.arc(star.x,star.y,star.r,0,Math.PI*2);c.fill();if(star.r>1.08&&alpha>.38){c.globalAlpha=alpha*.2;c.fillStyle=star.color;c.beginPath();c.arc(star.x,star.y,star.r*3.6,0,Math.PI*2);c.fill();}}
    this.nextShooter-=dt;if(this.nextShooter<=0){this.addShooter();this.addShooter();this.nextShooter=between(.18,.38);}
    this.shooters=this.shooters.filter(s=>{s.life+=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;return s.life<s.max&&s.x>-180&&s.x<this.w+180&&s.y<this.h+180;});
    for(const s of this.shooters){const p=s.life/s.max,fade=Math.sin(Math.min(1,p)*Math.PI),len=s.length,angle=Math.atan2(s.vy,s.vx),tailX=s.x-Math.cos(angle)*len,tailY=s.y-Math.sin(angle)*len;const g=c.createLinearGradient(tailX,tailY,s.x,s.y);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.72,s.color);g.addColorStop(1,'#ffffff');c.globalAlpha=fade*.95;c.strokeStyle=g;c.lineWidth=between(1.2,2);c.beginPath();c.moveTo(tailX,tailY);c.lineTo(s.x,s.y);c.stroke();c.globalAlpha=fade;c.fillStyle='#ffffff';c.beginPath();c.arc(s.x,s.y,1.55,0,Math.PI*2);c.fill();}
    c.globalAlpha=1;
  }
}
