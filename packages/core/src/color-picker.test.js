import test from 'node:test'
import assert from 'node:assert/strict'
import { THEMES, resolveShapeColor } from './palette.js'
test('legacy named colours remain theme-specific',()=>{
 assert.equal(resolveShapeColor(THEMES.light,'blue'),THEMES.light.colors.blue)
 assert.equal(resolveShapeColor(THEMES.dark,'blue'),THEMES.dark.colors.blue)
})
test('custom hex is preserved on light and dark themes',()=>{
 for(const theme of Object.values(THEMES)){
  const col=resolveShapeColor(theme,'#A1b2C3')
  assert.equal(col.stroke,'#a1b2c3')
  assert.match(col.fill,/^#[0-9a-f]{6}$/)
  assert.match(col.note,/^#[0-9a-f]{6}$/)
 }
})
test('unknown legacy values fall back without crashing',()=>{
 assert.equal(resolveShapeColor(THEMES.light,'unknown'),THEMES.light.colors.black)
})
