//#region node_modules/svelte/src/internal/shared/utils.js
var e = Array.isArray, t = Array.prototype.indexOf, n = Array.prototype.includes, r = Array.from, i = Object.defineProperty, a = Object.getOwnPropertyDescriptor, o = Object.getOwnPropertyDescriptors, s = Object.prototype, c = Array.prototype, l = Object.getPrototypeOf, u = Object.isExtensible, d = () => {};
function f(e) {
	for (var t = 0; t < e.length; t++) e[t]();
}
function p() {
	var e, t;
	return {
		promise: new Promise((n, r) => {
			e = n, t = r;
		}),
		resolve: e,
		reject: t
	};
}
var m = 1024, h = 2048, g = 4096, _ = 8192, v = 16384, ee = 32768, te = 1 << 25, y = 65536, b = 1 << 19, ne = 1 << 20, re = 1 << 25, x = 1 << 21, S = 1 << 22, ie = 1 << 23, C = Symbol("$state"), ae = Symbol("component"), oe = Symbol(""), se = Symbol("attributes"), ce = Symbol("class"), le = Symbol("style"), ue = Symbol("text"), de = Symbol("form reset"), fe = new class extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), pe = !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml"), me = {}, w = Symbol("uninitialized"), he = "http://www.w3.org/1999/xhtml";
function ge() {
	console.warn("https://svelte.dev/e/derived_inert");
}
function _e(e) {
	console.warn("https://svelte.dev/e/hydration_mismatch");
}
function ve() {
	console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function ye() {
	console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/hydration.js
var T = !1;
function be(e) {
	T = e;
}
var E;
function D(e) {
	if (e === null) throw _e(), me;
	return E = e;
}
function xe() {
	return D(/* @__PURE__ */ Zt(E));
}
function O(e) {
	if (T) {
		if (/* @__PURE__ */ Zt(E) !== null) throw _e(), me;
		E = e;
	}
}
function Se(e = 1) {
	if (T) {
		for (var t = e, n = E; t--;) n = /* @__PURE__ */ Zt(n);
		E = n;
	}
}
function Ce(e = !0) {
	for (var t = 0, n = E;;) {
		if (n.nodeType === 8) {
			var r = n.data;
			if (r === "]") {
				if (t === 0) return n;
				--t;
			} else (r === "[" || r === "[!" || r[0] === "[" && !isNaN(Number(r.slice(1)))) && (t += 1);
		}
		var i = /* @__PURE__ */ Zt(n);
		e && n.remove(), n = i;
	}
}
function we(e) {
	if (!e || e.nodeType !== 8) throw _e(), me;
	return e.data;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/equality.js
function Te(e) {
	return e === this.v;
}
function Ee(e, t) {
	return e == e ? e !== t || typeof e == "object" && !!e || typeof e == "function" : t == t;
}
function De(e) {
	return !Ee(e, this.v);
}
function Oe(e) {
	throw Error("https://svelte.dev/e/lifecycle_outside_component");
}
//#endregion
//#region node_modules/svelte/src/internal/client/errors.js
function ke() {
	throw Error("https://svelte.dev/e/async_derived_orphan");
}
function Ae(e, t, n) {
	throw Error("https://svelte.dev/e/each_key_duplicate");
}
function je(e) {
	throw Error("https://svelte.dev/e/effect_in_teardown");
}
function Me() {
	throw Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function Ne(e) {
	throw Error("https://svelte.dev/e/effect_orphan");
}
function Pe() {
	throw Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Fe() {
	throw Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Ie() {
	throw Error("https://svelte.dev/e/state_prototype_fixed");
}
function Le() {
	throw Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Re() {
	throw Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
//#endregion
//#region node_modules/svelte/src/internal/client/context.js
var k = null;
function ze(e) {
	k = e;
}
function Be(e, t = !1, n) {
	k = {
		p: k,
		i: !1,
		c: null,
		e: null,
		s: e,
		x: null,
		r: K,
		l: null
	};
}
function Ve(e) {
	var t = k, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) fn(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, k = t.p, He(e);
}
function He(e = {}) {
	return i(e, ae, { value: !0 }), e;
}
function Ue() {
	return !0;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/task.js
var We = [];
function Ge() {
	var e = We;
	We = [], f(e);
}
function A(e) {
	if (We.length === 0 && !_t) {
		var t = We;
		queueMicrotask(() => {
			t === We && Ge();
		});
	}
	We.push(e);
}
function Ke() {
	for (; We.length > 0;) Ge();
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/status.js
var qe = ~(h | g | m);
function j(e, t) {
	e.f = e.f & qe | t;
}
function Je(e) {
	e.f & 512 || e.deps === null ? j(e, m) : j(e, g);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/utils.js
function Ye(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), j(e, m);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/misc.js
var Xe = !1;
function Ze() {
	Xe || (Xe = !0, document.addEventListener("reset", (e) => {
		Promise.resolve().then(() => {
			if (!e.defaultPrevented) for (let t of e.target.elements) t[de]?.();
		});
	}, { capture: !0 }));
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function Qe(e) {
	var t = U, n = K;
	G(null), jn(null);
	try {
		return e();
	} finally {
		G(t), jn(n);
	}
}
function $e(e, t, n, r = n) {
	e.addEventListener(t, () => Qe(n));
	let i = e[de];
	e[de] = i ? () => {
		i(), r(!0);
	} : () => r(!0), Ze();
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/async.js
function et(e, t, n, r) {
	let i = Ue() ? it : ct;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = K, c = tt(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function u(e) {
		if (!(s.f & 16384)) {
			c();
			try {
				r([...o, ...e]);
			} catch (e) {
				an(e, s);
			}
			nt();
		}
	}
	var d = rt();
	if (n.length === 0) {
		l.then(() => u([])).finally(d);
		return;
	}
	function f() {
		Promise.all(n.map((e) => /* @__PURE__ */ ot(e))).then(u).catch((e) => an(e, s)).finally(d);
	}
	l ? l.then(() => {
		s.f & 16384 ? d() : (c(), f(), nt());
	}) : f();
}
function tt() {
	var e = K, t = U, n = k, r = M;
	return function(i = !0) {
		jn(e), G(t), ze(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function nt(e = !0) {
	jn(null), G(null), ze(null), e && M?.deactivate();
}
function rt() {
	var e = K, t = e.b, n = M, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function it(e) {
	var t = 2 | h;
	return K !== null && (K.f |= b), {
		ctx: k,
		deps: null,
		effects: null,
		equals: Te,
		f: t,
		fn: e,
		reactions: null,
		rv: 0,
		v: w,
		wv: 0,
		parent: K,
		ac: null
	};
}
var at = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function ot(e, t, n) {
	let r = K;
	r === null && ke();
	var i = void 0, a = Pt(w), o = !U, s = /* @__PURE__ */ new Set();
	return hn(() => {
		var t = K, n = p();
		i = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== fe && n.reject(e);
			}).finally(nt);
		} catch (e) {
			n.reject(e), nt();
		}
		var c = M;
		if (o) {
			if (t.f & 32768) var l = rt();
			if (r.b?.is_rendered()) c.async_deriveds.get(t)?.reject(at);
			else for (let e of s.values()) e.reject(at);
			s.add(n), c.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), s.delete(n), t !== at && (c.activate(), t ? (a.f |= ie, Rt(a, t)) : (a.f & 8388608 && (a.f ^= ie), Rt(a, e)), c.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), un(() => {
		for (let e of s) e.reject(at);
	}), new Promise((e) => {
		function t(n) {
			function r() {
				n === i ? e(a) : t(i);
			}
			n.then(r, r);
		}
		t(i);
	});
}
/*#__NO_SIDE_EFFECTS__*/
function st(e) {
	let t = /* @__PURE__ */ it(e);
	return Nn(t), t;
}
/*#__NO_SIDE_EFFECTS__*/
function ct(e) {
	let t = /* @__PURE__ */ it(e);
	return t.equals = De, t;
}
function lt(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) H(t[n]);
	}
}
function ut(e) {
	var t, n = K, r = e.parent;
	if (!kn && r !== null && e.v !== w && r.f & 24576) return ge(), e.v;
	jn(r);
	try {
		lt(e), t = Wn(e);
	} finally {
		jn(n);
	}
	return t;
}
function dt(e) {
	var t = ut(e);
	!e.equals(t) && (e.wv = Vn(), (!M?.is_fork || e.deps === null) && (M === null ? e.v = t : (M.capture(e, t, !0), ht?.capture(e, t, !0)), e.deps === null)) ? j(e, m) : kn || (N === null ? Je(e) : (ln() || M?.is_fork) && N.set(e, t));
}
function ft(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && Qe(() => {
		t.ac.abort(fe), t.ac = null;
	}), t.fn !== null && (t.teardown = d), qn(t, 0), yn(t));
}
function pt(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && Jn(t);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/batch.js
var mt = null, M = null, ht = null, N = null, gt = null, _t = !1, vt = !1, yt = null, bt = null, xt = 0, St = 1, Ct = class e {
	id = St++;
	#e = !1;
	linked = !0;
	#t = null;
	#n = null;
	async_deriveds = /* @__PURE__ */ new Map();
	current = /* @__PURE__ */ new Map();
	previous = /* @__PURE__ */ new Map();
	#r = /* @__PURE__ */ new Set();
	#i = /* @__PURE__ */ new Set();
	#a = 0;
	#o = /* @__PURE__ */ new Map();
	#s = null;
	#c = [];
	#l = [];
	#u = /* @__PURE__ */ new Set();
	#d = /* @__PURE__ */ new Set();
	#f = /* @__PURE__ */ new Map();
	#p = /* @__PURE__ */ new Set();
	is_fork = !1;
	#m = !1;
	constructor() {
		mt === null ? mt = this : (mt.#n = this, this.#t = mt), mt = this;
	}
	#h() {
		if (this.is_fork) return !0;
		for (let n of this.#o.keys()) {
			for (var e = n, t = !1; e.parent !== null;) {
				if (this.#f.has(e)) {
					t = !0;
					break;
				}
				e = e.parent;
			}
			if (!t) return !0;
		}
		return !1;
	}
	skip_effect(e) {
		this.#f.has(e) || this.#f.set(e, {
			d: [],
			m: []
		}), this.#p.delete(e);
	}
	unskip_effect(e, t = (e) => this.schedule(e)) {
		var n = this.#f.get(e);
		if (n) {
			this.#f.delete(e);
			for (var r of n.d) j(r, h), t(r);
			for (r of n.m) j(r, g), t(r);
		}
		this.#p.add(e);
	}
	#g() {
		var e = [];
		for (let i of this.#c) if (!(i.f & 16384 || !(i.f & 6144))) {
			for (var t = i, n = !1; t.parent !== null;) {
				t = t.parent;
				var r = t.f;
				if (r & 96) {
					if (!(r & 1024)) {
						n = !0;
						break;
					}
					t.f ^= m;
				}
			}
			n || e.push(t);
		}
		return this.#c = [], e;
	}
	#_() {
		this.#e = !0;
		for (let e of this.#u) this.#d.delete(e), j(e, h), this.schedule(e);
		for (let e of this.#d) j(e, g), this.schedule(e);
		this.apply();
		for (var t = yt = [], n = [], r = bt = []; this.#c.length > 0;) {
			xt++ > 1e3 && (this.#S(), Tt());
			for (let e of this.#g()) try {
				this.#v(e, t, n);
			} catch (t) {
				throw At(e), this.#h() || this.discard(), t;
			}
		}
		if (M = null, r.length > 0) {
			var i = e.ensure();
			for (let e of r) i.schedule(e);
		}
		if (yt = null, bt = null, this.#h()) {
			this.#x(n), this.#x(t);
			for (let [e, t] of this.#f) kt(e, t);
			r.length > 0 && M.#_();
			return;
		}
		let a = this.#y();
		if (a) this.#x(n), this.#x(t), a.#b(this);
		else {
			this.#u.clear(), this.#d.clear();
			for (let e of this.#r) e(this);
			this.#r.clear(), ht = this, Dt(n), Dt(t), ht = null, this.#s?.resolve();
			var o = M;
			if (this.#a === 0 && (this.#c.length === 0 || o !== null) && this.#S(), this.#c.length > 0) {
				if (o !== null) {
					for (let e of this.#c) o.#c.push(e);
					this.#c = [];
				} else o = this;
			}
			o !== null && (Mt.clear(), o.#_());
		}
	}
	#v(e, t, n) {
		e.f ^= m;
		for (var r = e.first; r !== null;) {
			var i = r.f, a = !!(i & 96);
			if (!(a && i & 1024 || i & 8192 || this.#f.has(r)) && r.fn !== null) {
				a ? r.f ^= m : i & 4 ? t.push(r) : Hn(r) && (i & 16 && this.#d.add(r), Jn(r));
				var o = r.first;
				if (o !== null) {
					r = o;
					continue;
				}
			}
			for (; r !== null;) {
				var s = r.next;
				if (s !== null) {
					r = s;
					break;
				}
				r = r.parent;
			}
		}
	}
	#y() {
		for (var e = this.#t; e !== null;) {
			if (!e.is_fork) {
				for (let [t, [, n]] of this.current) if (e.current.has(t) && !n) return e;
			}
			e = e.#t;
		}
		return null;
	}
	#b(e) {
		for (let [t, n] of e.current) !this.previous.has(t) && e.previous.has(t) && this.previous.set(t, e.previous.get(t)), this.current.set(t, n);
		for (let [t, n] of e.async_deriveds) {
			let e = this.async_deriveds.get(t);
			e && n.promise.then(e.resolve).catch(e.reject);
		}
		e.async_deriveds.clear(), this.transfer_effects(e.#u, e.#d);
		let t = (e) => {
			var n = e.reactions;
			if (n !== null && !(e.f & 2 && !(e.f & 6144))) for (let e of n) {
				var r = e.f;
				if (r & 2) t(e);
				else {
					var i = e;
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), j(i, h), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#S(), M = this, this.#_();
	}
	#x(e) {
		for (var t = 0; t < e.length; t += 1) Ye(e[t], this.#u, this.#d);
	}
	capture(e, t, n = !1) {
		e.v !== w && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [t, n]), N?.set(e, t)), this.is_fork || (e.v = t);
	}
	activate() {
		M = this;
	}
	deactivate() {
		M = null, N = null;
	}
	flush() {
		try {
			vt = !0, M = this, this.#_();
		} finally {
			xt = 0, gt = null, yt = null, bt = null, vt = !1, M = null, N = null, Mt.clear();
		}
	}
	discard() {
		for (let e of this.#i) e(this);
		this.#i.clear();
		for (let e of this.async_deriveds.values()) e.reject(at);
		this.#S(), this.#s?.resolve();
	}
	register_created_effect(e) {
		this.#l.push(e);
	}
	increment(e, t) {
		if (this.#a += 1, e) {
			let e = this.#o.get(t) ?? 0;
			this.#o.set(t, e + 1);
		}
	}
	decrement(e, t) {
		if (--this.#a, e) {
			let e = this.#o.get(t) ?? 0;
			e === 1 ? this.#o.delete(t) : this.#o.set(t, e - 1);
		}
		this.#m || (this.#m = !0, A(() => {
			this.#m = !1, this.linked && this.flush();
		}));
	}
	transfer_effects(e, t) {
		for (let t of e) this.#u.add(t);
		for (let e of t) this.#d.add(e);
		e.clear(), t.clear();
	}
	oncommit(e) {
		this.#r.add(e);
	}
	ondiscard(e) {
		this.#i.add(e);
	}
	settled() {
		return (this.#s ??= p()).promise;
	}
	static ensure() {
		if (M === null) {
			let t = M = new e();
			!vt && !_t && A(() => {
				t.#e || t.flush();
			});
		}
		return M;
	}
	apply() {
		N = null;
	}
	schedule(e) {
		gt = e, e.b?.is_pending && e.f & 16777228 && !(e.f & 32768) ? e.b.defer_effect(e) : this.#c.push(e);
	}
	#S() {
		if (this.linked) {
			var e = this.#t, t = this.#n;
			e === null || (e.#n = t), t === null ? mt = e : t.#t = e, this.linked = !1;
		}
	}
};
function wt(e) {
	var t = _t, n = ht;
	ht = null, _t = !0;
	try {
		var r;
		for (e && (wt(), r = e());;) {
			if (Ke(), M === null) return r;
			M.flush();
		}
	} finally {
		_t = t, ht = n;
	}
}
function Tt() {
	try {
		Pe();
	} catch (e) {
		an(e, gt);
	}
}
var Et = null;
function Dt(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && Hn(r) && (Et = /* @__PURE__ */ new Set(), Jn(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Sn(r), Et?.size > 0)) {
				Mt.clear();
				for (let e of Et) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) Et.has(n) && (Et.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || Jn(n);
					}
				}
				Et.clear();
			}
		}
		Et = null;
	}
}
function Ot(e) {
	M.schedule(e);
}
function kt(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), j(e, m);
		for (var n = e.first; n !== null;) kt(n, t), n = n.next;
	}
}
function At(e) {
	j(e, m);
	for (var t = e.first; t !== null;) At(t), t = t.next;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/sources.js
var jt = /* @__PURE__ */ new Set(), Mt = /* @__PURE__ */ new Map(), Nt = !1;
function Pt(e, t) {
	return {
		f: 0,
		v: e,
		reactions: null,
		equals: Te,
		rv: 0,
		wv: 0
	};
}
/*#__NO_SIDE_EFFECTS__*/
function P(e, t) {
	let n = Pt(e, t);
	return Nn(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function Ft(e, t = !1, n = !0) {
	let r = Pt(e);
	return t || (r.equals = De), r;
}
function F(e, t, n = !1) {
	return U !== null && (!W || U.f & 131072) && Ue() && U.f & 4325394 && (Mn === null || !Mn.has(e)) && Le(), Rt(e, n ? Ht(t) : t, bt);
}
var It = null, Lt = 0;
function Rt(e, t, n = null) {
	if (!e.equals(t)) {
		kn ? Mt.set(e, t) : Mt.has(e) || Mt.set(e, e.v);
		var r = Ct.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && ut(t), N === null && Je(t);
		}
		e.wv = Vn(), It = null, Lt = 0, Vt(e, h, n), It = null, Ue() && K !== null && K.f & 1024 && !(K.f & 96) && (Fn === null ? In([e]) : Fn.push(e)), !r.is_fork && jt.size > 0 && !Nt && zt();
	}
	return t;
}
function zt() {
	Nt = !1;
	for (let e of jt) {
		e.f & 1024 && j(e, g);
		let t;
		try {
			t = Hn(e);
		} catch {
			t = !0;
		}
		t && Jn(e);
	}
	jt.clear();
}
function Bt(e) {
	F(e, e.v + 1);
}
function Vt(e, t, n) {
	var r = e.reactions;
	if (r !== null) {
		var i = Ue(), a = r.length;
		if (Lt += a, Lt > 1e5 && It === null && (It = /* @__PURE__ */ new Set()), It !== null) {
			if (It.has(e)) return;
			It.add(e);
		}
		for (var o = 0; o < a; o++) {
			var s = r[o], c = s.f;
			if (i || s !== K) {
				var l = (c & h) === 0;
				if (l && j(s, t), c & 131072) jt.add(s);
				else if (c & 2) {
					var u = s;
					N?.delete(u), Vt(u, g, n);
				} else if (l) {
					var d = s;
					c & 16 && Et !== null && Et.add(d), n === null ? Ot(d) : n.push(d);
				}
			}
		}
	}
}
function Ht(t) {
	if (typeof t != "object" || !t || C in t || ae in t) return t;
	let n = l(t);
	if (n !== s && n !== c) return t;
	var r = /* @__PURE__ */ new Map(), i = e(t), o = /* @__PURE__ */ P(0), u = null, d = zn, f = (e) => {
		if (zn === d) return e();
		var t = U, n = zn;
		G(null), Bn(d);
		var r = e();
		return G(t), Bn(n), r;
	};
	return i && r.set("length", /* @__PURE__ */ P(t.length, u)), new Proxy(t, {
		defineProperty(e, t, n) {
			(!("value" in n) || n.configurable === !1 || n.enumerable === !1 || n.writable === !1) && Fe();
			var i = r.get(t);
			return i === void 0 ? f(() => {
				var e = /* @__PURE__ */ P(n.value, u);
				return r.set(t, e), e;
			}) : F(i, n.value, !0), !0;
		},
		deleteProperty(e, t) {
			var n = r.get(t);
			if (n === void 0) {
				if (t in e) {
					let e = f(() => /* @__PURE__ */ P(w, u));
					r.set(t, e), Bt(o);
				}
			} else F(n, w), Bt(o);
			return !0;
		},
		get(e, n, i) {
			if (n === C) return t;
			var o = r.get(n), s = n in e;
			if (o === void 0 && (!s || a(e, n)?.writable) && (o = f(() => /* @__PURE__ */ P(Ht(s ? e[n] : w), u)), r.set(n, o)), o !== void 0) {
				var c = J(o);
				return c === w ? void 0 : c;
			}
			return Reflect.get(e, n, i);
		},
		getOwnPropertyDescriptor(e, t) {
			this.has?.(e, t);
			var n = Reflect.getOwnPropertyDescriptor(e, t), i = r.get(t);
			if (i !== void 0) {
				var a = J(i);
				if (a === w) return;
				if (n && "value" in n) n.value = a;
				else return {
					enumerable: !0,
					configurable: !0,
					value: a,
					writable: !0
				};
			}
			return n;
		},
		has(e, t) {
			if (t === C) return !0;
			var n = r.get(t), i = n !== void 0 && n.v !== w || Reflect.has(e, t);
			return (n !== void 0 || K !== null && (!i || a(e, t)?.writable)) && (n === void 0 && (n = f(() => /* @__PURE__ */ P(i ? Ht(e[t]) : w, u)), r.set(t, n)), J(n) === w) ? !1 : i;
		},
		set(e, t, n, s) {
			var c = r.get(t), l = t in e;
			if (i && t === "length") for (var d = n; d < c.v; d += 1) {
				var p = r.get(d + "");
				p === void 0 ? d in e && (p = f(() => /* @__PURE__ */ P(w, u)), r.set(d + "", p)) : F(p, w);
			}
			if (c === void 0) (!l || a(e, t)?.writable) && (c = f(() => /* @__PURE__ */ P(void 0, u)), F(c, Ht(n)), r.set(t, c));
			else {
				l = c.v !== w;
				var m = f(() => Ht(n));
				F(c, m);
			}
			var h = Reflect.getOwnPropertyDescriptor(e, t);
			if (h?.set && h.set.call(s, n), !l) {
				if (i && typeof t == "string") {
					var g = r.get("length"), _ = Number(t);
					Number.isInteger(_) && _ >= g.v && F(g, _ + 1);
				}
				Bt(o);
			}
			return !0;
		},
		ownKeys(e) {
			J(o);
			var t = Reflect.ownKeys(e).filter((e) => {
				var t = r.get(e);
				return t === void 0 || t.v !== w;
			});
			for (var [n, i] of r) i.v !== w && !(n in e) && t.push(n);
			return t;
		},
		setPrototypeOf() {
			Ie();
		}
	});
}
function Ut(e) {
	try {
		if (typeof e == "object" && e && C in e) return e[C];
	} catch {}
	return e;
}
function Wt(e, t) {
	return Object.is(Ut(e), Ut(t));
}
var Gt, Kt, qt, Jt;
function Yt() {
	if (Gt === void 0) {
		Gt = window, Kt = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		qt = a(t, "firstChild").get, Jt = a(t, "nextSibling").get, u(e) && (e[ce] = void 0, e[se] = null, e[le] = void 0, e.__e = void 0), u(n) && (n[ue] = void 0);
	}
}
function I(e = "") {
	return document.createTextNode(e);
}
/*@__NO_SIDE_EFFECTS__*/
function Xt(e) {
	return qt.call(e);
}
/*@__NO_SIDE_EFFECTS__*/
function Zt(e) {
	return Jt.call(e);
}
function L(e, t) {
	if (!T) return /* @__PURE__ */ Xt(e);
	var n = /* @__PURE__ */ Xt(E);
	if (n === null) n = E.appendChild(I());
	else if (t && n.nodeType !== 3) {
		var r = I();
		return n?.before(r), D(r), r;
	}
	return t && nn(n), D(n), n;
}
function Qt(e, t = !1) {
	if (!T) {
		var n = /* @__PURE__ */ Xt(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ Zt(n) : n;
	}
	if (t) {
		if (E?.nodeType !== 3) {
			var r = I();
			return E?.before(r), D(r), r;
		}
		nn(E);
	}
	return E;
}
function R(e, t = !1) {
	if (!T) return /* @__PURE__ */ Xt(e);
	var n = L(e, t);
	return O(e), n;
}
function z(e, t = 1, n = !1) {
	let r = T ? E : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ Zt(r);
	if (!T) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = I();
			return r === null ? i?.after(a) : r.before(a), D(a), a;
		}
		nn(r);
	}
	return D(r), r;
}
function $t(e) {
	e.textContent = "";
}
function en() {
	return !1;
}
function tn(e, t, n) {
	return t == null || t === "http://www.w3.org/1999/xhtml" ? n ? document.createElement(e, { is: n }) : document.createElement(e) : n ? document.createElementNS(t, e, { is: n }) : document.createElementNS(t, e);
}
function nn(e) {
	if (e.nodeValue.length < 65536) return;
	let t = e.nextSibling;
	for (; t !== null && t.nodeType === 3;) t.remove(), e.nodeValue += t.nodeValue, t = e.nextSibling;
}
function rn(e) {
	var t = K;
	if (t === null) return U.f |= ie, e;
	if (!(t.f & 32768) && !(t.f & 4)) throw e;
	an(e, t);
}
function an(e, t) {
	if (e === me) throw e;
	if (!(t !== null && t.f & 16384)) {
		for (; t !== null;) {
			if (t.f & 128 && !(t.f & 33570816)) {
				if (!(t.f & 32768)) throw e;
				try {
					t.b.error(e);
					return;
				} catch (t) {
					e = t;
				}
			}
			t = t.parent;
		}
		throw e;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/effects.js
function on(e) {
	K === null && (U === null && Ne(e), Me()), kn && je(e);
}
function sn(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function cn(e, t) {
	var n = K;
	n !== null && n.f & 8192 && (e |= _);
	var r = {
		ctx: k,
		deps: null,
		nodes: null,
		f: e | h | 512,
		first: null,
		fn: t,
		last: null,
		next: null,
		parent: n,
		b: n && n.b,
		prev: null,
		teardown: null,
		wv: 0,
		ac: null
	};
	M?.register_created_effect(r);
	var i = r;
	if (e & 4) yt === null ? Ct.ensure().schedule(r) : yt.push(r);
	else if (t !== null) {
		try {
			Jn(r);
		} catch (e) {
			throw H(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= y));
	}
	if (i !== null && (i.parent = n, n !== null && sn(i, n), U !== null && U.f & 2 && !(e & 64))) {
		var a = U;
		(a.effects ??= []).push(i);
	}
	return r;
}
function ln() {
	return U !== null && !W;
}
function un(e) {
	let t = cn(8, null);
	return j(t, m), t.teardown = e, t;
}
function dn(e) {
	on("$effect");
	var t = K.f;
	if (!U && t & 32 && k !== null && !k.i) {
		var n = k;
		(n.e ??= []).push(e);
	} else return fn(e);
}
function fn(e) {
	return cn(4 | ne, e);
}
function pn(e) {
	Ct.ensure();
	let t = cn(64 | b, e);
	return (e = {}) => new Promise((n) => {
		e.outro ? Cn(t, () => {
			H(t), n(void 0);
		}) : (H(t), n(void 0));
	});
}
function mn(e) {
	return cn(4, e);
}
function hn(e) {
	return cn(S | b, e);
}
function gn(e, t = 0) {
	return cn(8 | t, e);
}
function B(e, t = [], n = [], r = []) {
	et(r, t, n, (t) => {
		cn(8, () => {
			e(...t.map(J));
		});
	});
}
function _n(e, t = 0) {
	return cn(16 | t, e);
}
function V(e) {
	return cn(32 | b, e);
}
function vn(e) {
	var t = e.teardown;
	if (t !== null) {
		let n = kn, r = U;
		An(!0), G(null);
		try {
			t.call(null);
		} catch (t) {
			an(t, e.parent);
		} finally {
			An(n), G(r);
		}
	}
}
function yn(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && Qe(() => {
			e.abort(fe);
		});
		var r = n.next;
		n.f & 64 ? n.parent = null : H(n, t), n = r;
	}
}
function bn(e) {
	for (var t = e.first; t !== null;) {
		var n = t.next;
		t.f & 32 || H(t), t = n;
	}
}
function H(e, t = !0) {
	var n = !1;
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (xn(e.nodes.start, e.nodes.end), n = !0), e.f |= te, yn(e, t && !n), qn(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	vn(e), e.f ^= te, e.f |= v;
	var i = e.parent;
	i !== null && i.first !== null && Sn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function xn(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ Zt(e);
		e.remove(), e = n;
	}
}
function Sn(e) {
	var t = e.parent, n = e.prev, r = e.next;
	n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function Cn(e, t, n = !0) {
	var r = [];
	e.f |= 256, wn(e, r, !0);
	var i = () => {
		n && H(e), t && t();
	}, a = r.length;
	if (a > 0) {
		var o = () => --a || i();
		for (var s of r) s.out(o);
	} else i();
}
function wn(e, t, n) {
	if (!(e.f & 8192)) {
		e.f ^= _;
		var r = e.nodes && e.nodes.t;
		if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
		for (var i = e.first; i !== null;) {
			var a = i.next;
			if (!(i.f & 64)) {
				var o = !!(i.f & 65536) || !!(i.f & 32) && !!(e.f & 16);
				wn(i, t, o ? n : !1);
			}
			i = a;
		}
	}
}
function Tn(e) {
	e.f &= -257, En(e, !0);
}
function En(e, t) {
	if (!(e.f & 256) && e.f & 8192) {
		e.f ^= _, e.f & 1024 || (j(e, h), Ct.ensure().schedule(e));
		for (var n = e.first; n !== null;) {
			var r = n.next, i = !!(n.f & 65536) || !!(n.f & 32);
			En(n, i ? t : !1), n = r;
		}
		var a = e.nodes && e.nodes.t;
		if (a !== null) for (let e of a) (e.is_global || t) && e.in();
	}
}
function Dn(e, t) {
	if (e.nodes) for (var n = e.nodes.start, r = e.nodes.end; n !== null;) {
		var i = n === r ? null : /* @__PURE__ */ Zt(n);
		t.append(n), n = i;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/legacy.js
var On = null, kn = !1;
function An(e) {
	kn = e;
}
var U = null, W = !1;
function G(e) {
	U = e;
}
var K = null;
function jn(e) {
	K = e;
}
var Mn = null;
function Nn(e) {
	U !== null && (U.f & 2097152 || U.f & 2) && (Mn ??= /* @__PURE__ */ new Set()).add(e);
}
var q = null, Pn = 0, Fn = null;
function In(e) {
	Fn = e;
}
var Ln = 1, Rn = 0, zn = Rn;
function Bn(e) {
	zn = e;
}
function Vn() {
	return ++Ln;
}
function Hn(e) {
	var t = e.f;
	if (t & 2048) return !0;
	if (t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (Hn(a) && dt(a), a.wv > e.wv) return !0;
		}
		t & 512 && N === null && j(e, m);
	}
	return !1;
}
function Un(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(Mn !== null && Mn.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? Un(a, t, !1) : t === a && (n ? j(a, h) : a.f & 1024 && j(a, g), Ot(a));
	}
}
function Wn(e) {
	var t = q, n = Pn, r = Fn, i = U, a = Mn, o = k, s = W, c = zn, l = e.f;
	q = null, Pn = 0, Fn = null, U = l & 96 ? null : e, Mn = null, ze(e.ctx), W = !1, zn = ++Rn, e.ac !== null && (Qe(() => {
		e.ac.abort(fe);
	}), e.ac = null);
	try {
		e.f |= x;
		var u = e.fn, d = u();
		e.f |= ee;
		var f = Gn(e);
		if (Ue() && Fn !== null && !W && f !== null && !(e.f & 6146)) for (var p = 0; p < Fn.length; p++) Un(Fn[p], e);
		if (i !== null && i !== e) {
			if (Rn++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = Rn;
			if (t !== null) for (let e of t) e.rv = Rn;
			Fn !== null && (r === null ? r = Fn : r.push(...Fn));
		}
		return e.f & 8388608 && (e.f ^= ie), d;
	} catch (t) {
		return Gn(e), rn(t);
	} finally {
		e.f ^= x, q = t, Pn = n, Fn = r, U = i, Mn = a, ze(o), W = s, zn = c;
	}
}
function Gn(e) {
	var t = e.deps, n = M?.is_fork;
	if (q !== null) {
		var r;
		if (n || qn(e, Pn), t !== null && Pn > 0) for (t.length = Pn + q.length, r = 0; r < q.length; r++) t[Pn + r] = q[r];
		else e.deps = t = q;
		if (ln() && e.f & 512) for (r = Pn; r < t.length; r++) (t[r].reactions ??= []).push(e);
	} else !n && t !== null && Pn < t.length && (qn(e, Pn), t.length = Pn);
	return t;
}
function Kn(e, r) {
	let i = r.reactions;
	if (i !== null) {
		var a = t.call(i, e);
		if (a !== -1) {
			var o = i.length - 1;
			o === 0 ? i = r.reactions = null : (i[a] = i[o], i.pop());
		}
	}
	if (i === null && r.f & 2 && (q === null || !n.call(q, r))) {
		var s = r;
		s.f & 512 && (s.f ^= 512), s.v !== w && Je(s), s.ac !== null && Qe(() => {
			s.ac.abort(fe), s.ac = null, j(s, h);
		}), ft(s), qn(s, 0);
	}
}
function qn(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) Kn(e, n[r]);
}
function Jn(e) {
	var t = e.f;
	if (!(t & 16384)) {
		j(e, m);
		var n = K;
		K = e;
		try {
			t & 16777232 ? bn(e) : yn(e), vn(e);
			var r = Wn(e);
			e.teardown = typeof r == "function" ? r : null, e.wv = Ln;
		} finally {
			K = n;
		}
	}
}
async function Yn() {
	await Promise.resolve(), wt();
}
function J(e) {
	var t = !!(e.f & 2);
	if (On?.add(e), U !== null && !W && !(K !== null && K.f & 16384) && (Mn === null || !Mn.has(e))) {
		var r = U.deps;
		if (U.f & 2097152) e.rv < Rn && (e.rv = Rn, q === null && r !== null && r[Pn] === e ? Pn++ : q === null ? q = [e] : q.push(e));
		else {
			U.deps ??= [], n.call(U.deps, e) || U.deps.push(e);
			var i = e.reactions;
			i === null ? e.reactions = [U] : n.call(i, U) || i.push(U);
		}
	}
	if (kn && Mt.has(e)) return Mt.get(e);
	if (t) {
		var a = e;
		if (kn) {
			var o = a.v;
			return (!(a.f & 1024) && a.reactions !== null || Zn(a)) && (o = ut(a)), Mt.set(a, o), o;
		}
		var s = !(a.f & 512) && !W && U !== null && !!(U.f & 512), c = (a.f & ee) === 0;
		Hn(a) && (s && (a.f |= 512), dt(a)), s && !c && (pt(a), Xn(a));
	}
	if (N?.has(e)) return N.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function Xn(e) {
	if (e.f |= 512, e.deps !== null) for (let r of e.deps) {
		var t = r.reactions;
		t === null ? r.reactions = [e] : n.call(t, e) || t.push(e), r.f & 2 && !(r.f & 512) && (pt(r), Xn(r));
	}
}
function Zn(e) {
	if (e.v === w) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (Mt.has(t) || t.f & 2 && Zn(t)) return !0;
	return !1;
}
function Qn(e) {
	var t = W;
	try {
		return W = !0, e();
	} finally {
		W = t;
	}
}
[.../* @__PURE__ */ "allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback".split(".")];
var $n = ["touchstart", "touchmove"];
function er(e) {
	return $n.includes(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/events.js
var tr = Symbol("events"), nr = /* @__PURE__ */ new Set(), rr = /* @__PURE__ */ new Set();
function ir(e, t, n, r = {}) {
	function i(e) {
		if (r.capture || cr.call(t, e), !e.cancelBubble) return Qe(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? (i.__removed = !1, A(() => {
		i.__removed || t.addEventListener(e, i, r);
	})) : t.addEventListener(e, i, r), i;
}
function Y(e, t, n, r, i) {
	var a = {
		capture: r,
		passive: i
	}, o = ir(e, t, n, a);
	(t === document.body || t === window || t === document || t instanceof HTMLMediaElement) && un(() => {
		o.__removed = !0, t.removeEventListener(e, o, a);
	});
}
function X(e, t, n) {
	(t[tr] ??= {})[e] = n;
}
function ar(e) {
	for (var t = 0; t < e.length; t++) nr.add(e[t]);
	for (var n of rr) n(e);
}
var or = null, sr = !1;
function cr(e) {
	var t = this, n = t.ownerDocument, r = e.type, a = e.composedPath?.() || [], o = a[0] || e.target;
	or = e, sr || (sr = !0, setTimeout(() => {
		sr = !1, or = null;
	}));
	var s = 0, c = or === e && e[tr];
	if (c) {
		var l = a.indexOf(c);
		if (l !== -1 && (t === document || t === window)) {
			e[tr] = t;
			return;
		}
		var u = a.indexOf(t);
		if (u === -1) return;
		l <= u && (s = l);
	}
	if (o = a[s] || e.target, o !== t) {
		i(e, "currentTarget", {
			configurable: !0,
			get() {
				return o || n;
			}
		});
		var d = U, f = K;
		G(null), jn(null);
		try {
			for (var p, m = []; o !== null && o !== t;) {
				try {
					var h = o[tr]?.[r];
					h != null && (!o.disabled || e.target === o) && h.call(o, e);
				} catch (e) {
					p ? m.push(e) : p = e;
				}
				if (e.cancelBubble) break;
				s++, o = s < a.length ? a[s] : null;
			}
			if (p) {
				for (let e of m) queueMicrotask(() => {
					throw e;
				});
				throw p;
			}
		} finally {
			e[tr] = t, delete e.currentTarget, G(d), jn(f);
		}
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/reconciler.js
var lr = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
function ur(e) {
	return lr?.createHTML(e) ?? e;
}
function dr(e) {
	var t = tn("template");
	return t.innerHTML = ur(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/template.js
function fr(e, t) {
	var n = K;
	n.nodes === null && (n.nodes = {
		start: e,
		end: t,
		a: null,
		t: null
	});
}
/*#__NO_SIDE_EFFECTS__*/
function Z(e, t) {
	var n = !!(t & 1), r = !!(t & 2), i, a = !e.startsWith("<!>");
	return () => {
		if (T) return fr(E, null), E;
		i === void 0 && (i = dr(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ Xt(i)));
		var t = r || Kt ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ Xt(t), s = t.lastChild;
			fr(o, s);
		} else fr(t, t);
		return t;
	};
}
function pr() {
	if (T) return fr(E, null), E;
	var e = document.createDocumentFragment(), t = document.createComment(""), n = I();
	return e.append(t, n), fr(t, n), e;
}
function Q(e, t) {
	if (T) {
		var n = K;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = E), xe();
	} else e !== null && e.before(t);
}
//#endregion
//#region node_modules/svelte/src/reactivity/create-subscriber.js
function mr(e) {
	let t = 0, n = Pt(0), r;
	return () => {
		ln() && (J(n), gn(() => (t === 0 && (r = Qn(() => e(() => Bt(n)))), t += 1, () => {
			A(() => {
				--t, t === 0 && (r?.(), r = void 0, Bt(n));
			});
		})));
	};
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var hr = y | b;
function gr(e, t, n, r) {
	new _r(e, t, n, r);
}
var _r = class {
	parent;
	is_pending = !1;
	transform_error;
	#e;
	#t = T ? E : null;
	#n;
	#r;
	#i;
	#a = null;
	#o = null;
	#s = null;
	#c = null;
	#l = 0;
	#u = 0;
	#d = !1;
	#f = /* @__PURE__ */ new Set();
	#p = /* @__PURE__ */ new Set();
	#m = null;
	#h = mr(() => (this.#m = Pt(this.#l), () => {
		this.#m = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#n = t, this.#r = (e) => {
			var t = K;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = K.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = _n(() => {
			if (T) {
				let e = we(this.#t);
				xe();
				let t = e === "[!";
				if (e.startsWith("[?")) {
					let t = JSON.parse(e.slice(2));
					this.#_(t);
				} else t ? this.#b() : this.#g();
			} else this.#x();
		}, hr), T && (this.#e = E);
	}
	#g() {
		try {
			this.#a = V(() => this.#r(this.#e));
		} catch (e) {
			this.error(e);
		}
	}
	#_(e) {
		let t = this.#n.failed, { reset: n, invoke_onerror: r } = this.#v(e);
		A(r), t && (this.#s = V(() => {
			t(this.#e, () => e, () => n);
		}));
	}
	#v(e) {
		var t = !1, n = !1;
		let r = () => {
			this.#y() || (t ? ye() : (t = !0, n && Re(), this.#s !== null && Cn(this.#s, () => {
				this.#s = null;
			}), this.#C(() => {
				this.#x();
			})));
		};
		return {
			reset: r,
			invoke_onerror: () => {
				if (!this.#y()) try {
					n = !0, this.#n.onerror?.(e, r), n = !1;
				} catch (e) {
					an(e, this.#i && this.#i.parent);
				}
			}
		};
	}
	#y() {
		return (this.#i.f & (v | te)) !== 0;
	}
	#b() {
		let e = this.#n.pending;
		e && (this.is_pending = !0, this.#o = V(() => e(this.#e)), A(() => {
			if (!this.#y()) {
				var e = this.#c = document.createDocumentFragment(), t = I(), n = !1;
				e.append(t), this.#a = this.#C(() => {
					try {
						return V(() => this.#r(t));
					} catch (e) {
						try {
							this.error(e), n = !0;
						} catch (e) {
							an(e, this.#i.parent);
						}
						return null;
					}
				}), this.#a === null ? (this.#c = null, n && this.#S(M)) : this.#u === 0 && (this.#e.before(e), this.#c = null, Cn(this.#o, () => {
					this.#o = null;
				}), this.#S(M));
			}
		}));
	}
	#x() {
		try {
			if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#l = 0, this.#a = V(() => {
				this.#r(this.#e);
			}), this.#u > 0) {
				var e = this.#c = document.createDocumentFragment();
				Dn(this.#a, e);
				let t = this.#n.pending;
				this.#o = V(() => t(this.#e));
			} else this.#S(M);
		} catch (e) {
			this.error(e);
		}
	}
	#S(e) {
		this.is_pending = !1, e.transfer_effects(this.#f, this.#p);
	}
	defer_effect(e) {
		Ye(e, this.#f, this.#p);
	}
	is_rendered() {
		return !this.is_pending && (!this.parent || this.parent.is_rendered());
	}
	has_pending_snippet() {
		return !!this.#n.pending;
	}
	#C(e) {
		var t = K, n = U, r = k;
		jn(this.#i), G(this.#i), ze(this.#i.ctx);
		try {
			return Ct.ensure(), e();
		} finally {
			jn(t), G(n), ze(r);
		}
	}
	#w(e, t) {
		this.has_pending_snippet() ? (this.#u += e, this.#u === 0 && (this.#S(t), this.#o && Cn(this.#o, () => {
			this.#o = null;
		}), this.#c &&= (this.#e.before(this.#c), null))) : this.parent && this.parent.#w(e, t);
	}
	update_pending_count(e, t) {
		this.#w(e, t), this.#l += e, !(!this.#m || this.#d) && (this.#d = !0, A(() => {
			this.#d = !1, this.#m && Rt(this.#m, this.#l);
		}));
	}
	get_effect_pending() {
		return this.#h(), J(this.#m);
	}
	error(e) {
		if (e === me || !this.#n.onerror && !this.#n.failed) throw e;
		M?.is_fork ? (this.#a && M.skip_effect(this.#a), this.#o && M.skip_effect(this.#o), this.#s && M.skip_effect(this.#s), M.oncommit(() => {
			this.#y() || this.#T(e);
		})) : this.#T(e);
	}
	#T(e) {
		this.#a &&= (H(this.#a), null), this.#o &&= (H(this.#o), null), this.#s &&= (H(this.#s), null), T && (D(this.#t), Se(), D(Ce()));
		let t = this.#n.failed, n = (e) => {
			if (this.#y()) return;
			let { reset: n, invoke_onerror: r } = this.#v(e);
			r(), t && !this.#y() && (this.#s = this.#C(() => {
				try {
					return V(() => {
						var r = K;
						r.b = this, r.f |= 128, t(this.#e, () => e, () => n);
					});
				} catch (e) {
					return an(e, this.#i.parent), null;
				}
			}));
		};
		A(() => {
			if (!this.#y()) {
				var t;
				try {
					t = this.transform_error(e);
				} catch (e) {
					an(e, this.#i && this.#i.parent);
					return;
				}
				typeof t == "object" && t && typeof t.then == "function" ? t.then(n, (e) => an(e, this.#i && this.#i.parent)) : n(t);
			}
		});
	}
};
function $(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[ue] ??= e.nodeValue) && (e[ue] = n, e.nodeValue = `${n}`);
}
function vr(e, t) {
	return br(e, t);
}
var yr = /* @__PURE__ */ new Map();
function br(e, { target: t, anchor: n, props: i = {}, events: a, context: o, intro: s = !0, transformError: c }) {
	Yt();
	var l = void 0, u = pn(() => {
		var s = n ?? t.appendChild(I());
		gr(s, { pending: () => {} }, (t) => {
			Be({});
			var n = k;
			if (o && (n.c = o), a && (i.$$events = a), T && fr(t, null), l = e(t, i) || He(), T && (K.nodes.end = E, E === null || E.nodeType !== 8 || E.data !== "]")) throw _e(), me;
			Ve();
		}, c);
		var u = /* @__PURE__ */ new Set(), d = (e) => {
			for (var n = 0; n < e.length; n++) {
				var r = e[n];
				if (!u.has(r)) {
					u.add(r);
					var i = er(r);
					for (let e of [t, document]) {
						var a = yr.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), yr.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, cr, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return d(r(nr)), rr.add(d), () => {
			for (var e of u) for (let n of [t, document]) {
				var r = yr.get(n), i = r.get(e);
				--i == 0 ? (n.removeEventListener(e, cr), r.delete(e), r.size === 0 && yr.delete(n)) : r.set(e, i);
			}
			rr.delete(d), s !== n && s.parentNode?.removeChild(s);
		};
	});
	return xr.set(l, u), l;
}
var xr = /* @__PURE__ */ new WeakMap(), Sr = class {
	anchor;
	#e = /* @__PURE__ */ new Map();
	#t = /* @__PURE__ */ new Map();
	#n = /* @__PURE__ */ new Map();
	#r = /* @__PURE__ */ new Set();
	#i = !0;
	constructor(e, t = !0) {
		this.anchor = e, this.#i = t;
	}
	#a = (e) => {
		if (this.#e.has(e)) {
			var t = this.#e.get(e), n = this.#t.get(t);
			if (n) Tn(n), this.#r.delete(t);
			else {
				var r = this.#n.get(t);
				r && (Tn(r.effect), this.#t.set(t, r.effect), this.#n.delete(t), r.fragment.lastChild.remove(), this.anchor.before(r.fragment), n = r.effect);
			}
			for (let [t, n] of this.#e) {
				if (this.#e.delete(t), t === e) break;
				let r = this.#n.get(n);
				r && (H(r.effect), this.#n.delete(n));
			}
			for (let [e, r] of this.#t) {
				if (e === t || this.#r.has(e)) continue;
				let i = () => {
					if (Array.from(this.#e.values()).includes(e)) {
						var t = document.createDocumentFragment();
						Dn(r, t), t.append(I()), this.#n.set(e, {
							effect: r,
							fragment: t
						});
					} else H(r);
					this.#r.delete(e), this.#t.delete(e);
				};
				this.#i || !n ? (this.#r.add(e), Cn(r, i, !1)) : i();
			}
		}
	};
	#o = (e) => {
		this.#e.delete(e);
		let t = Array.from(this.#e.values());
		for (let [e, n] of this.#n) t.includes(e) || (H(n.effect), this.#n.delete(e));
	};
	ensure(e, t) {
		var n = M, r = en();
		if (t && !this.#t.has(e) && !this.#n.has(e)) {
			if (r) {
				var i = document.createDocumentFragment(), a = I();
				i.append(a), this.#n.set(e, {
					effect: V(() => t(a)),
					fragment: i
				});
			} else this.#t.set(e, V(() => t(this.anchor)));
		}
		if (this.#e.set(n, e), r) {
			for (let [t, r] of this.#t) t === e ? n.unskip_effect(r) : n.skip_effect(r);
			for (let [t, r] of this.#n) t === e ? n.unskip_effect(r.effect) : n.skip_effect(r.effect);
			n.oncommit(this.#a), n.ondiscard(this.#o);
		} else T && (this.anchor = E), this.#a(n);
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/if.js
function Cr(e, t, n = !1) {
	var r;
	T && (r = E, xe());
	var i = new Sr(e), a = n ? y : 0;
	function o(e, t) {
		if (T) {
			var n = we(r);
			if (e !== parseInt(n.substring(1))) {
				var a = Ce();
				D(a), i.anchor = a, be(!1), i.ensure(e, t), be(!0);
				return;
			}
		}
		i.ensure(e, t);
	}
	_n(() => {
		var e = !1;
		t((t, n = 0) => {
			e = !0, o(n, t);
		}), e || o(-1, null);
	}, a);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/each.js
function wr(e, t, n) {
	for (var i = [], a = t.length, o, s = t.length, c = 0; c < a; c++) {
		let n = t[c];
		Cn(n, () => {
			if (o) {
				if (o.pending.delete(n), o.done.add(n), o.pending.size === 0) {
					var t = e.outrogroups;
					Tr(e, r(o.done)), t.delete(o), t.size === 0 && (e.outrogroups = null);
				}
			} else --s;
		}, !1);
	}
	if (s === 0) {
		var l = i.length === 0 && n !== null && e.pending.size === 0;
		if (l) {
			var u = n, d = u.parentNode;
			$t(d), d.append(u), e.items.clear();
		}
		Tr(e, t, !l);
	} else o = {
		pending: new Set(t),
		done: /* @__PURE__ */ new Set()
	}, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(o);
}
function Tr(e, t, n = !0) {
	var r;
	if (e.pending.size > 0) {
		r = /* @__PURE__ */ new Set();
		for (let t of e.pending.values()) for (let n of t) r.add(e.items.get(n).e);
	}
	for (var i = 0; i < t.length; i++) {
		var a = t[i];
		r?.has(a) ? (a.f |= re, Dn(a, document.createDocumentFragment())) : H(t[i], n);
	}
}
var Er;
function Dr(t, n, i, a, o, s = null) {
	var c = t, l = /* @__PURE__ */ new Map();
	if (n & 4) {
		var u = t;
		c = T ? D(/* @__PURE__ */ Xt(u)) : u.appendChild(I());
	}
	T && xe();
	var d = null, f = /* @__PURE__ */ ct(() => {
		var t = i();
		return e(t) ? t : t == null ? [] : r(t);
	}), p = /* @__PURE__ */ new Map(), m = !0;
	function h(e) {
		if (!(_.effect.f & 16384)) {
			_.pending.delete(e);
			var t = J(f);
			_.fallback = d, kr(_, t, c, n, a), d !== null && (t.length === 0 ? d.f & 33554432 ? (d.f ^= re, jr(d, null, c)) : Tn(d) : Cn(d, () => {
				d = null;
			}));
		}
	}
	function g(e) {
		_.pending.delete(e);
	}
	var _ = {
		effect: _n(() => {
			var e = J(f), t = e.length;
			let r = !1;
			T && we(c) === "[!" != (t === 0) && (c = Ce(), D(c), be(!1), r = !0);
			for (var u = /* @__PURE__ */ new Set(), _ = M, v = en(), ee = 0; ee < t; ee += 1) {
				T && E.nodeType === 8 && E.data === "]" && (c = E, r = !0, be(!1));
				var te = e[ee], y = a(te, ee), b = m ? null : l.get(y);
				b ? (b.v && Rt(b.v, te), b.i && Rt(b.i, ee), v && _.unskip_effect(b.e)) : (b = Ar(l, m ? c : Er ??= I(), te, y, ee, o, n, i), m || (b.e.f |= re), l.set(y, b)), u.add(y);
			}
			if (t === 0 && s && !d && (m ? d = V(() => s(c)) : (d = V(() => s(Er ??= I())), d.f |= re)), t > u.size && Ae("", "", ""), T && t > 0 && D(Ce()), !m) {
				if (p.set(_, u), v) {
					for (let [e, t] of l) u.has(e) || _.skip_effect(t.e);
					_.oncommit(h), _.ondiscard(g);
				} else h(_);
			}
			r && be(!0), J(f);
		}),
		flags: n,
		items: l,
		pending: p,
		outrogroups: null,
		fallback: d
	};
	m = !1, T && (c = E);
}
function Or(e) {
	for (; e !== null && !(e.f & 32);) e = e.next;
	return e;
}
function kr(e, t, n, i, a) {
	var o = !!(i & 8), s = t.length, c = e.items, l = Or(e.effect.first), u, d = null, f, p = [], m = [], h, g, _, v;
	if (o) for (v = 0; v < s; v += 1) h = t[v], g = a(h, v), _ = c.get(g).e, _.f & 33554432 || (_.nodes?.a?.measure(), (f ??= /* @__PURE__ */ new Set()).add(_));
	for (v = 0; v < s; v += 1) {
		if (h = t[v], g = a(h, v), _ = c.get(g).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(_), t.done.delete(_);
		if (_.f & 8192 && (Tn(_), o && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
			if (_.f ^= re, _ === l) jr(_, null, n);
			else {
				var ee = d ? d.next : l;
				_ === e.effect.last && (e.effect.last = _.prev), _.prev && (_.prev.next = _.next), _.next && (_.next.prev = _.prev), Mr(e, d, _), Mr(e, _, ee), jr(_, ee, n), d = _, p = [], m = [], l = Or(d.next);
				continue;
			}
		}
		if (_ !== l) {
			if (u !== void 0 && u.has(_)) {
				if (p.length < m.length) {
					var te = m[0], y;
					d = te.prev;
					var b = p[0], ne = p[p.length - 1];
					for (y = 0; y < p.length; y += 1) jr(p[y], te, n);
					for (y = 0; y < m.length; y += 1) u.delete(m[y]);
					Mr(e, b.prev, ne.next), Mr(e, d, b), Mr(e, ne, te), l = te, d = ne, --v, p = [], m = [];
				} else u.delete(_), jr(_, l, n), Mr(e, _.prev, _.next), Mr(e, _, d === null ? e.effect.first : d.next), Mr(e, d, _), d = _;
				continue;
			}
			for (p = [], m = []; l !== null && l !== _;) (u ??= /* @__PURE__ */ new Set()).add(l), m.push(l), l = Or(l.next);
			if (l === null) continue;
		}
		_.f & 33554432 || p.push(_), d = _, l = Or(_.next);
	}
	if (e.outrogroups !== null) {
		for (let t of e.outrogroups) t.pending.size === 0 && (Tr(e, r(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (l !== null || u !== void 0) {
		var x = [];
		if (u !== void 0) for (_ of u) _.f & 8192 || x.push(_);
		for (; l !== null;) !(l.f & 8192) && l !== e.fallback && x.push(l), l = Or(l.next);
		var S = x.length;
		if (S > 0) {
			var ie = i & 4 && s === 0 ? n : null;
			if (o) {
				for (v = 0; v < S; v += 1) x[v].nodes?.a?.measure();
				for (v = 0; v < S; v += 1) x[v].nodes?.a?.fix();
			}
			wr(e, x, ie);
		}
	}
	o && A(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function Ar(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? Pt(n) : /* @__PURE__ */ Ft(n, !1, !1) : null, l = o & 2 ? Pt(i) : null;
	return {
		v: c,
		i: l,
		e: V(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function jr(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ Zt(r);
		if (a.before(r), r === i) return;
		r = o;
	}
}
function Mr(e, t, n) {
	t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
//#endregion
//#region node_modules/svelte/src/internal/shared/attributes.js
var Nr = [..." 	\n\r\f\xA0\v﻿"];
function Pr(e, t, n) {
	var r = e == null ? "" : "" + e;
	if (t && (r = r ? r + " " + t : t), n) {
		for (var i of Object.keys(n)) if (n[i]) r = r ? r + " " + i : i;
		else if (r.length) for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0;) {
			var s = o + a;
			(o === 0 || Nr.includes(r[o - 1])) && (s === r.length || Nr.includes(r[s])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(s + 1) : o = s;
		}
	}
	return r === "" ? null : r;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/class.js
function Fr(e, t, n, r, i, a) {
	var o = e[ce];
	if (T || o !== n || o === void 0) {
		var s = Pr(n, r, a);
		(!T || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[ce] = n;
	} else if (a && i !== a) for (var c in a) {
		var l = !!a[c];
		(i == null || l !== !!i[c]) && e.classList.toggle(c, l);
	}
	return a;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/select.js
function Ir(e, t) {
	t ? e.hasAttribute("selected") || e.setAttribute("selected", "") : e.removeAttribute("selected");
}
function Lr(t, n) {
	var r = t.__defaultValue, i = t.multiple, a = i ? r ?? [] : null;
	if (!i || e(a)) {
		var o = t.selectedIndex, s = n && i ? new Set(t.selectedOptions) : null;
		for (var c of t.options) {
			var l = Vr(c);
			Ir(c, i ? a.includes(l) : Wt(l, r));
		}
		if (n) {
			if (s !== null) for (c of t.options) {
				var u = s.has(c);
				c.selected !== u && (c.selected = u);
			}
			else t.selectedIndex !== o && (t.selectedIndex = o);
		}
	}
}
function Rr(t, n, r = !1) {
	if (t.multiple) {
		if (n == null) return;
		if (!e(n)) return ve();
		for (var i of t.options) i.selected = n.includes(Vr(i));
	} else {
		for (i of t.options) if (Wt(Vr(i), n)) {
			i.selected = !0;
			return;
		}
		(!r || n !== void 0) && (t.selectedIndex = -1);
	}
}
function zr(e) {
	var t = new MutationObserver((t) => {
		t.every(Hr) || ("__defaultValue" in e && Lr(e, !1), "__value" in e && Rr(e, e.__value));
	});
	t.observe(e, {
		childList: !0,
		subtree: !0,
		attributes: !0,
		attributeFilter: ["value"]
	}), un(() => {
		t.disconnect();
	});
}
function Br(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet(), i = !0;
	$e(e, "change", (t) => {
		var i = t ? "[selected]" : ":checked", a;
		if (e.multiple) a = [].map.call(e.querySelectorAll(i), Vr);
		else {
			var o = e.querySelector(i) ?? e.querySelector("option:not([disabled])");
			a = o && Vr(o);
		}
		n(a), e.__value = a, M !== null && r.add(M);
	}), mn(() => {
		var a = t();
		if (e === document.activeElement) {
			var o = M;
			if (r.has(o)) return;
		}
		if (Rr(e, a, i), i && a === void 0) {
			var s = e.querySelector(":checked");
			s !== null && (a = Vr(s), n(a));
		}
		e.__value = a, i = !1;
	});
}
function Vr(e) {
	return "__value" in e ? e.__value : e.value;
}
function Hr(e) {
	if (e.target.closest("selectedcontent") !== null) return !0;
	if (e.type === "childList") {
		var t = [...e.addedNodes, ...e.removedNodes];
		return t.length > 0 && t.every((e) => e.nodeName === "SELECTEDCONTENT");
	}
	return !1;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/attributes.js
var Ur = Symbol("is custom element"), Wr = Symbol("is html"), Gr = pe ? "link" : "LINK", Kr = pe ? "progress" : "PROGRESS";
function qr(e) {
	if (T) {
		var t = !1, n = () => {
			if (!t) {
				if (t = !0, e.hasAttribute("value")) {
					var n = e.value;
					Yr(e, "value", null), e.value = n;
				}
				if (e.hasAttribute("checked")) {
					var r = e.checked;
					Yr(e, "checked", null), e.checked = r;
				}
			}
		};
		e[de] = n, A(n), Ze();
	}
}
function Jr(e, t) {
	var n = Xr(e);
	n.value !== (n.value = t ?? void 0) && (e.value !== t || t === 0 && e.nodeName === Kr) && (e.value = t ?? "");
}
function Yr(e, t, n, r) {
	var i = Xr(e);
	T && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === Gr) || i[t] !== (i[t] = n) && (t === "loading" && (e[oe] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && Qr(e).has(t) ? e[t] = n : e.setAttribute(t, n));
}
function Xr(e) {
	return e[se] ??= {
		[Ur]: e.nodeName.includes("-"),
		[Wr]: e.namespaceURI === he
	};
}
var Zr = /* @__PURE__ */ new Map();
function Qr(e) {
	var t = e.getAttribute("is") || e.nodeName, n = Zr.get(t);
	if (n) return n;
	Zr.set(t, n = /* @__PURE__ */ new Set());
	for (var r, i = e, a = Element.prototype; a !== i;) {
		for (var s in r = o(i), r) r[s].set && s !== "innerHTML" && s !== "textContent" && s !== "innerText" && n.add(s);
		i = l(i);
	}
	return n;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/input.js
function $r(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet();
	$e(e, "input", async (i) => {
		var a = i ? e.defaultValue : e.value;
		if (a = ei(e) ? ti(a) : a, n(a), M !== null && r.add(M), await Yn(), a !== (a = t())) {
			var o = e.selectionStart, s = e.selectionEnd, c = e.value.length;
			if (e.value = a ?? "", s !== null) {
				var l = e.value.length;
				o === s && s === c && l > c ? (e.selectionStart = l, e.selectionEnd = l) : (e.selectionStart = o, e.selectionEnd = Math.min(s, l));
			}
		}
	}), (T && e.defaultValue !== e.value || Qn(t) == null && e.value) && (n(ei(e) ? ti(e.value) : e.value), M !== null && r.add(M)), gn(() => {
		var n = t();
		if (e === document.activeElement) {
			var i = M;
			if (r.has(i)) return;
		}
		ei(e) && n === ti(e.value) || (e.type !== "date" || n || e.value) && n !== e.value && (e.value = n ?? "");
	});
}
function ei(e) {
	var t = e.type;
	return t === "number" || t === "range";
}
function ti(e) {
	return e === "" ? null : +e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/this.js
function ni(e, t) {
	return e === t || e?.[C] === t;
}
function ri(e = He(), t, n, r) {
	var i = k.r, a = K;
	return mn(() => {
		var o, s;
		return gn(() => {
			o = s, s = r?.() || [], Qn(() => {
				ni(n(...s), e) || (t(e, ...s), o && ni(n(...o), e) && t(null, ...o));
			});
		}), () => {
			let r = a;
			for (; r !== i && r.parent !== null && r.parent.f & 33554432;) r = r.parent;
			let o = () => {
				s && ni(n(...s), e) && t(null, ...s);
			}, c = r.teardown;
			r.teardown = () => {
				o(), c?.();
			};
		};
	}), e;
}
function ii(e) {
	k === null && Oe("onMount"), dn(() => {
		let t = Qn(e);
		if (typeof t == "function") return t;
	});
}
//#endregion
//#region node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region src/workspace.ts
function ai() {
	let e = [];
	function t(t, n) {
		let r = document.getElementById(n);
		if (!t || !r || !t.parentNode) return;
		let i = document.createComment("receiver control position");
		t.before(i), r.append(t), e.push(() => {
			i.replaceWith(t);
		});
	}
	let n = document.getElementById("openwebrx-panel-receiver");
	if (!n) return () => {};
	t(document.getElementById("openwebrx-sdr-profiles-listbox"), "receiver-modern-profile-slot");
	for (let e of ["openwebrx-section-settings", "openwebrx-section-display"]) {
		let n = document.getElementById(e), r = n?.nextElementSibling, i = e.endsWith("settings") ? "receiver-modern-preferences-slot" : "receiver-modern-display-slot";
		t(n, i), t(r ?? null, i);
	}
	for (let e of [
		"openwebrx-waterfall-colors-auto",
		"openwebrx-waterfall-color-min",
		"openwebrx-waterfall-colors-default",
		"openwebrx-waterfall-color-max"
	]) t(document.getElementById(e), "receiver-modern-levels-slot");
	return t(document.getElementById("openwebrx-wf-themes-listbox")?.closest(".openwebrx-panel-line") ?? null, "receiver-modern-display-slot"), t(document.getElementById("openwebrx-smeter")?.closest(".openwebrx-panel-line") ?? null, "receiver-modern-meter-slot"), t(n, "receiver-modern-rf-slot"), () => e.reverse().forEach((e) => e());
}
//#endregion
//#region src/receiver-bridge.ts
var oi = null, si = {
	deviceName: null,
	deviceState: "unknown",
	deviceSeverity: "info",
	deviceMessage: null
}, ci = null;
window.addEventListener("openwebrx:decoder-output", (e) => {
	let t = e.detail?.modulation;
	typeof t == "string" && t && (oi = {
		modulation: t,
		at: Date.now()
	}, ci = null);
}), window.addEventListener("openwebrx:decoder-error", (e) => {
	let t = e.detail;
	t?.schema_version === 1 && typeof t.message == "string" && t.message.length <= 240 && (ci = t.message.slice(0, 240));
}), window.addEventListener("openwebrx:receiver-health", (e) => {
	let t = e.detail;
	t && t.schema_version === 1 && typeof t.state == "string" && [
		"starting",
		"running",
		"stopping",
		"stopped",
		"tuning",
		"failed",
		"disabled",
		"shutting_down",
		"offline"
	].includes(t.state) && [
		"info",
		"warning",
		"error"
	].includes(String(t.severity)) && (si = {
		deviceName: typeof t.source_name == "string" ? t.source_name.slice(0, 80) : null,
		deviceState: t.state,
		deviceSeverity: t.severity,
		deviceMessage: typeof t.message == "string" ? t.message.slice(0, 240) : null
	});
});
var li = {
	profileName: "Live receiver",
	frequencyHz: null,
	tuningStepHz: 1,
	connection: "starting",
	audio: "waiting",
	recording: !1,
	recordingAllowed: !1,
	volume: 100,
	muted: !1,
	audioDroppedSamples: 0,
	deviceName: null,
	deviceState: "unknown",
	deviceSeverity: "info",
	deviceMessage: null,
	decoderError: null,
	mode: "No mode",
	availableModes: [],
	modeCapabilities: [],
	waterfallZoomLevel: 0,
	waterfallZoomMaximum: 0
};
function ui() {
	let e = window.OpenWebRXReceiver?.getSnapshot() ?? li, t = (e.availableModes ?? []).filter((e) => typeof e?.modulation == "string" && typeof e?.name == "string"), n = (e.modeCapabilities ?? []).filter((e) => typeof e?.modulation == "string" && typeof e?.name == "string"), r = (n.find((t) => t.modulation === e.mode) ?? t.find((t) => t.modulation === e.mode))?.type === "digimode" ? oi?.modulation === e.mode && Date.now() - oi.at < 15e3 ? "output" : "selected" : "off";
	return {
		...li,
		...e,
		...si,
		decoderError: ci,
		availableModes: t,
		modeCapabilities: n,
		decoder: r
	};
}
function di(e) {
	return !Number.isFinite(e) || e <= 0 ? !1 : window.OpenWebRXReceiver?.tuneTo(e) ?? !1;
}
function fi(e) {
	Number.isFinite(e) && window.OpenWebRXReceiver?.audio?.setVolume(Math.max(0, Math.min(150, Math.round(e))));
}
function pi() {
	window.OpenWebRXReceiver?.audio?.toggleMute();
}
function mi(e) {
	return ui().audio === "playing" ? window.OpenWebRXReceiver?.audio?.setRecording(e) ?? !1 : !1;
}
function hi(e) {
	return window.OpenWebRXReceiver?.waterfall?.zoom(e) ?? !1;
}
function gi(e) {
	return window.OpenWebRXReceiver?.waterfall?.setRange(e) ?? !1;
}
function _i(e) {
	return !e || !ui().availableModes.some((t) => t.modulation === e) ? !1 : window.OpenWebRXReceiver?.setMode(e) ?? !1;
}
function vi() {
	return window.OpenWebRXReceiver?.addCurrentBookmark() ?? !1;
}
function yi() {
	return window.OpenWebRXReceiver?.getSelectedProfile() ?? null;
}
function bi() {
	let e = window.OpenWebRXReceiver, t = (e?.getSelectedProfile())?.split("|", 1)[0];
	return t ? e?.getProfiles().find((e) => {
		let n = e.id.split("|", 1)[0];
		return n && n !== t;
	}) ?? null : null;
}
function xi(e) {
	let t = () => e(ui());
	t();
	let n = window.setInterval(t, 400);
	return () => window.clearInterval(n);
}
//#endregion
//#region src/layouts.ts
var Si = "openwebrx.receiver-layouts.v1.", Ci = 40, wi = 48;
function Ti(e) {
	return typeof e != "string" || !e || e.length > 256 ? null : Si + encodeURIComponent(e);
}
function Ei(e) {
	return Array.isArray(e) ? e.slice(0, Ci).filter((e) => typeof e == "object" && !!e && typeof e.id == "string" && e.id.length > 0 && e.id.length <= 80 && typeof e.name == "string" && e.name.length > 0 && e.name.length <= wi && Number.isFinite(e.frequencyHz) && e.frequencyHz > 0 && typeof e.modulation == "string" && e.modulation.length > 0 && e.modulation.length <= 40).map((e) => ({
		id: e.id,
		name: e.name,
		frequencyHz: e.frequencyHz,
		modulation: e.modulation
	})) : [];
}
function Di(e) {
	if (!e) return [];
	let t = Ti(e);
	if (!t) return [];
	try {
		return Ei(JSON.parse(window.localStorage.getItem(t) ?? "[]"));
	} catch {
		return [];
	}
}
function Oi(e, t) {
	if (!e || !t.name.trim() || t.name.trim().length > wi || !Number.isFinite(t.frequencyHz) || t.frequencyHz <= 0 || !t.modulation || t.modulation.length > 40) return null;
	let n = Ti(e);
	if (!n) return null;
	let r = Di(e), i = t.name.trim(), a = r.find((e) => e.name.toLocaleLowerCase() === i.toLocaleLowerCase()), o = a ? r.map((e) => e.id === a.id ? {
		...e,
		name: i,
		frequencyHz: t.frequencyHz,
		modulation: t.modulation
	} : e) : [{
		...t,
		id: crypto.randomUUID(),
		name: i
	}, ...r].slice(0, Ci);
	try {
		return window.localStorage.setItem(n, JSON.stringify(o)), o;
	} catch {
		return null;
	}
}
function ki(e, t) {
	if (!e || !t) return null;
	let n = Ti(e);
	if (!n) return null;
	let r = Di(e).filter((e) => e.id !== t);
	try {
		return window.localStorage.setItem(n, JSON.stringify(r)), r;
	} catch {
		return null;
	}
}
//#endregion
//#region src/ReceiverIsland.svelte
var Ai = /* @__PURE__ */ Z("<option> </option>"), ji = /* @__PURE__ */ Z("<button type=\"button\" class=\"receiver-island__record svelte-apy39n\"> </button>"), Mi = /* @__PURE__ */ Z("<span class=\"receiver-island__audio-warning svelte-apy39n\" role=\"status\"> </span>"), Ni = /* @__PURE__ */ Z("<span class=\"receiver-island__health-error svelte-apy39n\" role=\"status\"> </span>"), Pi = /* @__PURE__ */ Z("<li class=\"svelte-apy39n\"><span> </span> <p class=\"svelte-apy39n\"> </p></li>"), Fi = /* @__PURE__ */ Z("<ol class=\"receiver-island__data2g-aprs svelte-apy39n\"></ol>"), Ii = /* @__PURE__ */ Z("<li class=\"svelte-apy39n\"><span> </span> <code class=\"svelte-apy39n\"> </code></li>"), Li = /* @__PURE__ */ Z("<ol class=\"svelte-apy39n\"></ol>"), Ri = /* @__PURE__ */ Z("<p class=\"svelte-apy39n\">No complete Data2G frame received yet. Decoded frames appear here.</p>"), zi = /* @__PURE__ */ Z("<li class=\"svelte-apy39n\"> </li>"), Bi = /* @__PURE__ */ Z("<ol class=\"receiver-island__data2g-activity svelte-apy39n\" aria-label=\"Recent Data2G channel and burst activity\"></ol>"), Vi = /* @__PURE__ */ Z("<section class=\"receiver-island__data2g svelte-apy39n\" aria-label=\"Data2G receive activity\"><div class=\"receiver-island__data2g-heading svelte-apy39n\"><strong>DATA2G RECEIVE</strong> <span aria-live=\"polite\" class=\"svelte-apy39n\"> </span></div> <!> <!> <!></section>"), Hi = /* @__PURE__ */ Z("<p class=\"svelte-apy39n\">Decoder output appears in the reception cards. Search saved output in History.</p>"), Ui = /* @__PURE__ */ Z("<label class=\"receiver-island__layout-select-label svelte-apy39n\" for=\"receiver-modern-layout-list\">THIS RECEIVER PROFILE</label> <div class=\"receiver-island__layout-actions svelte-apy39n\"><select id=\"receiver-modern-layout-list\" class=\"svelte-apy39n\"><option>Choose a saved station</option><!></select> <button type=\"button\" class=\"receiver-island__apply svelte-apy39n\">Apply</button> <button type=\"button\" class=\"receiver-island__zoom svelte-apy39n\">Remove</button></div>", 1), Wi = /* @__PURE__ */ Z("<p class=\"receiver-island__layout-empty svelte-apy39n\">Save a frequency and mode combination for quick recall.</p>"), Gi = /* @__PURE__ */ Z("<li class=\"svelte-apy39n\"><header class=\"svelte-apy39n\"><time> </time> <span> </span> <span> </span> <span> </span></header> <pre class=\"svelte-apy39n\"> </pre></li>"), Ki = /* @__PURE__ */ Z("<ol class=\"receiver-island__history-list svelte-apy39n\"></ol>"), qi = /* @__PURE__ */ Z("<p class=\"svelte-apy39n\"> </p>"), Ji = /* @__PURE__ */ Z("<button type=\"button\" class=\"receiver-island__bookmark svelte-apy39n\"> </button> <button type=\"button\" class=\"receiver-island__bookmark svelte-apy39n\">Open separate window</button>", 1), Yi = /* @__PURE__ */ Z("<p class=\"svelte-apy39n\">This is the second receiver. Manage both tuners from the main window.</p>"), Xi = /* @__PURE__ */ Z("<div class=\"receiver-workspace svelte-apy39n\"><details class=\"receiver-island svelte-apy39n\" open=\"\" aria-label=\"Receiver card\"><summary class=\"receiver-island__summary svelte-apy39n\"><strong>Receiver</strong> <span class=\"svelte-apy39n\"> </span></summary> <div class=\"receiver-island__body svelte-apy39n\"><header class=\"receiver-island__identity svelte-apy39n\"><label id=\"receiver-modern-profile-slot\" for=\"openwebrx-sdr-profiles-listbox\" class=\"receiver-island__profile-select svelte-apy39n\">Source / profile</label> <button type=\"button\" class=\"receiver-island__bookmark svelte-apy39n\">Save station</button></header> <span class=\"receiver-island__header-message svelte-apy39n\" aria-live=\"polite\"> </span> <div class=\"receiver-island__listening-bar svelte-apy39n\"><form class=\"receiver-island__tuning svelte-apy39n\"><button type=\"button\" class=\"receiver-island__nudge svelte-apy39n\" aria-label=\"Tune down one step\">−</button> <label class=\"receiver-island__frequency-label svelte-apy39n\" for=\"receiver-modern-frequency\">FREQUENCY · MHz</label> <input id=\"receiver-modern-frequency\" class=\"receiver-island__frequency svelte-apy39n\" type=\"number\" inputmode=\"decimal\" min=\"0.001\" step=\"0.000001\" aria-describedby=\"receiver-modern-tune-message\" aria-label=\"Tune frequency in megahertz\"/> <button type=\"submit\" class=\"receiver-island__apply svelte-apy39n\">Tune</button> <button type=\"button\" class=\"receiver-island__nudge svelte-apy39n\" aria-label=\"Tune up one step\">+</button> <span class=\"receiver-island__step svelte-apy39n\"> </span> <span id=\"receiver-modern-tune-message\" class=\"receiver-island__message svelte-apy39n\" aria-live=\"polite\"> </span></form> <form class=\"receiver-island__mode-picker svelte-apy39n\" aria-label=\"Select receiver mode\"><label for=\"receiver-modern-mode\">MODE</label> <select id=\"receiver-modern-mode\" aria-describedby=\"receiver-modern-mode-message\" class=\"svelte-apy39n\"><!></select> <button type=\"submit\" class=\"receiver-island__apply svelte-apy39n\">Apply</button> <span id=\"receiver-modern-mode-message\" class=\"receiver-island__message svelte-apy39n\" aria-live=\"polite\"> </span></form> <div class=\"receiver-island__audio svelte-apy39n\" aria-label=\"Audio controls\"><button type=\"button\" class=\"receiver-island__mute svelte-apy39n\"> </button> <!> <label for=\"receiver-modern-volume\" class=\"svelte-apy39n\">VOLUME</label> <input id=\"receiver-modern-volume\" type=\"range\" min=\"0\" max=\"150\" step=\"1\" aria-label=\"Audio volume\" class=\"svelte-apy39n\"/> <output for=\"receiver-modern-volume\" class=\"svelte-apy39n\"> </output> <span class=\"receiver-island__record-message svelte-apy39n\" aria-live=\"polite\"> </span></div></div> <div class=\"receiver-island__status svelte-apy39n\" aria-label=\"Receiver status\"><span><i aria-hidden=\"true\" class=\"svelte-apy39n\"></i> </span> <span><i aria-hidden=\"true\" class=\"svelte-apy39n\"></i> </span> <span><i aria-hidden=\"true\" class=\"svelte-apy39n\"></i> </span> <!> <!> <span><i aria-hidden=\"true\" class=\"svelte-apy39n\"></i> </span> <span class=\"receiver-island__status-step svelte-apy39n\"> </span></div> <div id=\"receiver-modern-meter-slot\" aria-label=\"Signal strength\"></div> <button type=\"button\" class=\"receiver-island__advanced-toggle svelte-apy39n\" aria-controls=\"receiver-modern-rf-slot\"> </button> <div id=\"receiver-modern-rf-slot\"></div></div></details> <nav class=\"receiver-workspace__dock svelte-apy39n\" aria-label=\"Listening workspace cards\"><button type=\"button\" class=\"receiver-workspace__focus svelte-apy39n\">Clear view</button> <details class=\"receiver-workspace__card svelte-apy39n\"><summary class=\"svelte-apy39n\">Display</summary> <div class=\"receiver-workspace__card-body svelte-apy39n\"><h2 class=\"svelte-apy39n\">Spectrum &amp; waterfall</h2> <div class=\"receiver-island__waterfall-controls svelte-apy39n\" aria-label=\"Waterfall controls\"><span class=\"receiver-island__waterfall-label svelte-apy39n\"> </span> <button type=\"button\" class=\"receiver-island__zoom svelte-apy39n\">Zoom out</button> <button type=\"button\" class=\"receiver-island__zoom svelte-apy39n\">Zoom in</button> <button type=\"button\" class=\"receiver-island__zoom svelte-apy39n\">Full spectrum</button> <button type=\"button\" class=\"receiver-island__zoom svelte-apy39n\">Auto levels</button> <button type=\"button\" class=\"receiver-island__zoom svelte-apy39n\">Reset range</button> <span class=\"receiver-island__message svelte-apy39n\" aria-live=\"polite\"> </span></div> <div id=\"receiver-modern-levels-slot\" class=\"receiver-workspace__levels svelte-apy39n\"></div> <div id=\"receiver-modern-display-slot\"></div></div></details> <details class=\"receiver-workspace__card svelte-apy39n\"><summary class=\"svelte-apy39n\">Preferences</summary> <div class=\"receiver-workspace__card-body svelte-apy39n\"><h2 class=\"svelte-apy39n\">Appearance &amp; gestures</h2> <div id=\"receiver-modern-preferences-slot\"></div></div></details> <details class=\"receiver-workspace__card svelte-apy39n\"><summary class=\"svelte-apy39n\"> </summary> <div class=\"receiver-workspace__card-body svelte-apy39n\"><h2 class=\"svelte-apy39n\">Decoded activity</h2> <div class=\"receiver-island__waterfall-controls svelte-apy39n\" aria-label=\"Waterfall controls\"><span class=\"receiver-island__waterfall-label svelte-apy39n\"> </span> <button type=\"button\" class=\"receiver-island__zoom svelte-apy39n\">Zoom out</button> <button type=\"button\" class=\"receiver-island__zoom svelte-apy39n\">Zoom in</button> <button type=\"button\" class=\"receiver-island__zoom svelte-apy39n\">Full spectrum</button> <button type=\"button\" class=\"receiver-island__zoom svelte-apy39n\">Auto levels</button> <button type=\"button\" class=\"receiver-island__zoom svelte-apy39n\">Reset range</button> <span class=\"receiver-island__message svelte-apy39n\" aria-live=\"polite\"> </span></div> <!> <!></div></details> <details class=\"receiver-island__layouts receiver-workspace__card svelte-apy39n\"><summary class=\"svelte-apy39n\">Saved stations <span class=\"svelte-apy39n\"> </span></summary> <div class=\"receiver-island__layouts-panel receiver-workspace__card-body svelte-apy39n\"><form class=\"receiver-island__layout-save svelte-apy39n\"><label for=\"receiver-modern-layout-name\" class=\"svelte-apy39n\">SAVE CURRENT FREQUENCY + MODE</label> <input id=\"receiver-modern-layout-name\" maxlength=\"48\" placeholder=\"Station name\" autocomplete=\"off\" class=\"svelte-apy39n\"/> <button type=\"submit\" class=\"receiver-island__apply svelte-apy39n\">Save</button></form> <!> <span class=\"receiver-island__layout-message svelte-apy39n\" aria-live=\"polite\"> </span></div></details> <details class=\"receiver-island__history receiver-workspace__card svelte-apy39n\"><summary class=\"svelte-apy39n\"> </summary> <div class=\"receiver-workspace__card-body svelte-apy39n\"><h2 class=\"svelte-apy39n\">Reception history</h2> <div class=\"receiver-island__history-tools svelte-apy39n\"><label for=\"receiver-modern-history-search\" class=\"svelte-apy39n\">Search time, frequency, mode, source, or decoded content</label> <input id=\"receiver-modern-history-search\" type=\"search\" autocomplete=\"off\" class=\"svelte-apy39n\"/> <button type=\"button\" class=\"svelte-apy39n\">Clear history</button> <span role=\"status\" aria-live=\"polite\" class=\"svelte-apy39n\"> </span></div> <!></div></details> <details class=\"receiver-workspace__card svelte-apy39n\"><summary class=\"svelte-apy39n\">Tools</summary> <div class=\"receiver-workspace__card-body receiver-workspace__tools svelte-apy39n\"><h2 class=\"svelte-apy39n\">Receiver windows</h2> <!> <span aria-live=\"polite\"> </span></div></details></nav></div>");
function Zi(e, t) {
	Be(t, !0);
	let n = "openwebrx.reception-history.v1", r = 864e13, i = /* @__PURE__ */ P(Ht({
		profileName: "Live receiver",
		frequencyHz: null,
		tuningStepHz: 1,
		connection: "starting",
		audio: "waiting",
		recording: !1,
		recordingAllowed: !1,
		volume: 100,
		muted: !1,
		audioDroppedSamples: 0,
		deviceName: null,
		deviceState: "unknown",
		deviceSeverity: "info",
		deviceMessage: null,
		decoderError: null,
		mode: "No mode",
		availableModes: [],
		modeCapabilities: [],
		decoder: "off",
		waterfallZoomLevel: 0,
		waterfallZoomMaximum: 0
	})), a = /* @__PURE__ */ P(""), o = /* @__PURE__ */ P(""), s = /* @__PURE__ */ P(!1), c = /* @__PURE__ */ P(!1), l = /* @__PURE__ */ P(""), u = /* @__PURE__ */ P(""), d = /* @__PURE__ */ P(""), f = /* @__PURE__ */ P(""), p = /* @__PURE__ */ P(""), m = /* @__PURE__ */ P(""), h = /* @__PURE__ */ P(""), g = /* @__PURE__ */ P(!1), _ = /* @__PURE__ */ P(!1), v, ee = null, te = /* @__PURE__ */ P(!1), y = null, b = null, ne = null, re = "", x = /* @__PURE__ */ P(Ht([])), S = /* @__PURE__ */ P(""), ie = /* @__PURE__ */ P(""), C = /* @__PURE__ */ P(""), ae = /* @__PURE__ */ P("waiting for receiver audio"), oe = /* @__PURE__ */ P(Ht([])), se = /* @__PURE__ */ P(Ht([])), ce = /* @__PURE__ */ P(Ht([])), le = /* @__PURE__ */ P(Ht([])), ue = /* @__PURE__ */ P(""), de = /* @__PURE__ */ P(""), fe = /* @__PURE__ */ st(() => {
		let e = J(ue).trim().toLocaleLowerCase();
		return e ? J(le).filter((t) => [
			new Date(t.timestampMs).toISOString(),
			new Date(t.timestampMs).toLocaleString(),
			t.mode,
			t.profile,
			t.content,
			t.frequencyHz === null ? "" : String(t.frequencyHz),
			t.frequencyHz === null ? "" : (t.frequencyHz / 1e6).toFixed(6)
		].some((t) => t.toLocaleLowerCase().includes(e))) : J(le);
	});
	function pe() {
		try {
			let e = localStorage.getItem(n) ?? "[]";
			if (e.length > 15e5) return [];
			let t = JSON.parse(e);
			return Array.isArray(t) ? t.filter((e) => !!e && Number.isFinite(e.timestampMs) && e.timestampMs >= 0 && e.timestampMs <= r && (e.frequencyHz === null || Number.isFinite(e.frequencyHz) && e.frequencyHz > 0 && e.frequencyHz <= 0xe8d4a51000) && typeof e.mode == "string" && e.mode.length <= 48 && typeof e.profile == "string" && e.profile.length <= 80 && typeof e.content == "string" && e.content.length <= 2048).slice(0, 500) : [];
		} catch {
			return [];
		}
	}
	function me() {
		F(le, [], !0), F(de, "");
		try {
			localStorage.removeItem(n);
		} catch {
			F(de, "Could not clear browser storage");
		}
	}
	function w(e) {
		(e.key === n || e.key === null) && F(le, pe(), !0);
	}
	ii(() => {
		document.body.classList.add("receiver-modern-modes-mounted");
		let e = ai(), t = (e) => {
			e.target instanceof Element && e.target.closest("[data-toggle-panel=\"openwebrx-panel-receiver\"]") && (e.stopImmediatePropagation(), v.open = !v.open, document.body.classList.remove("receiver-modern-focus"));
		};
		document.addEventListener("click", t, !0), F(te, document.body.classList.contains("receiver-modern-secondary-document"), !0), F(le, pe(), !0);
		let l = (e) => {
			let t = e.detail;
			if (!t || t.schema_version !== 1 || !Number.isFinite(t.timestamp_ms) || Number(t.timestamp_ms) < 0 || Number(t.timestamp_ms) > r || !(t.frequency_hz === null || Number.isFinite(t.frequency_hz) && Number(t.frequency_hz) > 0 && Number(t.frequency_hz) <= 0xe8d4a51000) || typeof t.mode != "string" || !t.mode.trim() || t.mode.length > 48 || typeof t.profile != "string" || t.profile.length > 80 || typeof t.content != "string" || !t.content.trim() || t.content.length > 2048) return;
			let i = {
				timestampMs: Number(t.timestamp_ms),
				frequencyHz: t.frequency_hz === null ? null : Number(t.frequency_hz),
				mode: t.mode,
				profile: t.profile,
				content: t.content
			};
			F(le, [i, ...pe()].slice(0, 500), !0);
			try {
				localStorage.setItem(n, JSON.stringify(J(le))), F(de, "");
			} catch {
				F(de, "History is available for this page only; browser storage is full");
			}
		};
		window.addEventListener("openwebrx:reception", l), window.addEventListener("storage", w);
		let u = (e) => {
			e.key === "Escape" && (J(_) ? (F(_, !1), document.body.classList.remove("receiver-modern-advanced-open"), document.querySelector(".receiver-island__advanced-toggle")?.focus()) : (he(), ee?.focus()));
		};
		window.addEventListener("keydown", u), re = yi() ?? "", F(x, Di(re || null), !0);
		let d = (e) => {
			let t = e.detail;
			!t || t.schema_version !== 1 || !Number.isInteger(t.port) || Number(t.port) < 0 || Number(t.port) > 15 || !Number.isInteger(t.command) || Number(t.command) < 0 || Number(t.command) > 15 || !Number.isInteger(t.payload_bytes) || Number(t.payload_bytes) < 0 || Number(t.payload_bytes) > 4096 || typeof t.payload_hex != "string" || t.payload_hex.length > 8192 || !/^(?:[0-9a-f]{2})*$/i.test(t.payload_hex) || t.payload_hex.length !== Number(t.payload_bytes) * 2 || (F(oe, [{
				port: Number(t.port),
				command: Number(t.command),
				payloadBytes: Number(t.payload_bytes),
				payloadHex: t.payload_hex.slice(0, 2048),
				receivedAt: Number.isFinite(t.received_at) ? Number(t.received_at) : Date.now() / 1e3
			}, ...J(oe)].slice(0, 10), !0), F(ae, "frames received"));
		}, f = (e) => {
			let t = e.detail, n = String(t?.state ?? "");
			if (t && t.schema_version === 1) {
				if ([
					"busy",
					"idle",
					"heard",
					"lost",
					"missed",
					"dropped"
				].includes(n)) {
					let e = "";
					if (n === "busy" || n === "idle") {
						if (typeof t.busy != "boolean" || t.busy !== (n === "busy")) return;
						e = n === "busy" ? "channel busy" : "channel clear", F(ae, n === "busy" ? "channel busy" : "listening · channel clear", !0);
					} else if (n === "heard") {
						if (!Number.isInteger(t.port) || Number(t.port) < 0 || Number(t.port) > 15 || t.call !== void 0 && (typeof t.call != "string" || !/^[A-Z0-9/-]{1,10}$/.test(t.call))) return;
						e = `burst checked · KISS ${t.port}${t.call ? ` · ${t.call}` : ""}`, F(ae, e, !0);
					} else if (n === "lost" || n === "dropped") {
						if (!Number.isInteger(t.port) || Number(t.port) < 0 || Number(t.port) > 15 || !Number.isInteger(t.count) || Number(t.count) < 0 || Number(t.count) > 999999) return;
						e = n === "lost" ? `burst incomplete · KISS ${t.port} · ${t.count} lost` : `frames dropped · KISS ${t.port} · ${t.count}`, F(ae, e, !0);
					} else {
						if (typeof t.submode != "string" || !/^[A-Za-z0-9./_-]{1,48}$/.test(t.submode) || !Number.isInteger(t.codewords) || Number(t.codewords) < 0 || Number(t.codewords) > 999) return;
						e = `possible missed burst · ${t.submode} · ${t.codewords} codewords`, F(ae, e, !0);
					}
					F(ce, [{
						text: e,
						receivedAt: Date.now() / 1e3
					}, ...J(ce)].slice(0, 20), !0);
				} else [
					"listening",
					"audio_overrun",
					"error",
					"restarting"
				].includes(n) && F(ae, n === "listening" ? "listening · 8 kHz RX" : n === "audio_overrun" ? `audio queue dropped ${Number(t.dropped_chunks) || 0} chunks` : n === "error" ? `worker error · ${String(t.message ?? "unknown").slice(0, 160)}` : n, !0);
			}
		}, p = (e) => {
			let t = e.detail, n = t?.message;
			if (!t || t.schema_version !== 1 || !n || typeof n != "object") return;
			let r = n;
			typeof r.source == "string" && typeof r.destination == "string" && typeof r.data == "string" && (F(se, [{
				source: r.source.slice(0, 16),
				destination: r.destination.slice(0, 16),
				text: r.data.slice(0, 512),
				receivedAt: Number.isFinite(t.received_at) ? Number(t.received_at) : Date.now() / 1e3
			}, ...J(se)].slice(0, 20), !0), F(ae, "APRS decoded"));
		};
		window.addEventListener("openwebrx:data2g-frame", d), window.addEventListener("openwebrx:data2g-status", f), window.addEventListener("openwebrx:data2g-aprs", p);
		let m = xi((e) => {
			F(i, e, !0);
			let t = yi() ?? "";
			t !== re && (re = t, F(x, Di(re || null), !0), F(S, "")), J(s) || F(a, e.frequencyHz === null ? "" : (e.frequencyHz / 1e6).toFixed(6), !0), J(c) || F(o, e.availableModes.find((t) => t.modulation === e.mode)?.name ?? e.mode, !0);
		});
		return () => {
			m(), window.removeEventListener("keydown", u), window.removeEventListener("openwebrx:reception", l), window.removeEventListener("storage", w), window.removeEventListener("openwebrx:data2g-frame", d), window.removeEventListener("openwebrx:data2g-status", f), window.removeEventListener("openwebrx:data2g-aprs", p), y !== null && window.clearInterval(y), b !== null && window.clearInterval(b), ne?.remove(), document.body.classList.remove("receiver-modern-dual"), document.body.classList.remove("receiver-modern-advanced-open"), document.documentElement.classList.remove("receiver-modern-dual-document"), document.body.classList.remove("receiver-modern-modes-mounted", "receiver-modern-focus"), document.removeEventListener("click", t, !0), e();
		};
	});
	function he() {
		document.querySelectorAll(".receiver-workspace__card[open]").forEach((e) => e.open = !1);
	}
	function ge(e) {
		let t = e.currentTarget;
		t instanceof HTMLDetailsElement && t.open && (ee = t.querySelector("summary"), document.body.classList.remove("receiver-modern-focus"), document.querySelectorAll(".receiver-workspace__card[open]").forEach((e) => {
			e !== t && (e.open = !1);
		}));
	}
	function _e() {
		he(), v.open = !1, document.body.classList.add("receiver-modern-focus"), F(_, !1), document.body.classList.remove("receiver-modern-advanced-open");
	}
	function ve() {
		F(_, !J(_)), document.body.classList.toggle("receiver-modern-advanced-open", J(_));
	}
	function ye(e) {
		T(e);
	}
	function T(e) {
		J(i).frequencyHz !== null && (di(J(i).frequencyHz + e * J(i).tuningStepHz) && F(i, ui(), !0), F(l, ""));
	}
	function be(e) {
		let t = e.key === "ArrowUp" || e.key === "PageUp" ? 1 : e.key === "ArrowDown" || e.key === "PageDown" ? -1 : 0;
		t && (e.preventDefault(), T(t * (e.key === "PageUp" || e.key === "PageDown" ? 10 : 1)));
	}
	function E(e) {
		e.preventDefault();
		let t = Number(J(a));
		!Number.isFinite(t) || t <= 0 || !di(t * 1e6) ? F(l, "Frequency unavailable") : (F(s, !1), F(i, ui(), !0), F(l, ""));
	}
	function D(e) {
		let t = e.currentTarget;
		t instanceof HTMLInputElement && (fi(Number(t.value)), F(i, ui(), !0));
	}
	function xe() {
		pi(), F(i, ui(), !0);
	}
	function Ce() {
		mi(!J(i).recording) ? (F(p, ""), F(i, ui(), !0)) : F(p, "Recording unavailable");
	}
	function we(e) {
		hi(e), F(i, ui(), !0);
	}
	function Te(e) {
		F(m, gi(e) ? "" : "Waterfall controls unavailable", !0);
	}
	function Ee() {
		F(d, vi() ? "" : "Bookmark controls unavailable", !0);
	}
	function De() {
		if (J(i).frequencyHz === null || J(i).mode === "No mode") {
			F(C, "Tune a frequency and select a mode before saving");
			return;
		}
		let e = Oi(re || null, {
			name: J(ie),
			frequencyHz: J(i).frequencyHz,
			modulation: J(i).mode
		});
		if (!e) {
			F(C, J(ie).trim() ? "Could not save layout in this browser" : "Enter a layout name", !0);
			return;
		}
		F(x, e, !0);
		let t = e.find((e) => e.name.toLocaleLowerCase() === J(ie).trim().toLocaleLowerCase());
		F(S, t?.id ?? "", !0), F(ie, ""), F(C, "Layout saved for this receiver profile");
	}
	function Oe() {
		let e = J(x).find((e) => e.id === J(S));
		e ? J(i).availableModes.some((t) => t.modulation === e.modulation) ? !_i(e.modulation) || !di(e.frequencyHz) ? F(C, "Could not apply the saved layout") : (F(c, !1), F(s, !1), F(o, J(i).availableModes.find((t) => t.modulation === e.modulation)?.name ?? e.modulation, !0), F(a, (e.frequencyHz / 1e6).toFixed(6), !0), F(i, ui(), !0), F(C, `Applied ${e.name}`)) : F(C, "Saved mode is unavailable on this receiver") : F(C, "Choose a saved station");
	}
	function ke() {
		let e = ki(re || null, J(S));
		e ? (F(x, e, !0), F(S, ""), F(C, "Saved layout removed")) : F(C, "Could not update saved layouts in this browser");
	}
	function Ae() {
		b !== null && window.clearInterval(b), F(h, "");
		let e = bi();
		if (!e) {
			F(f, "Configure a second enabled source for the other tuner");
			return;
		}
		let t = window.open(window.location.href, "openwebrx-second-receiver", "popup,width=1100,height=760");
		if (t === null) F(f, "Allow popups to open another receiver");
		else try {
			t.opener = null, F(f, "Opening second receiver…");
			let n = 0;
			b = window.setInterval(() => {
				n += 1;
				try {
					if (t.closed) {
						b !== null && window.clearInterval(b), b = null, F(f, "Second receiver window closed");
						return;
					}
					let r = t.OpenWebRXReceiver, i = r?.getProfiles().some((t) => t.id === e.id);
					r && i && r.selectProfile(e.id) ? (b !== null && window.clearInterval(b), b = null, F(f, `Second receiver opened on ${e.name}`)) : n >= 100 && (b !== null && window.clearInterval(b), b = null, F(f, `Could not select ${e.name} in the second receiver window`));
				} catch {
					b !== null && window.clearInterval(b), b = null, F(f, "Second receiver window is unavailable");
				}
			}, 200);
		} catch {
			F(f, "Choose another profile in the second receiver window");
		}
	}
	function je() {
		if (J(g)) {
			y !== null && window.clearInterval(y), y = null, ne?.remove(), ne = null, F(g, !1), document.body.classList.remove("receiver-modern-dual"), document.documentElement.classList.remove("receiver-modern-dual-document"), F(h, "Second receiver closed");
			return;
		}
		let e = bi(), t = document.getElementById("receiver-modern-secondary");
		if (!e || !t) {
			F(h, "Configure a second enabled source for the other tuner");
			return;
		}
		let n = new URL(window.location.href);
		n.searchParams.set("receiver-pane", "secondary");
		let r = document.createElement("iframe");
		r.title = `${e.name} receiver`, r.setAttribute("allow", "autoplay"), r.setAttribute("loading", "eager"), r.src = n.toString(), t.replaceChildren(r), ne = r, F(g, !0), document.body.classList.add("receiver-modern-dual"), document.documentElement.classList.add("receiver-modern-dual-document"), F(h, `Connecting ${e.name}…`);
		let i = 0;
		y = window.setInterval(() => {
			i += 1;
			try {
				if (r.contentWindow?.closed) {
					y !== null && window.clearInterval(y), y = null;
					return;
				}
				let t = r.contentWindow?.OpenWebRXReceiver, n = t?.getProfiles().some((t) => t.id === e.id);
				t && n && t.selectProfile(e.id) ? (y !== null && window.clearInterval(y), y = null, F(h, `Second tuner connected · ${e.name}`)) : i >= 120 && (y !== null && window.clearInterval(y), y = null, F(h, `Second tuner not available · ${e.name}`));
			} catch {
				y !== null && window.clearInterval(y), y = null, F(h, "Second receiver could not be reached");
			}
		}, 250);
	}
	function Me(e) {
		return {
			wsjtx: "WSJT-X decoders",
			wsjtx_2_3: "WSJT-X 2.3 or newer",
			wsjtx_2_4: "WSJT-X 2.4 or newer",
			msk144decoder: "MSK144 decoder",
			js8: "JS8Call",
			js8py: "JS8 Python decoder"
		}[e] ?? e.replaceAll("_", " ");
	}
	function Ne(e) {
		return `Unavailable: requires ${e.map(Me).join(", ")}`;
	}
	function Pe(e) {
		e.preventDefault();
		let t = J(o).trim().toLocaleLowerCase(), n = J(i).availableModes.find((e) => e.name.toLocaleLowerCase() === t || e.modulation.toLocaleLowerCase() === t), r = J(i).modeCapabilities.find((e) => !e.available && (e.name.toLocaleLowerCase() === t || e.modulation.toLocaleLowerCase() === t));
		r ? F(u, Ne(r.missing_requirements), !0) : !n || !_i(n.modulation) ? F(u, "Choose an available receiver mode") : (F(u, ""), F(c, !1), F(o, n.name, !0), F(i, ui(), !0));
	}
	var Fe = Xi(), Ie = L(Fe), Le = L(Ie), Re = R(z(L(Le), 2));
	O(Le);
	var k = z(Le, 2), ze = L(k), He = z(L(ze), 2);
	O(ze);
	var Ue = z(ze, 2), We = R(Ue, !0), Ge = z(Ue, 2), A = L(Ge), Ke = L(A), qe = z(Ke, 4);
	qr(qe);
	var j = z(qe, 4), Je = z(j, 2), Ye = R(Je), Xe = R(z(Je, 2), !0);
	O(A);
	var Ze = z(A, 2), Qe = z(L(Ze), 2), $e = L(Qe), et = (e) => {
		var t = pr();
		Dr(Qt(t), 17, () => J(i).modeCapabilities, (e) => e.modulation, (e, t) => {
			var n = Ai(), r = R(n), i = {};
			B((e) => {
				n.disabled = !J(t).available, $(r, `${J(t).name ?? ""}${e ?? ""}`), i !== (i = J(t).name) && (n.value = (n.__value = i) ?? "");
			}, [() => J(t).available ? "" : ` · ${Ne(J(t).missing_requirements)}`]), Q(e, n);
		}), Q(e, t);
	}, tt = (e) => {
		var t = pr();
		Dr(Qt(t), 17, () => J(i).availableModes, (e) => e.modulation, (e, t) => {
			var n = Ai(), r = R(n, !0), i = {};
			B(() => {
				$(r, J(t).name), i !== (i = J(t).name) && (n.value = (n.__value = i) ?? "");
			}), Q(e, n);
		}), Q(e, t);
	};
	Cr($e, (e) => {
		J(i).modeCapabilities.length ? e(et) : e(tt, -1);
	}), O(Qe), zr(Qe);
	var nt = R(z(Qe, 4), !0);
	O(Ze);
	var rt = z(Ze, 2), it = L(rt), at = R(it, !0), ot = z(it, 2), ct = (e) => {
		var t = ji(), n = R(t, !0);
		B(() => {
			Yr(t, "aria-pressed", J(i).recording), t.disabled = !J(i).recording && J(i).audio !== "playing", $(n, J(i).recording ? "Stop recording" : "Record");
		}), X("click", t, Ce), Q(e, t);
	};
	Cr(ot, (e) => {
		(J(i).recordingAllowed || J(i).recording) && e(ct);
	});
	var lt = z(ot, 4);
	qr(lt);
	var ut = z(lt, 2), dt = R(ut), ft = R(z(ut, 2), !0);
	O(rt), O(Ge);
	var pt = z(Ge, 2), mt = L(pt);
	let M;
	var ht = z(L(mt), 1, !0);
	O(mt);
	var N = z(mt, 2);
	let gt;
	var _t = z(L(N));
	O(N);
	var vt = z(N, 2);
	let yt;
	var bt = z(L(vt), 1, !0);
	O(vt);
	var xt = z(vt, 2), St = (e) => {
		var t = Mi(), n = R(t);
		B((e) => $(n, `Audio buffer dropped ${e ?? ""} samples`), [() => J(i).audioDroppedSamples.toLocaleString()]), Q(e, t);
	};
	Cr(xt, (e) => {
		J(i).audioDroppedSamples > 0 && e(St);
	});
	var Ct = z(xt, 2), wt = (e) => {
		var t = Ni(), n = R(t);
		B(() => {
			Yr(t, "title", J(i).decoderError), $(n, `Decoder error · ${J(i).decoderError ?? ""}`);
		}), Q(e, t);
	};
	Cr(Ct, (e) => {
		J(i).decoderError && e(wt);
	});
	var Tt = z(Ct, 2);
	let Et;
	var Dt = z(L(Tt), 1, !0);
	O(Tt);
	var Ot = R(z(Tt, 2));
	O(pt);
	var kt = z(pt, 4), At = R(kt, !0), jt = z(kt, 2);
	O(k), O(Ie), ri(Ie, (e) => v = e, () => v);
	var Mt = z(Ie, 2), Nt = L(Mt), Pt = z(Nt, 2), Ft = z(L(Pt), 2), It = z(L(Ft), 2), Lt = L(It), Rt = R(Lt), zt = z(Lt, 2), Bt = z(zt, 2), Vt = z(Bt, 2), Ut = z(Vt, 2), Wt = z(Ut, 2), Gt = R(z(Wt, 2), !0);
	O(It), Se(4), O(Ft), O(Pt);
	var Kt = z(Pt, 2), qt = z(Kt, 2), Jt = L(qt), Yt = R(Jt), I = z(Jt, 2), Xt = z(L(I), 2), Zt = L(Xt), $t = R(Zt), en = z(Zt, 2), tn = z(en, 2), nn = z(tn, 2), rn = z(nn, 2), an = z(rn, 2), on = R(z(an, 2), !0);
	O(Xt);
	var sn = z(Xt, 2), cn = (e) => {
		var t = Vi(), n = L(t), r = R(z(L(n), 2), !0);
		O(n);
		var i = z(n, 2), a = (e) => {
			var t = Fi();
			Dr(t, 23, () => J(se), (e, t) => e.receivedAt + ":" + t, (e, t) => {
				var n = Pi(), r = L(n), i = R(r), a = R(z(r, 2), !0);
				O(n), B((e) => {
					$(i, `${e ?? ""} · ${J(t).source ?? ""} → ${J(t).destination ?? ""}`), $(a, J(t).text);
				}, [() => (/* @__PURE__ */ new Date(J(t).receivedAt * 1e3)).toLocaleTimeString()]), Q(e, n);
			}), O(t), Q(e, t);
		};
		Cr(i, (e) => {
			J(se).length && e(a);
		});
		var o = z(i, 2), s = (e) => {
			var t = Li();
			Dr(t, 23, () => J(oe), (e, t) => e.receivedAt + ":" + t, (e, t) => {
				var n = Ii(), r = L(n), i = R(r), a = R(z(r, 2), !0);
				O(n), B((e) => {
					$(i, `${e ?? ""} · KISS ${J(t).port ?? ""} · ${J(t).command === 0 ? "DATA" : `CMD ${J(t).command}`} · ${J(t).payloadBytes ?? ""} B`), $(a, J(t).payloadHex);
				}, [() => (/* @__PURE__ */ new Date(J(t).receivedAt * 1e3)).toLocaleTimeString()]), Q(e, n);
			}), O(t), Q(e, t);
		}, c = (e) => {
			Q(e, Ri());
		};
		Cr(o, (e) => {
			J(oe).length ? e(s) : J(se).length || e(c, 1);
		});
		var l = z(o, 2), u = (e) => {
			var t = Bi();
			Dr(t, 23, () => J(ce), (e, t) => e.receivedAt + ":" + t, (e, t) => {
				var n = zi(), r = R(n);
				B((e) => $(r, `${e ?? ""} · ${J(t).text ?? ""}`), [() => (/* @__PURE__ */ new Date(J(t).receivedAt * 1e3)).toLocaleTimeString()]), Q(e, n);
			}), O(t), Q(e, t);
		};
		Cr(l, (e) => {
			J(ce).length && e(u);
		}), O(t), B(() => $(r, J(ae))), Q(e, t);
	}, ln = /* @__PURE__ */ st(() => J(i).mode.toLocaleLowerCase() === "data2g");
	Cr(sn, (e) => {
		J(ln) && e(cn);
	});
	var un = z(sn, 2), dn = (e) => {
		Q(e, Hi());
	}, fn = /* @__PURE__ */ st(() => J(i).mode.toLocaleLowerCase() !== "data2g");
	Cr(un, (e) => {
		J(fn) && e(dn);
	}), O(I), O(qt);
	var pn = z(qt, 2), mn = L(pn), hn = R(z(L(mn)), !0);
	O(mn);
	var gn = z(mn, 2), _n = L(gn), V = z(L(_n), 2);
	qr(V), Se(2), O(_n);
	var vn = z(_n, 2), yn = (e) => {
		var t = Ui(), n = z(Qt(t), 2), r = L(n), i = L(r);
		i.value = i.__value = "", Dr(z(i), 17, () => J(x), (e) => e.id, (e, t) => {
			var n = Ai(), r = R(n), i = {};
			B((e) => {
				$(r, `${J(t).name ?? ""} · ${e ?? ""} MHz · ${J(t).modulation ?? ""}`), i !== (i = J(t).id) && (n.value = (n.__value = i) ?? "");
			}, [() => (J(t).frequencyHz / 1e6).toFixed(6)]), Q(e, n);
		}), O(r), zr(r);
		var a = z(r, 2), o = z(a, 2);
		O(n), B(() => {
			a.disabled = !J(S), o.disabled = !J(S);
		}), Br(r, () => J(S), (e) => F(S, e)), X("click", a, Oe), X("click", o, ke), Q(e, t);
	}, bn = (e) => {
		Q(e, Wi());
	};
	Cr(vn, (e) => {
		J(x).length ? e(yn) : e(bn, -1);
	});
	var H = R(z(vn, 2), !0);
	O(gn), O(pn);
	var xn = z(pn, 2), Sn = L(xn), Cn = R(Sn), wn = z(Sn, 2), Tn = z(L(wn), 2), En = z(L(Tn), 2);
	qr(En);
	var Dn = z(En, 2), On = R(z(Dn, 2), !0);
	O(Tn);
	var kn = z(Tn, 2), An = (e) => {
		var t = Ki();
		Dr(t, 23, () => J(fe), (e, t) => `${e.timestampMs}:${t}`, (e, t) => {
			var n = Gi(), r = L(n), i = L(r), a = R(i, !0), o = z(i, 2), s = R(o, !0), c = z(o, 2), l = R(c, !0), u = R(z(c, 2), !0);
			O(r);
			var d = R(z(r, 2), !0);
			O(n), B((e, n, r) => {
				Yr(i, "datetime", e), $(a, n), $(s, r), $(l, J(t).mode), $(u, J(t).profile), $(d, J(t).content);
			}, [
				() => new Date(J(t).timestampMs).toISOString(),
				() => new Date(J(t).timestampMs).toLocaleString(),
				() => J(t).frequencyHz === null ? "Frequency unknown" : `${(J(t).frequencyHz / 1e6).toFixed(6)} MHz`
			]), Q(e, n);
		}), O(t), Q(e, t);
	}, U = (e) => {
		var t = qi(), n = R(t, !0);
		B(() => $(n, J(ue) ? "No receptions match this search." : "Decoded receptions will appear here.")), Q(e, t);
	};
	Cr(kn, (e) => {
		J(fe).length ? e(An) : e(U, -1);
	}), O(wn), O(xn);
	var W = z(xn, 2), G = z(L(W), 2), K = z(L(G), 2), jn = (e) => {
		var t = Ji(), n = Qt(t), r = R(n, !0), i = z(n, 2);
		B(() => {
			Yr(n, "aria-pressed", J(g)), $(r, J(g) ? "Close second tuner" : "Dual tuner view");
		}), X("click", n, je), X("click", i, Ae), Q(e, t);
	}, Mn = (e) => {
		Q(e, Yi());
	};
	Cr(K, (e) => {
		J(te) ? e(Mn, -1) : e(jn);
	});
	var Nn = R(z(K, 2), !0);
	O(G), O(W), O(Mt), O(Fe), B((e, t, n, r, a) => {
		$(Re, `${e ?? ""} · ${J(i).mode ?? ""}`), $(We, J(d)), $(Ye, `${t ?? ""} Hz step`), $(Xe, J(l)), $(nt, J(u)), Yr(it, "aria-pressed", J(i).muted), it.disabled = J(i).audio !== "playing", $(at, J(i).audio === "playing" ? J(i).muted ? "Unmute" : "Mute" : "Audio waiting"), Jr(lt, J(i).volume), lt.disabled = J(i).audio !== "playing" || J(i).muted, $(dt, `${J(i).volume ?? ""}%`), $(ft, J(p)), M = Fr(mt, 1, "receiver-island__status-item svelte-apy39n", null, M, { "receiver-island__status--active": J(i).connection === "connected" }), $(ht, J(i).connection === "connected" ? "Connected" : J(i).connection === "starting" ? "Starting" : "Reconnecting"), gt = Fr(N, 1, "receiver-island__status-item svelte-apy39n", null, gt, {
			"receiver-island__status--active": J(i).deviceState === "running",
			"receiver-island__health-warning": J(i).deviceSeverity === "warning",
			"receiver-island__health-error": J(i).deviceSeverity === "error"
		}), Yr(N, "title", J(i).deviceMessage ?? ""), Yr(N, "aria-label", `SDR ${J(i).deviceName ?? "source"}: ${J(i).deviceState}`), $(_t, `${J(i).deviceName ?? "SDR" ?? ""} · ${n ?? ""}`), yt = Fr(vt, 1, "receiver-island__status-item svelte-apy39n", null, yt, { "receiver-island__status--active": J(i).audio === "playing" }), $(bt, J(i).audio === "playing" ? "Audio live" : "Audio waiting"), Et = Fr(Tt, 1, "receiver-island__status-item svelte-apy39n", null, Et, { "receiver-island__status--active": J(i).decoder === "output" }), $(Dt, J(i).decoder === "off" ? "Decoder off" : J(i).decoder === "output" ? `${J(i).mode} output received` : `${J(i).mode} selected · waiting for output`), $(Ot, `STEP ${r ?? ""} Hz`), Yr(kt, "aria-expanded", J(_)), $(At, J(_) ? "Close RF controls" : "RF controls · step, squelch, noise reduction"), Yr(jt, "hidden", !J(_)), $(Rt, `WATERFALL · ZOOM ${J(i).waterfallZoomLevel + 1}/${J(i).waterfallZoomMaximum + 1}`), zt.disabled = J(i).waterfallZoomLevel === 0, Bt.disabled = J(i).waterfallZoomLevel >= J(i).waterfallZoomMaximum, $(Gt, J(m)), $(Yt, `Activity${a ?? ""}`), $($t, `WATERFALL · ZOOM ${J(i).waterfallZoomLevel + 1}/${J(i).waterfallZoomMaximum + 1}`), en.disabled = J(i).waterfallZoomLevel === 0, tn.disabled = J(i).waterfallZoomLevel >= J(i).waterfallZoomMaximum, $(on, J(m)), $(hn, J(x).length), $(H, J(C)), $(Cn, `History · ${J(le).length ?? ""}`), Dn.disabled = J(le).length === 0, $(On, J(de)), $(Nn, J(h) || J(f));
	}, [
		() => J(i).frequencyHz === null ? J(i).profileName : `${(J(i).frequencyHz / 1e6).toFixed(6)} MHz`,
		() => J(i).tuningStepHz.toLocaleString(),
		() => J(i).deviceState.replaceAll("_", " "),
		() => J(i).tuningStepHz.toLocaleString(),
		() => J(i).mode.toLocaleLowerCase() === "data2g" ? " · Data2G" : ""
	]), Y("toggle", Ie, () => {
		v.open && document.body.classList.remove("receiver-modern-focus");
	}), X("click", He, Ee), Y("submit", A, E), X("click", Ke, () => ye(-1)), X("keydown", qe, be), Y("focus", qe, () => F(s, !0)), Y("blur", qe, () => F(s, !1)), $r(qe, () => J(a), (e) => F(a, e)), X("click", j, () => ye(1)), Y("submit", Ze, Pe), Y("focus", Qe, () => F(c, !0)), Y("blur", Qe, () => F(c, !1)), Br(Qe, () => J(o), (e) => F(o, e)), X("click", it, xe), X("input", lt, D), X("click", kt, ve), X("click", Nt, _e), Y("toggle", Pt, ge), X("click", zt, () => we("out")), X("click", Bt, () => we("in")), X("click", Vt, () => we("full")), X("click", Ut, () => Te("auto")), X("click", Wt, () => Te("default")), Y("toggle", Kt, ge), Y("toggle", qt, ge), X("click", en, () => we("out")), X("click", tn, () => we("in")), X("click", nn, () => we("full")), X("click", rn, () => Te("auto")), X("click", an, () => Te("default")), Y("toggle", pn, ge), Y("submit", _n, (e) => {
		e.preventDefault(), De();
	}), $r(V, () => J(ie), (e) => F(ie, e)), Y("toggle", xn, ge), $r(En, () => J(ue), (e) => F(ue, e)), X("click", Dn, me), Y("toggle", W, ge), Q(e, Fe), Ve();
}
//#endregion
//#region src/main.ts
ar([
	"click",
	"keydown",
	"input"
]), new URLSearchParams(window.location.search).get("receiver-pane") === "secondary" && document.body.classList.add("receiver-modern-secondary-document");
function Qi() {
	let e = document.getElementById("receiver-modern-ui");
	e && e.dataset.mounted !== "true" && (e.dataset.mounted = "true", vr(Zi, { target: e }));
}
document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", Qi, { once: !0 }) : Qi();
//#endregion
