'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

// setup
// document.body.appendChild(((a = document.createElement('script')), (a.src = 'https://cdn.jsdelivr.net/npm/gun/gun.js'), a))
var apiUrl = location.origin + '/gun';
// const apiUrl = null
var gun = window.gun = new Gun(apiUrl);
var root = gun.get('testing').put({ keep: true });

// helpers
var rndId = function rndId() {
	return Math.random().toString(16).substr(2);
};
var subscribeArray = function subscribeArray(node, fn) {
	return node.map().on(function (v, k) {
		return fn(v, k);
	});
};
var unset = function unset(node, k) {
	return node.get(k).put(null);
};
var throttleFn = function throttleFn(fn) {
	var ms = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 25;

	var lastTime = null,
	    to = null;
	return function () {
		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		clearTimeout(to);
		!lastTime || new Date() * 1 - lastTime > ms ? (lastTime = new Date() * 1, fn.apply(undefined, args)) : to = setTimeout(function () {
			return fn.apply(undefined, args);
		}, ms - (new Date() * 1 - lastTime));
	};
};

// application
var ui = {
	els: {},
	add: function add(v, k) {
		var el = ui.els[k] = document.createElement('div');
		Object.assign(el.style, {
			position: 'absolute',
			top: '-4px', left: '-4px',
			width: '8px', height: '8px',
			borderRadius: '4px',
			pointerEvents: 'none',
			transition: 'transform 0.1s'
		});
		el.style.background = 'hsl(' + (v.hue || 0) * 360 + ', 90%, 60%)';
		document.body.appendChild(el);
		return el;
	},
	rem: function rem(k) {
		var el = ui.els[k];
		if (!el) return;
		el.remove();delete ui.els[k];
	},
	mod: function mod(v, k) {
		if (v === null) return ui.rem(k);
		var el = ui.els[k] || ui.add(v, k);
		el.style.transform = 'translateX(' + v.x + 'px) translateY(' + v.y + 'px)';
	}
};

var api = {
	pointers: root.get('pointers'),
	get myP() {
		var myPId = localStorage.myPId = localStorage.myPId || rndId();
		var myP = root.get('pointers/' + myPId).put({ id: myPId, hue: parseInt(myPId.substr(3), 16) % 360 / 360 });
		api.pointers.set(myP);
		Object.defineProperty(api, 'myP', { value: myP });
		return myP;
	},
	myPUpdate: function myPUpdate(o) {
		return api.myP && api.myP.put(_extends({ date: new Date() * 1 }, o));
	}

	// connect
};var mousemove = throttleFn(function (_ref) {
	var x = _ref.pageX,
	    y = _ref.pageY;
	return api.myPUpdate({ x: x, y: y });
});
document.addEventListener('mousemove', mousemove);
subscribeArray(api.pointers, function (v, k) {
	if (!v) return null;
	if (new Date() * 1 - v.date > 30 * 1000) return null; // unset(api.pointers, k)
	ui.mod(v, k);
});

// touch
var touchmove = function touchmove(e) {
	if (!e.touches || !e.touches.length) return;

	var _e$touches = _slicedToArray(e.touches, 1),
	    touch = _e$touches[0];

	var pageX = touch.pageX,
	    pageY = touch.pageY;

	mousemove(_extends({}, e, { pageX: pageX, pageY: pageY }));
	e.preventDefault();
};
document.addEventListener('touchstart', touchmove);
document.addEventListener('touchmove', touchmove);
document.addEventListener('touchend', function (e) {
	return e.preventDefault();
});