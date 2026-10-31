import test from 'node:test'
import assert from 'node:assert/strict'
import { REGION_LAYOUTS,regionAt,regionRectangles,createRegionLayout,validateRegionBackground } from './regions.js'
test('all layouts partition every quadrant without finite bounds',()=>{
 for(const layout of Object.keys(REGION_LAYOUTS)){
  for(const x of [-1e9,-10,10,1e9])for(const y of [-1e9,-10,10,1e9]){
   const id=regionAt(layout,x,y)
   assert.ok(id>=0 && id<REGION_LAYOUTS[layout])
  }
 }
})
test('visible rectangles cover viewport and preserve region mapping',()=>{
 for(const layout of Object.keys(REGION_LAYOUTS)){
  const rects=regionRectangles(layout,{x:-150,y:-80,w:300,h:160})
  assert.equal(rects.reduce((sum,r)=>sum+r.w*r.h,0),48000)
  for(const r of rects)assert.equal(r.region,regionAt(layout,r.x+r.w/2,r.y+r.h/2))
 }
})
test('origin boundary has deterministic ownership',()=>{
 assert.equal(regionAt('quadrants',0,0),3)
 assert.equal(regionAt('top-split',0,0),2)
})
test('background types validate and defaults are independent',()=>{
 const cfg=createRegionLayout('quadrants',[{type:'graph'},{type:'custom',color:'#AABBCC'}])
 assert.equal(cfg.backgrounds.length,4)
 assert.deepEqual(cfg.backgrounds[1],{type:'custom',color:'#aabbcc'})
 assert.throws(()=>validateRegionBackground({type:'custom',color:'red'}))
 assert.throws(()=>createRegionLayout('unknown'))
})
