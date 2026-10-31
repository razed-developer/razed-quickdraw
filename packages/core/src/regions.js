// Pure, unbounded partitions of the world plane. Positive y points downward.
export const REGION_LAYOUTS = Object.freeze({
  vertical: 2, horizontal: 2, quadrants: 4,
  'top-split': 3, 'bottom-split': 3, 'left-focus': 3, 'right-focus': 3,
})
export const BACKGROUND_TYPES = Object.freeze(['solid','graph','dots','paper','dark','custom'])
export function regionAt(layout, x, y) {
  if (!(layout in REGION_LAYOUTS) || !Number.isFinite(x) || !Number.isFinite(y))
    throw new RangeError('Invalid layout or coordinates')
  switch(layout) {
    case 'vertical': return x < 0 ? 0 : 1
    case 'horizontal': return y < 0 ? 0 : 1
    case 'quadrants': return (y < 0 ? 0 : 2) + (x < 0 ? 0 : 1)
    case 'top-split': return y >= 0 ? 2 : (x < 0 ? 0 : 1)
    case 'bottom-split': return y < 0 ? 0 : (x < 0 ? 1 : 2)
    case 'left-focus': return x < 0 ? 0 : (y < 0 ? 1 : 2)
    case 'right-focus': return x >= 0 ? 2 : (y < 0 ? 0 : 1)
  }
}
export function regionRectangles(layout, bounds) {
  if (!(layout in REGION_LAYOUTS)) throw new RangeError('Invalid layout')
  const {x,y,w,h}=bounds
  if (![x,y,w,h].every(Number.isFinite) || w<=0 || h<=0) throw new RangeError('Invalid bounds')
  const xs=[x,...(x<0 && x+w>0?[0]:[]),x+w]
  const ys=[y,...(y<0 && y+h>0?[0]:[]),y+h]
  const out=[]
  for(let j=0;j<ys.length-1;j++)for(let i=0;i<xs.length-1;i++){
    const rx=xs[i],ry=ys[j],rw=xs[i+1]-rx,rh=ys[j+1]-ry
    out.push({region:regionAt(layout,rx+rw/2,ry+rh/2),x:rx,y:ry,w:rw,h:rh})
  }
  return out
}
export function validateRegionBackground(input) {
  if (!input || !BACKGROUND_TYPES.includes(input.type)) throw new RangeError('Invalid background type')
  if (input.type==='custom' && !/^#[0-9a-fA-F]{6}$/.test(input.color||'')) throw new RangeError('Custom background requires a six-digit hex colour')
  return input.type==='custom'?{type:'custom',color:input.color.toLowerCase()}:{type:input.type}
}
export function createRegionLayout(layout='quadrants', backgrounds=[]) {
  if (!(layout in REGION_LAYOUTS)) throw new RangeError('Invalid layout')
  return {layout,backgrounds:Array.from({length:REGION_LAYOUTS[layout]},(_,i)=>validateRegionBackground(backgrounds[i]||{type:'solid'}))}
}
