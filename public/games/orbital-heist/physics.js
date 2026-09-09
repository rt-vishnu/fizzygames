/* Fixed-step gravity, swept collisions, and authored flight contracts. */
(function(root){
"use strict";
const W=960,H=600,DT=1/120;
const layouts=[
 {name:"The quiet approach",start:[85,340],bodies:[[470,185,36,430000]],angle:-3,power:185,duration:3.85},
 {name:"Borrowed momentum",start:[90,430],bodies:[[480,270,43,650000]],angle:-5,power:165,duration:4.05},
 {name:"Between two suns",start:[75,290],bodies:[[390,125,34,400000],[590,460,42,530000]],angle:5,power:175,duration:4.0},
 {name:"The sentry's blind spot",start:[90,450],bodies:[[460,285,42,610000]],angle:-4,power:175,duration:3.9,lasers:1},
 {name:"A delicate imbalance",start:[80,220],bodies:[[350,390,38,410000],[610,160,35,380000]],angle:9,power:170,duration:4.1,lasers:1},
 {name:"The long slingshot",start:[85,470],bodies:[[470,290,49,760000]],angle:-7,power:160,duration:4.15,lasers:2},
 {name:"Binary shadows",start:[70,300],bodies:[[380,130,36,470000],[610,460,44,570000]],angle:3,power:180,duration:4.0,lasers:2},
 {name:"Ghosts in the belt",start:[70,440],bodies:[[310,220,34,350000],[630,170,44,510000]],angle:-8,power:185,duration:3.75,lasers:2},
 {name:"The crown's gravity",start:[80,150],bodies:[[450,330,48,720000]],angle:7,power:165,duration:4.05,lasers:2},
 {name:"Three-body problem",start:[65,300],bodies:[[295,110,30,320000],[520,485,37,410000],[755,120,28,280000]],angle:3,power:190,duration:3.9,lasers:2},
 {name:"The final perimeter",start:[70,450],bodies:[[390,230,41,530000],[695,450,32,260000]],angle:-5,power:185,duration:3.8,lasers:3},
 {name:"Steal a star",start:[70,160],bodies:[[360,350,41,500000],[670,130,35,360000]],angle:7,power:180,duration:3.9,lasers:3}
];
function probe(m,angle,power){const a=angle*Math.PI/180;return{x:m.start[0],y:m.start[1],vx:Math.cos(a)*power,vy:Math.sin(a)*power,t:0,fuel:5,invert:0};}
function advance(p,m,dt,thrust={x:0,y:0}){let ax=0,ay=0;for(const b of m.bodies){const dx=b[0]-p.x,dy=b[1]-p.y,d2=Math.max(400,dx*dx+dy*dy),f=b[3]/(d2*Math.sqrt(d2))*(p.invert>0?-1:1);ax+=dx*f;ay+=dy*f;}const len=Math.hypot(thrust.x,thrust.y);if(len&&p.fuel>0){const fraction=Math.min(1,p.fuel/dt);ax+=thrust.x/len*65*fraction;ay+=thrust.y/len*65*fraction;p.fuel=Math.max(0,p.fuel-dt);}p.vx+=ax*dt;p.vy+=ay*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.t+=dt;p.invert=Math.max(0,p.invert-dt);return p;}
function distanceToSegment(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy,t=l?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/l)):0;return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);}
function trace(m,angle,power,seconds=m.duration){const p=probe(m,angle,power),points=[{...p}];for(let t=0;t<seconds;t+=DT){advance(p,m,DT);points.push({...p});}return points;}
function laserSegment(l,t){const a=l.phase+t*l.speed;return[{x:l.x-Math.cos(a)*l.radius,y:l.y-Math.sin(a)*l.radius},{x:l.x+Math.cos(a)*l.radius,y:l.y+Math.sin(a)*l.radius}];}
function laserOn(l,t){return((t+l.offset)%l.period)>l.safe;}
function collision(p,old,m){if(p.x<8||p.x>W-8||p.y<8||p.y>H-8)return"Signal lost beyond the perimeter";for(const b of m.bodies)if(distanceToSegment({x:b[0],y:b[1]},old,p)<b[2]+6)return"Impact with a gravity well";for(const l of m.sentries){if(!laserOn(l,p.t))continue;const [a,b]=laserSegment(l,p.t);if(distanceToSegment(p,a,b)<8||distanceToSegment(old,a,b)<8)return"Detected by a security sweep";}return null;}
function build(index){const source=layouts[index],m={...source,bodies:source.bodies.map(b=>[...b]),index,sentries:[]};const path=trace(m,source.angle,source.power),at=f=>path[Math.min(path.length-1,Math.floor((path.length-1)*f))];m.cores=[.24,.5,.75].map(f=>({x:at(f).x,y:at(f).y}));m.exit={x:at(1).x,y:at(1).y};for(let i=0;i<(source.lasers||0);i++){const f=.33+i*.22,p=at(f),passTime=p.t,period=3.3,safe=1.65;/* A safe launch window is centered on the authored crossing. */m.sentries.push({x:p.x+8,y:p.y-35,radius:68,speed:(i%2?-.75:.65),phase:i*1.7,period,safe,offset:((safe/2-passTime)%period+period)%period});}return m;}
function medal(m,elapsed,fuelUsed,assisted){if(assisted)return 1;return elapsed<=m.duration+1&&fuelUsed<.15?3:elapsed<=m.duration+4&&fuelUsed<2?2:1;}
const api={W,H,DT,layouts,probe,advance,trace,build,collision,laserSegment,laserOn,distanceToSegment,medal};if(typeof module!=="undefined"&&module.exports)module.exports=api;else root.OrbitalPhysics=api;
})(typeof window!=="undefined"?window:globalThis);
