// setup
// document.body.appendChild(((a = document.createElement('script')), (a.src = 'https://cdn.jsdelivr.net/npm/gun/gun.js'), a))
const apiUrl = location.origin + '/gun'
// const apiUrl = null
const gun = window.gun = new Gun(apiUrl)
const root = gun.get('testing').put({keep: true})

// helpers
const rndId = ()=> Math.random().toString(16).substr(2)
const subscribeArray = (node, fn)=> node.map().on((v, k)=> fn(v, k))
const unset = (node, k)=> node.get(k).put(null)
const throttleFn = (fn, ms = 25)=> {
	let lastTime = null, to = null
	return (...args)=> {
		clearTimeout(to)
		!lastTime || new Date()*1-lastTime > ms
			? ((lastTime = new Date()*1), fn(...args))
			: (to = setTimeout(()=> fn(...args), ms - (new Date()*1-lastTime) ))
	}
}

// application
const ui = {
	els: {},
	add: (v, k)=> {
		const el = ui.els[k] = document.createElement('div')
		Object.assign(el.style, {
			position: 'absolute',
			top: '-4px', left: '-4px',
			width: '8px', height: '8px',
			borderRadius: '4px',
			pointerEvents: 'none',
			transition: 'transform 0.1s',
		})
		el.style.background = `hsl(${(v.hue || 0)*360}, 90%, 60%)`
		document.body.appendChild(el)
		return el
	},
	rem: k=> {
		const el = ui.els[k]
		if (!el) return
		el.remove(); delete ui.els[k]
	},
	mod: (v, k)=> {
		if (v===null) return ui.rem(k)
		const el = ui.els[k] || ui.add(v, k)
		el.style.transform = `translateX(${v.x}px) translateY(${v.y}px)`
	},
}

const api = {
	pointers: root.get('pointers'),
	get myP () {
		const myPId = localStorage.myPId = localStorage.myPId || rndId()
		const myP = root.get(`pointers/${myPId}`).put({ id: myPId, hue: (parseInt(myPId.substr(3), 16)%360)/360 })
		api.pointers.set(myP)
		Object.defineProperty(api, 'myP', {value: myP})
		return myP
	},
	myPUpdate: o=> api.myP && api.myP.put({ date: new Date()*1, ...o })
}

// connect
const mousemove = throttleFn(({pageX: x, pageY: y})=> api.myPUpdate({x, y}))
document.addEventListener('mousemove', mousemove)
subscribeArray(api.pointers, (v, k)=> {
	if (!v) return null
	if (new Date()*1-v.date > 30*1000) return null // unset(api.pointers, k)
	ui.mod(v, k)
})

// touch
const touchmove = e=> {
	if (!e.touches || !e.touches.length) return
	const [touch] = e.touches
	const {pageX, pageY} = touch
	mousemove({...e, pageX, pageY})
	e.preventDefault()
}
document.addEventListener('touchstart', touchmove)
document.addEventListener('touchmove', touchmove)
document.addEventListener('touchend', e=> e.preventDefault())
