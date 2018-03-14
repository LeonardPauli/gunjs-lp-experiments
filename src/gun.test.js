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
	const g = gun
	
	const xAlts = [
		va=> g                              .put(va),
		va=> g.get(k())                     .put(va),
		va=> g.get(k()) .put(v()) .get(k()) .put(va),

		// va=> g.get(k())           .get(k()) .put(va),
		// va=> g.get(k()) .put({ }) .get(k()) .put(va),
	]

	const xsAlts = [
		()=> g                    .put(v()),
		()=> g.get(k()),
		()=> g.get(k()) .get(k()),
	]

	xAlts.forEach(_x=> it('x =   ' + _x.toString(), async ()=> {
		const xs = xsAlts[0](), val = v(), x = _x(val)
		await p(r=> xs.set(x, a=> (expect(a.err).toBeFalsy(), r())))

		xs.val((v, k)=> expect(v[x._.soul || x._.put._['#']]).not.toBeFalsy())
		await delay()
	}))
	xsAlts.forEach(_xs=> it('xs = ' + _xs.toString(), async ()=> {
		const val = v(), x = xAlts[0](val), xs = _xs()
		await p(r=> xs.set(x, a=> (expect(a.err).toBeFalsy(), r())))
		
		xs.val((v, k)=> expect(Object.keys(v).indexOf(x._.soul)).toBeGreaterThanOrEqual(0))
		await delay()
	}))

	/*
	// you can't add items with not-yet-existing deep paths, but you can .set on not-yet-existing deep paths
	// .put({}) doesn't help

	// xs.set(x)
	// with xs = g.get(k()) "and x as ok or er"
	ok = g                              .put(v())
	ok = g.get(k())                     .put(v())
	ok = g.get(k()) .put(v()) .get(k()) .put(v())

	er = g.get(k())           .get(k()) .put(v()) // error
	er = g.get(k()) .put({ }) .get(k()) .put(v()) // error

	// with x = g.put(v()) and xs as ok or er
	ok = g                    .put(v())
	ok = g.get(k())
	ok = g.get(k()) .get(k())
	a) Is there any reason why non-existing-deep-path+put won't work properly with xs.set(it)?
	b) is there any reason to why .put({}) won't help / create an empty object?
	*/
})
