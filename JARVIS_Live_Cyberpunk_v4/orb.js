/* JARVIS LIVE CORE v4
   Original dependency-free perspective-projected 3D engine.
   Real pointer/touch drag with momentum, independent orbital rotations,
   animated scanner, activity states, atmospheric particles and neon lighting.
*/
const TAU = Math.PI * 2;
const clamp = (n,lo,hi)=>Math.max(lo,Math.min(hi,n));
const random = (i,s=1)=>{const x=Math.sin(i*127.1+s*311.7)*43758.5453;return x-Math.floor(x)};
const rgb=(a,alpha)=>`rgba(${a[0]},${a[1]},${a[2]},${alpha})`;
const BLUE=[48,178,255], CYAN=[70,237,255], GREEN=[53,255,161], RED=[255,76,103];
function rotate3(v,xRot,yRot,zRot){
  let [x,y,z]=v;
  let c=Math.cos(xRot),s=Math.sin(xRot); [y,z]=[y*c-z*s,y*s+z*c];
  c=Math.cos(yRot);s=Math.sin(yRot);[x,z]=[x*c+z*s,-x*s+z*c];
  c=Math.cos(zRot);s=Math.sin(zRot);[x,y]=[x*c-y*s,x*s+y*c];
  return [x,y,z];
}
export class OrbEngine {
  constructor(canvas,{voice=false}={}) {
    this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:true});
    if(!this.ctx)return;
    this.voice=voice;this.mode='idle';this.enabled=true;this.dragging=false;this.dragDistance=0;
    this.pitch=.16;this.yaw=.05;this.roll=0;this.velocityX=.18;this.velocityY=.08;this.boosted=false;
    this.lastPointer=null;this.last=0;this.time=0;this.w=0;this.h=0;this.raf=0;
    // Keep the scene light enough for a stable 60 FPS while retaining a dense field.
    this.sparks=Array.from({length:72},(_,i)=>({x:random(i,2)*2-1,y:random(i,4)*2-1,a:random(i,6)*TAU,s:.24+random(i,8)*.85,r:.35+random(i,10)*.8}));
    this.rings=[
      {r:1.55,tilt:[.31,.17,.18],speed:.30,color:BLUE,size:2.05,offset:0},
      {r:1.33,tilt:[1.08,.19,-.76],speed:-.25,color:CYAN,size:1.2,offset:.8},
      {r:1.20,tilt:[.65,1.2,.72],speed:.21,color:GREEN,size:1.48,offset:1.5},
      {r:1.62,tilt:[1.38,-.19,.36],speed:-.16,color:BLUE,size:.85,offset:2.2},
      {r:1.44,tilt:[.11,1.4,-.30],speed:.12,color:RED,size:.9,offset:3.1},
      {r:1.71,tilt:[.82,-.48,1.14],speed:.10,color:CYAN,size:.70,offset:3.7},
      {r:1.06,tilt:[1.54,.63,-.12],speed:-.18,color:GREEN,size:.76,offset:4.4},
      {r:1.52,tilt:[-.27,1.11,.93],speed:.15,color:BLUE,size:.64,offset:5.2}
    ];
    this.points=[];
    this.latitudes=16;this.longitudes=30;
    for(let i=0;i<=this.latitudes;i++){const th=(i+.3)*Math.PI/this.latitudes;for(let j=0;j<this.longitudes;j++){
      const ph=j*TAU/this.longitudes;this.points.push([Math.sin(th)*Math.cos(ph),Math.cos(th),Math.sin(th)*Math.sin(ph)])
    }}
    canvas.style.touchAction='none';
    canvas.style.cursor='grab';
    this.onDown=this.pointerDown.bind(this);this.onMove=this.pointerMove.bind(this);this.onUp=this.pointerUp.bind(this);
    canvas.addEventListener('pointerdown',this.onDown);
    canvas.addEventListener('pointermove',this.onMove);
    canvas.addEventListener('pointerup',this.onUp);
    canvas.addEventListener('pointercancel',this.onUp);
    this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(canvas);this.resize();
    this.frame=this.frame.bind(this);this.raf=requestAnimationFrame(this.frame);
  }
  resize(){const b=this.canvas.getBoundingClientRect();if(!b.width||!b.height)return;this.w=b.width;this.h=b.height;
    const d=Math.min(devicePixelRatio||1,1.65);this.canvas.width=Math.round(b.width*d);this.canvas.height=Math.round(b.height*d);this.ctx.setTransform(d,0,0,d,0,0)}
  pointerDown(e){if(!this.enabled)return;this.dragging=true;this.dragDistance=0;this.velocityX=0;this.velocityY=0;
    this.lastPointer={x:e.clientX,y:e.clientY,time:performance.now()};this.canvas.style.cursor='grabbing';
    this.canvas.setPointerCapture?.(e.pointerId);}
  pointerMove(e){if(!this.dragging||!this.lastPointer)return;const now=performance.now(),dt=Math.max(12,now-this.lastPointer.time);
    let dx=e.clientX-this.lastPointer.x,dy=e.clientY-this.lastPointer.y;
    const scale=3.8/Math.max(160,Math.min(this.w,this.h));
    this.yaw+=dx*scale;this.pitch=clamp(this.pitch+dy*scale,-1.48,1.48);this.dragDistance+=Math.abs(dx)+Math.abs(dy);
    this.velocityX=clamp(dx*scale/(dt/1000),-8,8);this.velocityY=clamp(dy*scale/(dt/1000),-8,8);
    this.lastPointer={x:e.clientX,y:e.clientY,time:now};}
  pointerUp(e){if(!this.dragging)return;this.dragging=false;this.canvas.style.cursor='grab';
    try{this.canvas.releasePointerCapture?.(e.pointerId)}catch{}this.lastPointer=null;
    if(this.dragDistance<4){this.velocityX+=1.5;this.velocityY+=.2;}}
  spin(){this.boosted=true;this.velocityX=.25;this.velocityY=.04;}
  reset(){this.boosted=false;this.pitch=.16;this.yaw=0;this.velocityX=.18;this.velocityY=.08;}
  setEnabled(v){this.enabled=!!v;if(!v)this.draw()}
  setMode(m){this.mode=m}
  destroy(){cancelAnimationFrame(this.raf);this.observer.disconnect();const c=this.canvas;c.removeEventListener('pointerdown',this.onDown);c.removeEventListener('pointermove',this.onMove);c.removeEventListener('pointerup',this.onUp);c.removeEventListener('pointercancel',this.onUp)}
  frame(ms){const dt=this.last?Math.min((ms-this.last)/1000,.033):.017;this.last=ms;
    if(this.enabled&&this.w&&this.h){this.time+=dt;
      if(!this.dragging){this.yaw+=dt*((this.boosted?3.15:1.55)+this.velocityX);this.pitch=clamp(this.pitch+dt*this.velocityY,-1.48,1.48);const damp=Math.exp(-dt*1.65);this.velocityX*=damp;this.velocityY*=damp;}
      this.draw();}
    this.raf=requestAnimationFrame(this.frame)}
  draw(){const ctx=this.ctx,w=this.w,h=this.h;if(!w||!h)return;
    const t=this.time,cx=w*.5,cy=h*.51,u=Math.min(w*.244,h*.51),rotX=this.pitch+.06*Math.sin(t*.28),rotY=this.yaw;
    const busy=this.mode!=='idle', listening=this.mode==='listening', speaking=this.mode==='speaking', thinking=this.mode==='thinking';
    ctx.clearRect(0,0,w,h);
    const project=(p,scale=1)=>{const zz=3.65-p[2],f=3.65/zz;return [cx+p[0]*u*scale*f,cy+p[1]*u*scale*f,p[2],f]};
    const radial=(x,y,r,stops,alpha=1)=>{ctx.save();ctx.globalAlpha=alpha;const g=ctx.createRadialGradient(x,y,0,x,y,r);for(const [stop,c] of stops)g.addColorStop(stop,c);ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.restore()};
    // Atmospheric halo, moving signal noise, low-cost twinkling particles
    radial(cx,cy,u*2.12,[[0,'rgba(17,87,212,.16)'],[.55,'rgba(6,68,126,.08)'],[1,'rgba(0,0,0,0)']]);
    radial(cx,cy,u*1.25,[[0,'rgba(24,169,255,.16)'],[1,'rgba(0,0,0,0)']]);
    for(let i=0;i<this.sparks.length;i++){const s=this.sparks[i],xx=cx+s.x*u*2.13+Math.sin(t*.3+s.a)*4,yy=cy+s.y*u*1.8+Math.cos(t*.22+s.a)*4;
      if(Math.abs(s.x)<.26&&Math.abs(s.y)<.27)continue;
      const a=s.s*(.20+.55*(.5+.5*Math.sin(t*.9+s.a)));
      ctx.fillStyle=rgb(i%19===0?RED:i%5===0?GREEN:CYAN,a*.6);ctx.beginPath();ctx.arc(xx,yy,s.r,0,TAU);ctx.fill();}
    // Orbital mechanics: independent ring planes and phase-shifted rotation. Near surfaces brighter than far surfaces.
    for(let k=0;k<this.rings.length;k++){
      const ring=this.rings[k],N=104,pts=[];
      const aX=ring.tilt[0]+t*ring.speed*.23+rotX*.53;
      const aY=ring.tilt[1]+t*ring.speed+rotY*.52;
      const aZ=ring.tilt[2]+Math.sin(t*.12+k)*.10;
      for(let i=0;i<=N;i++){const a=i/N*TAU,p=rotate3([Math.cos(a)*ring.r,Math.sin(a)*ring.r,0],aX,aY,aZ);pts.push(project(p));}
      // Downsampled soft blue aura segments, then crisp colored filaments
      ctx.lineCap='round';
      for(let i=1;i<=N;i++){const p=pts[i-1],q=pts[i],z=(p[2]+q[2])*.5,depth=clamp((z+1.8)/3.6,0,1);
        const pulse=.72+.28*Math.sin(t*2+i*.026+ring.offset);
        ctx.strokeStyle=rgb(ring.color,(.14+depth*.48)*pulse);ctx.lineWidth=ring.size*(.6+depth*.8);ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.stroke();
        if(i%7===0&&depth>.49){ctx.strokeStyle=rgb(ring.color,.045+.11*depth);ctx.lineWidth=6*ring.size;ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.stroke();}
      }
      const a=(t*(.075+.015*k)+ring.offset/TAU)%1,idx=Math.floor(a*(N-1)),p=pts[idx];
      radial(p[0],p[1],11,[[0,rgb(ring.color,.72)],[.3,rgb(ring.color,.20)],[1,'rgba(0,0,0,0)']]);
      ctx.fillStyle=rgb(ring.color,.97);ctx.beginPath();ctx.arc(p[0],p[1],2.2+(k%3===0),0,TAU);ctx.fill();
      // moving glowing streak following the active satellite
      for(let j=0;j<13;j++){const pp=pts[(idx-j+N)%N],qq=pts[(idx-j-1+N)%N];ctx.strokeStyle=rgb(ring.color,(1-j/14)*.9);ctx.lineWidth=ring.size*(1.2-j/16);ctx.beginPath();ctx.moveTo(pp[0],pp[1]);ctx.lineTo(qq[0],qq[1]);ctx.stroke();}
    }
    // Glass shield/sphere with Azure/Cyan lighting
    // A clear but smooth double pulse: the core expands, flashes and settles like a heartbeat.
    const phase=(t%1.35)/1.35;
    const heartbeat=.009*(.68+.32*Math.sin(t*7.1))+.027*Math.exp(-Math.pow((phase-.16)/.085,2))+.016*Math.exp(-Math.pow((phase-.34)/.070,2));
    const heartbeatPower=Math.min(1,heartbeat/.035);
    const breathing=1+heartbeat+(speaking?.006*Math.sin(t*10):0);
    const R=u*.74*breathing;
    radial(cx,cy,R*(1.75+heartbeatPower*.18),[[0,`rgba(25,144,255,${.33+heartbeatPower*.16})`],[.55,`rgba(0,144,239,${.09+heartbeatPower*.08})`],[1,'rgba(0,0,0,0)']]);
    const skin=ctx.createRadialGradient(cx-R*.25,cy-R*.29,R*.045,cx,cy,R*1.06);
    skin.addColorStop(0,'rgba(211,252,255,.99)');skin.addColorStop(.12,'rgba(49,214,255,.96)');skin.addColorStop(.36,'rgba(21,117,255,.92)');skin.addColorStop(.7,'rgba(8,42,126,.95)');skin.addColorStop(1,'rgba(4,13,44,.99)');
    ctx.fillStyle=skin;ctx.beginPath();ctx.arc(cx,cy,R,0,TAU);ctx.fill();
    ctx.save();ctx.beginPath();ctx.arc(cx,cy,R-1,0,TAU);ctx.clip();
    radial(cx-R*.18,cy-R*.17,R*.88,[[0,'rgba(158,249,255,.55)'],[.3,'rgba(58,196,255,.20)'],[1,'rgba(0,0,0,0)']]);
    const points=this.points.map(p=>project(rotate3(p,rotX+.08*Math.sin(t*.17),rotY+t*.08,t*.024),.74*breathing));
    // latitude/longitude graticule deforms with drag orientation
    for(let i=0;i<=this.latitudes;i++){for(let j=0;j<this.longitudes;j++){
      const idx=i*this.longitudes+j,p=points[idx],q=points[i*this.longitudes+(j+1)%this.longitudes],z=(p[2]+q[2])*.5;
      const a=z>0?.13+z*.33:.055;ctx.strokeStyle=rgb(j%8===0?GREEN:CYAN,clamp(a,.05,.55));ctx.lineWidth=j%8===0?.85:.6;
      ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.stroke();
      if(i<this.latitudes){const n=points[(i+1)*this.longitudes+j],zn=(p[2]+n[2])*.5;ctx.strokeStyle=rgb((i+j)%16===0?GREEN:BLUE,clamp(zn>0?.14+zn*.3:.05,.05,.45));ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(n[0],n[1]);ctx.stroke();}
    }}
    for(let k=0;k<8;k++){
      const a=t*.4+k*TAU/8,start=project(rotate3([Math.cos(a)*.64,Math.sin(a)*.38,.48],rotX,rotY,0),.74);
      const end=project(rotate3([Math.cos(a+1.8)*.64,Math.sin(a+1.8)*.38,.45],rotX,rotY,0),.74);
      ctx.strokeStyle=rgb(k%3===0?GREEN:CYAN,.12+.08*Math.sin(t*2+k));ctx.lineWidth=.95;ctx.beginPath();ctx.moveTo(start[0],start[1]);ctx.quadraticCurveTo(cx+Math.sin(t*.7+k)*R*.5,cy+Math.cos(t+k)*R*.32,end[0],end[1]);ctx.stroke();
    }
    ctx.restore();
    ctx.strokeStyle='rgba(111,225,255,.70)';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(cx,cy,R,0,TAU);ctx.stroke();
    if(heartbeatPower>.02){ctx.strokeStyle=rgb(CYAN,.08+heartbeatPower*.42);ctx.lineWidth=1+heartbeatPower*1.7;ctx.beginPath();ctx.arc(cx,cy,R*(1.045+heartbeatPower*.05),0,TAU);ctx.stroke();}
    radial(cx-R*.20,cy-R*.14,R*.48,[[0,'rgba(229,255,255,.31)'],[1,'rgba(0,0,0,0)']]);
    // Rotating machinery, scanners, ring data, red/green energy flashes
    for(let j=0;j<110;j++){
      const a=j/110*TAU+t*.052,r=u*.975,inner=r-(j%10===0?u*.06:j%5===0?u*.036:u*.012);
      ctx.strokeStyle=rgb(j%25===0?RED:j%7===0?GREEN:BLUE,j%10===0?.54:.16);ctx.lineWidth=j%10===0?1.4:.7;
      ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*inner,cy+Math.sin(a)*inner);ctx.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);ctx.stroke();
    }
    for(let j=0;j<3;j++){
      const a=t*(j%2===0?.44:-.28)+j*2.1,rr=u*(1.03+j*.08);
      ctx.strokeStyle=rgb(j===2?GREEN:j===1?RED:CYAN,j===1?.58:.78);ctx.lineWidth=j===0?2.2:1.1;
      ctx.beginPath();ctx.arc(cx,cy,rr,a,a+.37+j*.1);ctx.stroke();
    }
    if(busy){const power=.55+.45*Math.sin(t*(listening?8:thinking?3:12));ctx.strokeStyle=rgb(speaking?RED:listening?GREEN:CYAN,.24+power*.48);ctx.lineWidth=1.7;ctx.beginPath();ctx.arc(cx,cy,u*(1.07+.035*power),0,TAU);ctx.stroke();}
    // State signals and touch interaction underlay
    const ledColor=this.dragging?GREEN:BLUE;
    ctx.strokeStyle=rgb(ledColor,.18);ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(cx-u*1.8,cy);ctx.lineTo(cx-u*1.57,cy);ctx.moveTo(cx+u*1.57,cy);ctx.lineTo(cx+u*1.8,cy);ctx.stroke();
  }
}
