// npm i -g jest
// jest sets.test.js # this file

const log = console.log
console.log = ()=> void 0 // for internal testing purposes only, ok?

const http = require('http')
const Gun = require('gun')

const rndId = ()=> Math.random().toString(16).substr(2)
const k = rndId, v = ()=> ({a: rndId()})
const delay = (d=20)=> new Promise(r=> setTimeout(r, d))
const p = f=> new Promise(f)

const port = process.env.PORT || 3000+Math.floor(Math.random()*200)
const server = http.createServer().listen(port)

const gun = new Gun({
	localStorage: false,
	radisk: true,
	web: server,
})

const gun2 = new Gun(`http://localhost:${port}/gun`)

// Only a node can be linked! Not "undefined"! bug
describe('sets', ()=> {
	const expectSetToWork = (xs, x)=> 
		p(r=> xs.set(x, a=> (expect(a.err).toBeFalsy(), r())))

	it('simplest', async ()=> {
		const xs = gun.get(k())
		const x = gun.put(v())
		await expectSetToWork(xs, x)
	})
	it('1 level x', async ()=> {
		const xs = gun.get(k())
		const x = gun.get(k()).put(v())
		await expectSetToWork(xs, x)
	})
	it('1 level x, xs put', async ()=> {
		const xs = gun.put(v())
		const x = gun.get(k()).put(v())
		await expectSetToWork(xs, x)
	})
	it('2 level x', async ()=> { // failing
		const xs = gun.get(k())
		const x = gun.get(k()).get(k()).put(v())
		await expectSetToWork(xs, x)
	})
	it('2 level x, xs put', async ()=> { // failing
		const xs = gun.put(v())
		const x = gun.get(k()).get(k()).put(v())
		await expectSetToWork(xs, x)
	})
	it('2 level x, with intermediate put', async ()=> {
		const xs = gun.get(k())
		const x = gun.get(k()).put(v()).get(k()).put(v())
		await expectSetToWork(xs, x)
	})
	it('2 level x, with empty intermediate put', async ()=> { // failing
		const xs = gun.get(k())
		const x = gun.get(k()).put({}).get(k()).put(v())
		await expectSetToWork(xs, x)
	})
	it('2 level xs', async ()=> {
		const xs = gun.get(k()).get(k())
		const x = gun.put(v())
		await expectSetToWork(xs, x)
	})
})
