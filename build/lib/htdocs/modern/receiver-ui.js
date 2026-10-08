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
var m = 1024, h = 2048, g = 4096, _ = 8192, v = 16384, y = 32768, b = 1 << 25, x = 65536, S = 1 << 19, ee = 1 << 20, C = 1 << 25, w = 1 << 21, te = 1 << 22, ne = 1 << 23, re = Symbol("$state"), ie = Symbol("component"), ae = Symbol(""), oe = Symbol("attributes"), se = Symbol("class"), ce = Symbol("style"), le = Symbol("text"), ue = Symbol("form reset"), de = new class extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), fe = !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml"), pe = {}, T = Symbol("uninitialized"), me = "http://www.w3.org/1999/xhtml";
function he() {
	console.warn("https://svelte.dev/e/derived_inert");
}
function ge(e) {
	console.warn("https://svelte.dev/e/hydration_mismatch");
}
function _e() {
	console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function ve() {
	console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/hydration.js
var E = !1;
function ye(e) {
	E = e;
}
var D;
function O(e) {
	if (e === null) throw ge(), pe;
	return D = e;
}
function be() {
	return O(/* @__PURE__ */ Zt(D));
}
function k(e) {
	if (E) {
		if (/* @__PURE__ */ Zt(D) !== null) throw ge(), pe;
		D = e;
	}
}
function xe(e = 1) {
	if (E) {
		for (var t = e, n = D; t--;) n = /* @__PURE__ */ Zt(n);
		D = n;
	}
}
function Se(e = !0) {
	for (var t = 0, n = D;;) {
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
function Ce(e) {
	if (!e || e.nodeType !== 8) throw ge(), pe;
	return e.data;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/equality.js
function we(e) {
	return e === this.v;
}
function Te(e, t) {
	return e == e ? e !== t || typeof e == "object" && !!e || typeof e == "function" : t == t;
}
function Ee(e) {
	return !Te(e, this.v);
}
function De(e) {
	throw Error("https://svelte.dev/e/lifecycle_outside_component");
}
//#endregion
//#region node_modules/svelte/src/internal/client/errors.js
function Oe() {
	throw Error("https://svelte.dev/e/async_derived_orphan");
}
function ke(e, t, n) {
	throw Error("https://svelte.dev/e/each_key_duplicate");
}
function Ae(e) {
	throw Error("https://svelte.dev/e/effect_in_teardown");
}
function je() {
	throw Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function Me(e) {
	throw Error("https://svelte.dev/e/effect_orphan");
}
function Ne() {
	throw Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Pe() {
	throw Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Fe() {
	throw Error("https://svelte.dev/e/state_prototype_fixed");
}
function Ie() {
	throw Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Le() {
	throw Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
//#endregion
//#region node_modules/svelte/src/internal/client/context.js
var A = null;
function Re(e) {
	A = e;
}
function ze(e, t = !1, n) {
	A = {
		p: A,
		i: !1,
		c: null,
		e: null,
		s: e,
		x: null,
		r: G,
		l: null
	};
}
function Be(e) {
	var t = A, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) fn(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, A = t.p, Ve(e);
}
function Ve(e = {}) {
	return i(e, ie, { value: !0 }), e;
}
function He() {
	return !0;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/task.js
var Ue = [];
function We() {
	var e = Ue;
	Ue = [], f(e);
}
function j(e) {
	if (Ue.length === 0 && !gt) {
		var t = Ue;
		queueMicrotask(() => {
			t === Ue && We();
		});
	}
	Ue.push(e);
}
function Ge() {
	for (; Ue.length > 0;) We();
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/status.js
var Ke = ~(h | g | m);
function M(e, t) {
	e.f = e.f & Ke | t;
}
function qe(e) {
	e.f & 512 || e.deps === null ? M(e, m) : M(e, g);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/utils.js
function Je(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), M(e, m);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/misc.js
var Ye = !1;
function Xe() {
	Ye || (Ye = !0, document.addEventListener("reset", (e) => {
		Promise.resolve().then(() => {
			if (!e.defaultPrevented) for (let t of e.target.elements) t[ue]?.();
		});
	}, { capture: !0 }));
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function N(e) {
	var t = U, n = G;
	W(null), Mn(null);
	try {
		return e();
	} finally {
		W(t), Mn(n);
	}
}
function Ze(e, t, n, r = n) {
	e.addEventListener(t, () => N(n));
	let i = e[ue];
	e[ue] = i ? () => {
		i(), r(!0);
	} : () => r(!0), Xe();
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/async.js
function Qe(e, t, n, r) {
	let i = He() ? nt : ot;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = G, c = $e(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function u(e) {
		if (!(s.f & 16384)) {
			c();
			try {
				r([...o, ...e]);
			} catch (e) {
				an(e, s);
			}
			et();
		}
	}
	var d = tt();
	if (n.length === 0) {
		l.then(() => u([])).finally(d);
		return;
	}
	function f() {
		Promise.all(n.map((e) => /* @__PURE__ */ it(e))).then(u).catch((e) => an(e, s)).finally(d);
	}
	l ? l.then(() => {
		s.f & 16384 ? d() : (c(), f(), et());
	}) : f();
}
function $e() {
	var e = G, t = U, n = A, r = P;
	return function(i = !0) {
		Mn(e), W(t), Re(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function et(e = !0) {
	Mn(null), W(null), Re(null), e && P?.deactivate();
}
function tt() {
	var e = G, t = e.b, n = P, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function nt(e) {
	var t = 2 | h;
	return G !== null && (G.f |= S), {
		ctx: A,
		deps: null,
		effects: null,
		equals: we,
		f: t,
		fn: e,
		reactions: null,
		rv: 0,
		v: T,
		wv: 0,
		parent: G,
		ac: null
	};
}
var rt = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function it(e, t, n) {
	let r = G;
	r === null && Oe();
	var i = void 0, a = Nt(T), o = !U, s = /* @__PURE__ */ new Set();
	return hn(() => {
		var t = G, n = p();
		i = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== de && n.reject(e);
			}).finally(et);
		} catch (e) {
			n.reject(e), et();
		}
		var c = P;
		if (o) {
			if (t.f & 32768) var l = tt();
			if (r.b?.is_rendered()) c.async_deriveds.get(t)?.reject(rt);
			else for (let e of s.values()) e.reject(rt);
			s.add(n), c.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), s.delete(n), t !== rt && (c.activate(), t ? (a.f |= ne, Lt(a, t)) : (a.f & 8388608 && (a.f ^= ne), Lt(a, e)), c.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), un(() => {
		for (let e of s) e.reject(rt);
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
function at(e) {
	let t = /* @__PURE__ */ nt(e);
	return Pn(t), t;
}
/*#__NO_SIDE_EFFECTS__*/
function ot(e) {
	let t = /* @__PURE__ */ nt(e);
	return t.equals = Ee, t;
}
function st(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) H(t[n]);
	}
}
function ct(e) {
	var t, n = G, r = e.parent;
	if (!kn && r !== null && e.v !== T && r.f & 24576) return he(), e.v;
	Mn(r);
	try {
		st(e), t = Un(e);
	} finally {
		Mn(n);
	}
	return t;
}
function lt(e) {
	var t = ct(e);
	!e.equals(t) && (e.wv = Bn(), (!P?.is_fork || e.deps === null) && (P === null ? e.v = t : (P.capture(e, t, !0), pt?.capture(e, t, !0)), e.deps === null)) ? M(e, m) : kn || (mt === null ? qe(e) : (ln() || P?.is_fork) && mt.set(e, t));
}
function ut(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && N(() => {
		t.ac.abort(de), t.ac = null;
	}), t.fn !== null && (t.teardown = d), Kn(t, 0), yn(t));
}
function dt(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && qn(t);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/batch.js
var ft = null, P = null, pt = null, mt = null, ht = null, gt = !1, _t = !1, vt = null, yt = null, bt = 0, xt = 1, St = class e {
	id = xt++;
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
		ft === null ? ft = this : (ft.#n = this, this.#t = ft), ft = this;
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
			for (var r of n.d) M(r, h), t(r);
			for (r of n.m) M(r, g), t(r);
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
		for (let e of this.#u) this.#d.delete(e), M(e, h), this.schedule(e);
		for (let e of this.#d) M(e, g), this.schedule(e);
		this.apply();
		for (var t = vt = [], n = [], r = yt = []; this.#c.length > 0;) {
			bt++ > 1e3 && (this.#S(), wt());
			for (let e of this.#g()) try {
				this.#v(e, t, n);
			} catch (t) {
				throw kt(e), this.#h() || this.discard(), t;
			}
		}
		if (P = null, r.length > 0) {
			var i = e.ensure();
			for (let e of r) i.schedule(e);
		}
		if (vt = null, yt = null, this.#h()) {
			this.#x(n), this.#x(t);
			for (let [e, t] of this.#f) Ot(e, t);
			r.length > 0 && P.#_();
			return;
		}
		let a = this.#y();
		if (a) this.#x(n), this.#x(t), a.#b(this);
		else {
			this.#u.clear(), this.#d.clear();
			for (let e of this.#r) e(this);
			this.#r.clear(), pt = this, Et(n), Et(t), pt = null, this.#s?.resolve();
			var o = P;
			if (this.#a === 0 && (this.#c.length === 0 || o !== null) && this.#S(), this.#c.length > 0) {
				if (o !== null) {
					for (let e of this.#c) o.#c.push(e);
					this.#c = [];
				} else o = this;
			}
			o !== null && (jt.clear(), o.#_());
		}
	}
	#v(e, t, n) {
		e.f ^= m;
		for (var r = e.first; r !== null;) {
			var i = r.f, a = !!(i & 96);
			if (!(a && i & 1024 || i & 8192 || this.#f.has(r)) && r.fn !== null) {
				a ? r.f ^= m : i & 4 ? t.push(r) : Vn(r) && (i & 16 && this.#d.add(r), qn(r));
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
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), M(i, h), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#S(), P = this, this.#_();
	}
	#x(e) {
		for (var t = 0; t < e.length; t += 1) Je(e[t], this.#u, this.#d);
	}
	capture(e, t, n = !1) {
		e.v !== T && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [t, n]), mt?.set(e, t)), this.is_fork || (e.v = t);
	}
	activate() {
		P = this;
	}
	deactivate() {
		P = null, mt = null;
	}
	flush() {
		try {
			_t = !0, P = this, this.#_();
		} finally {
			bt = 0, ht = null, vt = null, yt = null, _t = !1, P = null, mt = null, jt.clear();
		}
	}
	discard() {
		for (let e of this.#i) e(this);
		this.#i.clear();
		for (let e of this.async_deriveds.values()) e.reject(rt);
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
		this.#m || (this.#m = !0, j(() => {
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
		if (P === null) {
			let t = P = new e();
			!_t && !gt && j(() => {
				t.#e || t.flush();
			});
		}
		return P;
	}
	apply() {
		mt = null;
	}
	schedule(e) {
		ht = e, e.b?.is_pending && e.f & 16777228 && !(e.f & 32768) ? e.b.defer_effect(e) : this.#c.push(e);
	}
	#S() {
		if (this.linked) {
			var e = this.#t, t = this.#n;
			e === null || (e.#n = t), t === null ? ft = e : t.#t = e, this.linked = !1;
		}
	}
};
function Ct(e) {
	var t = gt, n = pt;
	pt = null, gt = !0;
	try {
		var r;
		for (e && (Ct(), r = e());;) {
			if (Ge(), P === null) return r;
			P.flush();
		}
	} finally {
		gt = t, pt = n;
	}
}
function wt() {
	try {
		Ne();
	} catch (e) {
		an(e, ht);
	}
}
var Tt = null;
function Et(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && Vn(r) && (Tt = /* @__PURE__ */ new Set(), qn(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Sn(r), Tt?.size > 0)) {
				jt.clear();
				for (let e of Tt) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) Tt.has(n) && (Tt.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || qn(n);
					}
				}
				Tt.clear();
			}
		}
		Tt = null;
	}
}
function Dt(e) {
	P.schedule(e);
}
function Ot(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), M(e, m);
		for (var n = e.first; n !== null;) Ot(n, t), n = n.next;
	}
}
function kt(e) {
	M(e, m);
	for (var t = e.first; t !== null;) kt(t), t = t.next;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/sources.js
var At = /* @__PURE__ */ new Set(), jt = /* @__PURE__ */ new Map(), Mt = !1;
function Nt(e, t) {
	return {
		f: 0,
		v: e,
		reactions: null,
		equals: we,
		rv: 0,
		wv: 0
	};
}
/*#__NO_SIDE_EFFECTS__*/
function F(e, t) {
	let n = Nt(e, t);
	return Pn(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function Pt(e, t = !1, n = !0) {
	let r = Nt(e);
	return t || (r.equals = Ee), r;
}
function I(e, t, n = !1) {
	return U !== null && (!jn || U.f & 131072) && He() && U.f & 4325394 && (Nn === null || !Nn.has(e)) && Ie(), Lt(e, n ? Vt(t) : t, yt);
}
var Ft = null, It = 0;
function Lt(e, t, n = null) {
	if (!e.equals(t)) {
		kn ? jt.set(e, t) : jt.has(e) || jt.set(e, e.v);
		var r = St.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && ct(t), mt === null && qe(t);
		}
		e.wv = Bn(), Ft = null, It = 0, Bt(e, h, n), Ft = null, He() && G !== null && G.f & 1024 && !(G.f & 96) && (J === null ? Fn([e]) : J.push(e)), !r.is_fork && At.size > 0 && !Mt && Rt();
	}
	return t;
}
function Rt() {
	Mt = !1;
	for (let e of At) {
		e.f & 1024 && M(e, g);
		let t;
		try {
			t = Vn(e);
		} catch {
			t = !0;
		}
		t && qn(e);
	}
	At.clear();
}
function zt(e) {
	I(e, e.v + 1);
}
function Bt(e, t, n) {
	var r = e.reactions;
	if (r !== null) {
		var i = He(), a = r.length;
		if (It += a, It > 1e5 && Ft === null && (Ft = /* @__PURE__ */ new Set()), Ft !== null) {
			if (Ft.has(e)) return;
			Ft.add(e);
		}
		for (var o = 0; o < a; o++) {
			var s = r[o], c = s.f;
			if (i || s !== G) {
				var l = (c & h) === 0;
				if (l && M(s, t), c & 131072) At.add(s);
				else if (c & 2) {
					var u = s;
					mt?.delete(u), Bt(u, g, n);
				} else if (l) {
					var d = s;
					c & 16 && Tt !== null && Tt.add(d), n === null ? Dt(d) : n.push(d);
				}
			}
		}
	}
}
function Vt(t) {
	if (typeof t != "object" || !t || re in t || ie in t) return t;
	let n = l(t);
	if (n !== s && n !== c) return t;
	var r = /* @__PURE__ */ new Map(), i = e(t), o = /* @__PURE__ */ F(0), u = null, d = Rn, f = (e) => {
		if (Rn === d) return e();
		var t = U, n = Rn;
		W(null), zn(d);
		var r = e();
		return W(t), zn(n), r;
	};
	return i && r.set("length", /* @__PURE__ */ F(t.length, u)), new Proxy(t, {
		defineProperty(e, t, n) {
			(!("value" in n) || n.configurable === !1 || n.enumerable === !1 || n.writable === !1) && Pe();
			var i = r.get(t);
			return i === void 0 ? f(() => {
				var e = /* @__PURE__ */ F(n.value, u);
				return r.set(t, e), e;
			}) : I(i, n.value, !0), !0;
		},
		deleteProperty(e, t) {
			var n = r.get(t);
			if (n === void 0) {
				if (t in e) {
					let e = f(() => /* @__PURE__ */ F(T, u));
					r.set(t, e), zt(o);
				}
			} else I(n, T), zt(o);
			return !0;
		},
		get(e, n, i) {
			if (n === re) return t;
			var o = r.get(n), s = n in e;
			if (o === void 0 && (!s || a(e, n)?.writable) && (o = f(() => /* @__PURE__ */ F(Vt(s ? e[n] : T), u)), r.set(n, o)), o !== void 0) {
				var c = Y(o);
				return c === T ? void 0 : c;
			}
			return Reflect.get(e, n, i);
		},
		getOwnPropertyDescriptor(e, t) {
			this.has?.(e, t);
			var n = Reflect.getOwnPropertyDescriptor(e, t), i = r.get(t);
			if (i !== void 0) {
				var a = Y(i);
				if (a === T) return;
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
			if (t === re) return !0;
			var n = r.get(t), i = n !== void 0 && n.v !== T || Reflect.has(e, t);
			return (n !== void 0 || G !== null && (!i || a(e, t)?.writable)) && (n === void 0 && (n = f(() => /* @__PURE__ */ F(i ? Vt(e[t]) : T, u)), r.set(t, n)), Y(n) === T) ? !1 : i;
		},
		set(e, t, n, s) {
			var c = r.get(t), l = t in e;
			if (i && t === "length") for (var d = n; d < c.v; d += 1) {
				var p = r.get(d + "");
				p === void 0 ? d in e && (p = f(() => /* @__PURE__ */ F(T, u)), r.set(d + "", p)) : I(p, T);
			}
			if (c === void 0) (!l || a(e, t)?.writable) && (c = f(() => /* @__PURE__ */ F(void 0, u)), I(c, Vt(n)), r.set(t, c));
			else {
				l = c.v !== T;
				var m = f(() => Vt(n));
				I(c, m);
			}
			var h = Reflect.getOwnPropertyDescriptor(e, t);
			if (h?.set && h.set.call(s, n), !l) {
				if (i && typeof t == "string") {
					var g = r.get("length"), _ = Number(t);
					Number.isInteger(_) && _ >= g.v && I(g, _ + 1);
				}
				zt(o);
			}
			return !0;
		},
		ownKeys(e) {
			Y(o);
			var t = Reflect.ownKeys(e).filter((e) => {
				var t = r.get(e);
				return t === void 0 || t.v !== T;
			});
			for (var [n, i] of r) i.v !== T && !(n in e) && t.push(n);
			return t;
		},
		setPrototypeOf() {
			Fe();
		}
	});
}
function Ht(e) {
	try {
		if (typeof e == "object" && e && re in e) return e[re];
	} catch {}
	return e;
}
function Ut(e, t) {
	return Object.is(Ht(e), Ht(t));
}
var Wt, Gt, Kt, qt;
function Jt() {
	if (Wt === void 0) {
		Wt = window, Gt = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		Kt = a(t, "firstChild").get, qt = a(t, "nextSibling").get, u(e) && (e[se] = void 0, e[oe] = null, e[ce] = void 0, e.__e = void 0), u(n) && (n[le] = void 0);
	}
}
function Yt(e = "") {
	return document.createTextNode(e);
}
/*@__NO_SIDE_EFFECTS__*/
function Xt(e) {
	return Kt.call(e);
}
/*@__NO_SIDE_EFFECTS__*/
function Zt(e) {
	return qt.call(e);
}
function L(e, t) {
	if (!E) return /* @__PURE__ */ Xt(e);
	var n = /* @__PURE__ */ Xt(D);
	if (n === null) n = D.appendChild(Yt());
	else if (t && n.nodeType !== 3) {
		var r = Yt();
		return n?.before(r), O(r), r;
	}
	return t && nn(n), O(n), n;
}
function Qt(e, t = !1) {
	if (!E) {
		var n = /* @__PURE__ */ Xt(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ Zt(n) : n;
	}
	if (t) {
		if (D?.nodeType !== 3) {
			var r = Yt();
			return D?.before(r), O(r), r;
		}
		nn(D);
	}
	return D;
}
function R(e, t = !1) {
	if (!E) return /* @__PURE__ */ Xt(e);
	var n = L(e, t);
	return k(e), n;
}
function z(e, t = 1, n = !1) {
	let r = E ? D : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ Zt(r);
	if (!E) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = Yt();
			return r === null ? i?.after(a) : r.before(a), O(a), a;
		}
		nn(r);
	}
	return O(r), r;
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
	var t = G;
	if (t === null) return U.f |= ne, e;
	if (!(t.f & 32768) && !(t.f & 4)) throw e;
	an(e, t);
}
function an(e, t) {
	if (e === pe) throw e;
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
	G === null && (U === null && Me(e), je()), kn && Ae(e);
}
function sn(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function cn(e, t) {
	var n = G;
	n !== null && n.f & 8192 && (e |= _);
	var r = {
		ctx: A,
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
	P?.register_created_effect(r);
	var i = r;
	if (e & 4) vt === null ? St.ensure().schedule(r) : vt.push(r);
	else if (t !== null) {
		try {
			qn(r);
		} catch (e) {
			throw H(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= x));
	}
	if (i !== null && (i.parent = n, n !== null && sn(i, n), U !== null && U.f & 2 && !(e & 64))) {
		var a = U;
		(a.effects ??= []).push(i);
	}
	return r;
}
function ln() {
	return U !== null && !jn;
}
function un(e) {
	let t = cn(8, null);
	return M(t, m), t.teardown = e, t;
}
function dn(e) {
	on("$effect");
	var t = G.f;
	if (!U && t & 32 && A !== null && !A.i) {
		var n = A;
		(n.e ??= []).push(e);
	} else return fn(e);
}
function fn(e) {
	return cn(4 | ee, e);
}
function pn(e) {
	St.ensure();
	let t = cn(64 | S, e);
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
	return cn(te | S, e);
}
function gn(e, t = 0) {
	return cn(8 | t, e);
}
function B(e, t = [], n = [], r = []) {
	Qe(r, t, n, (t) => {
		cn(8, () => {
			e(...t.map(Y));
		});
	});
}
function _n(e, t = 0) {
	return cn(16 | t, e);
}
function V(e) {
	return cn(32 | S, e);
}
function vn(e) {
	var t = e.teardown;
	if (t !== null) {
		let n = kn, r = U;
		An(!0), W(null);
		try {
			t.call(null);
		} catch (t) {
			an(t, e.parent);
		} finally {
			An(n), W(r);
		}
	}
}
function yn(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && N(() => {
			e.abort(de);
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
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (xn(e.nodes.start, e.nodes.end), n = !0), e.f |= b, yn(e, t && !n), Kn(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	vn(e), e.f ^= b, e.f |= v;
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
		e.f ^= _, e.f & 1024 || (M(e, h), St.ensure().schedule(e));
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
var U = null, jn = !1;
function W(e) {
	U = e;
}
var G = null;
function Mn(e) {
	G = e;
}
var Nn = null;
function Pn(e) {
	U !== null && (U.f & 2097152 || U.f & 2) && (Nn ??= /* @__PURE__ */ new Set()).add(e);
}
var K = null, q = 0, J = null;
function Fn(e) {
	J = e;
}
var In = 1, Ln = 0, Rn = Ln;
function zn(e) {
	Rn = e;
}
function Bn() {
	return ++In;
}
function Vn(e) {
	var t = e.f;
	if (t & 2048) return !0;
	if (t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (Vn(a) && lt(a), a.wv > e.wv) return !0;
		}
		t & 512 && mt === null && M(e, m);
	}
	return !1;
}
function Hn(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(Nn !== null && Nn.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? Hn(a, t, !1) : t === a && (n ? M(a, h) : a.f & 1024 && M(a, g), Dt(a));
	}
}
function Un(e) {
	var t = K, n = q, r = J, i = U, a = Nn, o = A, s = jn, c = Rn, l = e.f;
	K = null, q = 0, J = null, U = l & 96 ? null : e, Nn = null, Re(e.ctx), jn = !1, Rn = ++Ln, e.ac !== null && (N(() => {
		e.ac.abort(de);
	}), e.ac = null);
	try {
		e.f |= w;
		var u = e.fn, d = u();
		e.f |= y;
		var f = Wn(e);
		if (He() && J !== null && !jn && f !== null && !(e.f & 6146)) for (var p = 0; p < J.length; p++) Hn(J[p], e);
		if (i !== null && i !== e) {
			if (Ln++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = Ln;
			if (t !== null) for (let e of t) e.rv = Ln;
			J !== null && (r === null ? r = J : r.push(...J));
		}
		return e.f & 8388608 && (e.f ^= ne), d;
	} catch (t) {
		return Wn(e), rn(t);
	} finally {
		e.f ^= w, K = t, q = n, J = r, U = i, Nn = a, Re(o), jn = s, Rn = c;
	}
}
function Wn(e) {
	var t = e.deps, n = P?.is_fork;
	if (K !== null) {
		var r;
		if (n || Kn(e, q), t !== null && q > 0) for (t.length = q + K.length, r = 0; r < K.length; r++) t[q + r] = K[r];
		else e.deps = t = K;
		if (ln() && e.f & 512) for (r = q; r < t.length; r++) (t[r].reactions ??= []).push(e);
	} else !n && t !== null && q < t.length && (Kn(e, q), t.length = q);
	return t;
}
function Gn(e, r) {
	let i = r.reactions;
	if (i !== null) {
		var a = t.call(i, e);
		if (a !== -1) {
			var o = i.length - 1;
			o === 0 ? i = r.reactions = null : (i[a] = i[o], i.pop());
		}
	}
	if (i === null && r.f & 2 && (K === null || !n.call(K, r))) {
		var s = r;
		s.f & 512 && (s.f ^= 512), s.v !== T && qe(s), s.ac !== null && N(() => {
			s.ac.abort(de), s.ac = null, M(s, h);
		}), ut(s), Kn(s, 0);
	}
}
function Kn(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) Gn(e, n[r]);
}
function qn(e) {
	var t = e.f;
	if (!(t & 16384)) {
		M(e, m);
		var n = G;
		G = e;
		try {
			t & 16777232 ? bn(e) : yn(e), vn(e);
			var r = Un(e);
			e.teardown = typeof r == "function" ? r : null, e.wv = In;
		} finally {
			G = n;
		}
	}
}
async function Jn() {
	await Promise.resolve(), Ct();
}
function Y(e) {
	var t = !!(e.f & 2);
	if (On?.add(e), U !== null && !jn && !(G !== null && G.f & 16384) && (Nn === null || !Nn.has(e))) {
		var r = U.deps;
		if (U.f & 2097152) e.rv < Ln && (e.rv = Ln, K === null && r !== null && r[q] === e ? q++ : K === null ? K = [e] : K.push(e));
		else {
			U.deps ??= [], n.call(U.deps, e) || U.deps.push(e);
			var i = e.reactions;
			i === null ? e.reactions = [U] : n.call(i, U) || i.push(U);
		}
	}
	if (kn && jt.has(e)) return jt.get(e);
	if (t) {
		var a = e;
		if (kn) {
			var o = a.v;
			return (!(a.f & 1024) && a.reactions !== null || Xn(a)) && (o = ct(a)), jt.set(a, o), o;
		}
		var s = !(a.f & 512) && !jn && U !== null && !!(U.f & 512), c = (a.f & y) === 0;
		Vn(a) && (s && (a.f |= 512), lt(a)), s && !c && (dt(a), Yn(a));
	}
	if (mt?.has(e)) return mt.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function Yn(e) {
	if (e.f |= 512, e.deps !== null) for (let r of e.deps) {
		var t = r.reactions;
		t === null ? r.reactions = [e] : n.call(t, e) || t.push(e), r.f & 2 && !(r.f & 512) && (dt(r), Yn(r));
	}
}
function Xn(e) {
	if (e.v === T) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (jt.has(t) || t.f & 2 && Xn(t)) return !0;
	return !1;
}
function Zn(e) {
	var t = jn;
	try {
		return jn = !0, e();
	} finally {
		jn = t;
	}
}
[.../* @__PURE__ */ "allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback".split(".")];
var Qn = ["touchstart", "touchmove"];
function $n(e) {
	return Qn.includes(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/events.js
var er = Symbol("events"), tr = /* @__PURE__ */ new Set(), nr = /* @__PURE__ */ new Set();
function rr(e, t, n, r = {}) {
	function i(e) {
		if (r.capture || cr.call(t, e), !e.cancelBubble) return N(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? (i.__removed = !1, j(() => {
		i.__removed || t.addEventListener(e, i, r);
	})) : t.addEventListener(e, i, r), i;
}
function ir(e, t, n, r, i) {
	var a = {
		capture: r,
		passive: i
	}, o = rr(e, t, n, a);
	(t === document.body || t === window || t === document || t instanceof HTMLMediaElement) && un(() => {
		o.__removed = !0, t.removeEventListener(e, o, a);
	});
}
function X(e, t, n) {
	(t[er] ??= {})[e] = n;
}
function ar(e) {
	for (var t = 0; t < e.length; t++) tr.add(e[t]);
	for (var n of nr) n(e);
}
var or = null, sr = !1;
function cr(e) {
	var t = this, n = t.ownerDocument, r = e.type, a = e.composedPath?.() || [], o = a[0] || e.target;
	or = e, sr || (sr = !0, setTimeout(() => {
		sr = !1, or = null;
	}));
	var s = 0, c = or === e && e[er];
	if (c) {
		var l = a.indexOf(c);
		if (l !== -1 && (t === document || t === window)) {
			e[er] = t;
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
		var d = U, f = G;
		W(null), Mn(null);
		try {
			for (var p, m = []; o !== null && o !== t;) {
				try {
					var h = o[er]?.[r];
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
			e[er] = t, delete e.currentTarget, W(d), Mn(f);
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
	var n = G;
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
		if (E) return fr(D, null), D;
		i === void 0 && (i = dr(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ Xt(i)));
		var t = r || Gt ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ Xt(t), s = t.lastChild;
			fr(o, s);
		} else fr(t, t);
		return t;
	};
}
function pr() {
	if (E) return fr(D, null), D;
	var e = document.createDocumentFragment(), t = document.createComment(""), n = Yt();
	return e.append(t, n), fr(t, n), e;
}
function Q(e, t) {
	if (E) {
		var n = G;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = D), be();
	} else e !== null && e.before(t);
}
//#endregion
//#region node_modules/svelte/src/reactivity/create-subscriber.js
function mr(e) {
	let t = 0, n = Nt(0), r;
	return () => {
		ln() && (Y(n), gn(() => (t === 0 && (r = Zn(() => e(() => zt(n)))), t += 1, () => {
			j(() => {
				--t, t === 0 && (r?.(), r = void 0, zt(n));
			});
		})));
	};
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var hr = x | S;
function gr(e, t, n, r) {
	new _r(e, t, n, r);
}
var _r = class {
	parent;
	is_pending = !1;
	transform_error;
	#e;
	#t = E ? D : null;
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
	#h = mr(() => (this.#m = Nt(this.#l), () => {
		this.#m = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#n = t, this.#r = (e) => {
			var t = G;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = G.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = _n(() => {
			if (E) {
				let e = Ce(this.#t);
				be();
				let t = e === "[!";
				if (e.startsWith("[?")) {
					let t = JSON.parse(e.slice(2));
					this.#_(t);
				} else t ? this.#b() : this.#g();
			} else this.#x();
		}, hr), E && (this.#e = D);
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
		j(r), t && (this.#s = V(() => {
			t(this.#e, () => e, () => n);
		}));
	}
	#v(e) {
		var t = !1, n = !1;
		let r = () => {
			this.#y() || (t ? ve() : (t = !0, n && Le(), this.#s !== null && Cn(this.#s, () => {
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
		return (this.#i.f & (v | b)) !== 0;
	}
	#b() {
		let e = this.#n.pending;
		e && (this.is_pending = !0, this.#o = V(() => e(this.#e)), j(() => {
			if (!this.#y()) {
				var e = this.#c = document.createDocumentFragment(), t = Yt(), n = !1;
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
				}), this.#a === null ? (this.#c = null, n && this.#S(P)) : this.#u === 0 && (this.#e.before(e), this.#c = null, Cn(this.#o, () => {
					this.#o = null;
				}), this.#S(P));
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
			} else this.#S(P);
		} catch (e) {
			this.error(e);
		}
	}
	#S(e) {
		this.is_pending = !1, e.transfer_effects(this.#f, this.#p);
	}
	defer_effect(e) {
		Je(e, this.#f, this.#p);
	}
	is_rendered() {
		return !this.is_pending && (!this.parent || this.parent.is_rendered());
	}
	has_pending_snippet() {
		return !!this.#n.pending;
	}
	#C(e) {
		var t = G, n = U, r = A;
		Mn(this.#i), W(this.#i), Re(this.#i.ctx);
		try {
			return St.ensure(), e();
		} finally {
			Mn(t), W(n), Re(r);
		}
	}
	#w(e, t) {
		this.has_pending_snippet() ? (this.#u += e, this.#u === 0 && (this.#S(t), this.#o && Cn(this.#o, () => {
			this.#o = null;
		}), this.#c &&= (this.#e.before(this.#c), null))) : this.parent && this.parent.#w(e, t);
	}
	update_pending_count(e, t) {
		this.#w(e, t), this.#l += e, !(!this.#m || this.#d) && (this.#d = !0, j(() => {
			this.#d = !1, this.#m && Lt(this.#m, this.#l);
		}));
	}
	get_effect_pending() {
		return this.#h(), Y(this.#m);
	}
	error(e) {
		if (e === pe || !this.#n.onerror && !this.#n.failed) throw e;
		P?.is_fork ? (this.#a && P.skip_effect(this.#a), this.#o && P.skip_effect(this.#o), this.#s && P.skip_effect(this.#s), P.oncommit(() => {
			this.#y() || this.#T(e);
		})) : this.#T(e);
	}
	#T(e) {
		this.#a &&= (H(this.#a), null), this.#o &&= (H(this.#o), null), this.#s &&= (H(this.#s), null), E && (O(this.#t), xe(), O(Se()));
		let t = this.#n.failed, n = (e) => {
			if (this.#y()) return;
			let { reset: n, invoke_onerror: r } = this.#v(e);
			r(), t && !this.#y() && (this.#s = this.#C(() => {
				try {
					return V(() => {
						var r = G;
						r.b = this, r.f |= 128, t(this.#e, () => e, () => n);
					});
				} catch (e) {
					return an(e, this.#i.parent), null;
				}
			}));
		};
		j(() => {
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
	n !== (e[le] ??= e.nodeValue) && (e[le] = n, e.nodeValue = `${n}`);
}
function vr(e, t) {
	return br(e, t);
}
var yr = /* @__PURE__ */ new Map();
function br(e, { target: t, anchor: n, props: i = {}, events: a, context: o, intro: s = !0, transformError: c }) {
	Jt();
	var l = void 0, u = pn(() => {
		var s = n ?? t.appendChild(Yt());
		gr(s, { pending: () => {} }, (t) => {
			ze({});
			var n = A;
			if (o && (n.c = o), a && (i.$$events = a), E && fr(t, null), l = e(t, i) || Ve(), E && (G.nodes.end = D, D === null || D.nodeType !== 8 || D.data !== "]")) throw ge(), pe;
			Be();
		}, c);
		var u = /* @__PURE__ */ new Set(), d = (e) => {
			for (var n = 0; n < e.length; n++) {
				var r = e[n];
				if (!u.has(r)) {
					u.add(r);
					var i = $n(r);
					for (let e of [t, document]) {
						var a = yr.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), yr.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, cr, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return d(r(tr)), nr.add(d), () => {
			for (var e of u) for (let n of [t, document]) {
				var r = yr.get(n), i = r.get(e);
				--i == 0 ? (n.removeEventListener(e, cr), r.delete(e), r.size === 0 && yr.delete(n)) : r.set(e, i);
			}
			nr.delete(d), s !== n && s.parentNode?.removeChild(s);
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
						Dn(r, t), t.append(Yt()), this.#n.set(e, {
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
		var n = P, r = en();
		if (t && !this.#t.has(e) && !this.#n.has(e)) {
			if (r) {
				var i = document.createDocumentFragment(), a = Yt();
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
		} else E && (this.anchor = D), this.#a(n);
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/if.js
function Cr(e, t, n = !1) {
	var r;
	E && (r = D, be());
	var i = new Sr(e), a = n ? x : 0;
	function o(e, t) {
		if (E) {
			var n = Ce(r);
			if (e !== parseInt(n.substring(1))) {
				var a = Se();
				O(a), i.anchor = a, ye(!1), i.ensure(e, t), ye(!0);
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
		r?.has(a) ? (a.f |= C, Dn(a, document.createDocumentFragment())) : H(t[i], n);
	}
}
var Er;
function Dr(t, n, i, a, o, s = null) {
	var c = t, l = /* @__PURE__ */ new Map();
	if (n & 4) {
		var u = t;
		c = E ? O(/* @__PURE__ */ Xt(u)) : u.appendChild(Yt());
	}
	E && be();
	var d = null, f = /* @__PURE__ */ ot(() => {
		var t = i();
		return e(t) ? t : t == null ? [] : r(t);
	}), p = /* @__PURE__ */ new Map(), m = !0;
	function h(e) {
		if (!(_.effect.f & 16384)) {
			_.pending.delete(e);
			var t = Y(f);
			_.fallback = d, kr(_, t, c, n, a), d !== null && (t.length === 0 ? d.f & 33554432 ? (d.f ^= C, jr(d, null, c)) : Tn(d) : Cn(d, () => {
				d = null;
			}));
		}
	}
	function g(e) {
		_.pending.delete(e);
	}
	var _ = {
		effect: _n(() => {
			var e = Y(f), t = e.length;
			let r = !1;
			E && Ce(c) === "[!" != (t === 0) && (c = Se(), O(c), ye(!1), r = !0);
			for (var u = /* @__PURE__ */ new Set(), _ = P, v = en(), y = 0; y < t; y += 1) {
				E && D.nodeType === 8 && D.data === "]" && (c = D, r = !0, ye(!1));
				var b = e[y], x = a(b, y), S = m ? null : l.get(x);
				S ? (S.v && Lt(S.v, b), S.i && Lt(S.i, y), v && _.unskip_effect(S.e)) : (S = Ar(l, m ? c : Er ??= Yt(), b, x, y, o, n, i), m || (S.e.f |= C), l.set(x, S)), u.add(x);
			}
			if (t === 0 && s && !d && (m ? d = V(() => s(c)) : (d = V(() => s(Er ??= Yt())), d.f |= C)), t > u.size && ke("", "", ""), E && t > 0 && O(Se()), !m) {
				if (p.set(_, u), v) {
					for (let [e, t] of l) u.has(e) || _.skip_effect(t.e);
					_.oncommit(h), _.ondiscard(g);
				} else h(_);
			}
			r && ye(!0), Y(f);
		}),
		flags: n,
		items: l,
		pending: p,
		outrogroups: null,
		fallback: d
	};
	m = !1, E && (c = D);
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
			if (_.f ^= C, _ === l) jr(_, null, n);
			else {
				var y = d ? d.next : l;
				_ === e.effect.last && (e.effect.last = _.prev), _.prev && (_.prev.next = _.next), _.next && (_.next.prev = _.prev), Mr(e, d, _), Mr(e, _, y), jr(_, y, n), d = _, p = [], m = [], l = Or(d.next);
				continue;
			}
		}
		if (_ !== l) {
			if (u !== void 0 && u.has(_)) {
				if (p.length < m.length) {
					var b = m[0], x;
					d = b.prev;
					var S = p[0], ee = p[p.length - 1];
					for (x = 0; x < p.length; x += 1) jr(p[x], b, n);
					for (x = 0; x < m.length; x += 1) u.delete(m[x]);
					Mr(e, S.prev, ee.next), Mr(e, d, S), Mr(e, ee, b), l = b, d = ee, --v, p = [], m = [];
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
		var w = [];
		if (u !== void 0) for (_ of u) _.f & 8192 || w.push(_);
		for (; l !== null;) !(l.f & 8192) && l !== e.fallback && w.push(l), l = Or(l.next);
		var te = w.length;
		if (te > 0) {
			var ne = i & 4 && s === 0 ? n : null;
			if (o) {
				for (v = 0; v < te; v += 1) w[v].nodes?.a?.measure();
				for (v = 0; v < te; v += 1) w[v].nodes?.a?.fix();
			}
			wr(e, w, ne);
		}
	}
	o && j(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function Ar(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? Nt(n) : /* @__PURE__ */ Pt(n, !1, !1) : null, l = o & 2 ? Nt(i) : null;
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
	var o = e[se];
	if (E || o !== n || o === void 0) {
		var s = Pr(n, r, a);
		(!E || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[se] = n;
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
			Ir(c, i ? a.includes(l) : Ut(l, r));
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
		if (!e(n)) return _e();
		for (var i of t.options) i.selected = n.includes(Vr(i));
	} else {
		for (i of t.options) if (Ut(Vr(i), n)) {
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
	Ze(e, "change", (t) => {
		var i = t ? "[selected]" : ":checked", a;
		if (e.multiple) a = [].map.call(e.querySelectorAll(i), Vr);
		else {
			var o = e.querySelector(i) ?? e.querySelector("option:not([disabled])");
			a = o && Vr(o);
		}
		n(a), e.__value = a, P !== null && r.add(P);
	}), mn(() => {
		var a = t();
		if (e === document.activeElement) {
			var o = P;
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
var Ur = Symbol("is custom element"), Wr = Symbol("is html"), Gr = fe ? "link" : "LINK", Kr = fe ? "progress" : "PROGRESS";
function qr(e) {
	if (E) {
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
		e[ue] = n, j(n), Xe();
	}
}
function Jr(e, t) {
	var n = Xr(e);
	n.value !== (n.value = t ?? void 0) && (e.value !== t || t === 0 && e.nodeName === Kr) && (e.value = t ?? "");
}
function Yr(e, t, n, r) {
	var i = Xr(e);
	E && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === Gr) || i[t] !== (i[t] = n) && (t === "loading" && (e[ae] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && Qr(e).has(t) ? e[t] = n : e.setAttribute(t, n));
}
function Xr(e) {
	return e[oe] ??= {
		[Ur]: e.nodeName.includes("-"),
		[Wr]: e.namespaceURI === me
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
	Ze(e, "input", async (i) => {
		var a = i ? e.defaultValue : e.value;
		if (a = ei(e) ? ti(a) : a, n(a), P !== null && r.add(P), await Jn(), a !== (a = t())) {
			var o = e.selectionStart, s = e.selectionEnd, c = e.value.length;
			if (e.value = a ?? "", s !== null) {
				var l = e.value.length;
				o === s && s === c && l > c ? (e.selectionStart = l, e.selectionEnd = l) : (e.selectionStart = o, e.selectionEnd = Math.min(s, l));
			}
		}
	}), (E && e.defaultValue !== e.value || Zn(t) == null && e.value) && (n(ei(e) ? ti(e.value) : e.value), P !== null && r.add(P)), gn(() => {
		var n = t();
		if (e === document.activeElement) {
			var i = P;
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
function ni(e) {
	A === null && De("onMount"), dn(() => {
		let t = Zn(e);
		if (typeof t == "function") return t;
	});
}
//#endregion
//#region node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region src/receiver-bridge.ts
var ri = null, ii = {
	deviceName: null,
	deviceState: "unknown",
	deviceSeverity: "info",
	deviceMessage: null
}, ai = null;
window.addEventListener("openwebrx:decoder-output", (e) => {
	let t = e.detail?.modulation;
	typeof t == "string" && t && (ri = {
		modulation: t,
		at: Date.now()
	}, ai = null);
}), window.addEventListener("openwebrx:decoder-error", (e) => {
	let t = e.detail;
	t?.schema_version === 1 && typeof t.message == "string" && t.message.length <= 240 && (ai = t.message.slice(0, 240));
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
	].includes(String(t.severity)) && (ii = {
		deviceName: typeof t.source_name == "string" ? t.source_name.slice(0, 80) : null,
		deviceState: t.state,
		deviceSeverity: t.severity,
		deviceMessage: typeof t.message == "string" ? t.message.slice(0, 240) : null
	});
});
var oi = {
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
function si() {
	let e = window.OpenWebRXReceiver?.getSnapshot() ?? oi, t = (e.availableModes ?? []).filter((e) => typeof e?.modulation == "string" && typeof e?.name == "string"), n = (e.modeCapabilities ?? []).filter((e) => typeof e?.modulation == "string" && typeof e?.name == "string"), r = (n.find((t) => t.modulation === e.mode) ?? t.find((t) => t.modulation === e.mode))?.type === "digimode" ? ri?.modulation === e.mode && Date.now() - ri.at < 15e3 ? "output" : "selected" : "off";
	return {
		...oi,
		...e,
		...ii,
		decoderError: ai,
		availableModes: t,
		modeCapabilities: n,
		decoder: r
	};
}
function ci(e) {
	return !Number.isFinite(e) || e <= 0 ? !1 : window.OpenWebRXReceiver?.tuneTo(e) ?? !1;
}
function li(e) {
	Number.isFinite(e) && window.OpenWebRXReceiver?.audio?.setVolume(Math.max(0, Math.min(150, Math.round(e))));
}
function ui() {
	window.OpenWebRXReceiver?.audio?.toggleMute();
}
function di(e) {
	return si().audio === "playing" ? window.OpenWebRXReceiver?.audio?.setRecording(e) ?? !1 : !1;
}
function fi(e) {
	return window.OpenWebRXReceiver?.waterfall?.zoom(e) ?? !1;
}
function pi(e) {
	return window.OpenWebRXReceiver?.waterfall?.setRange(e) ?? !1;
}
function mi(e) {
	return !e || !si().availableModes.some((t) => t.modulation === e) ? !1 : window.OpenWebRXReceiver?.setMode(e) ?? !1;
}
function hi() {
	return window.OpenWebRXReceiver?.addCurrentBookmark() ?? !1;
}
function gi() {
	return window.OpenWebRXReceiver?.getSelectedProfile() ?? null;
}
function _i() {
	let e = window.OpenWebRXReceiver, t = (e?.getSelectedProfile())?.split("|", 1)[0];
	return t ? e?.getProfiles().find((e) => {
		let n = e.id.split("|", 1)[0];
		return n && n !== t;
	}) ?? null : null;
}
function vi(e) {
	let t = () => e(si());
	t();
	let n = window.setInterval(t, 400);
	return () => window.clearInterval(n);
}
//#endregion
//#region src/layouts.ts
var yi = "openwebrx.receiver-layouts.v1.", bi = 40, xi = 48;
function Si(e) {
	return typeof e != "string" || !e || e.length > 256 ? null : yi + encodeURIComponent(e);
}
function Ci(e) {
	return Array.isArray(e) ? e.slice(0, bi).filter((e) => typeof e == "object" && !!e && typeof e.id == "string" && e.id.length > 0 && e.id.length <= 80 && typeof e.name == "string" && e.name.length > 0 && e.name.length <= xi && Number.isFinite(e.frequencyHz) && e.frequencyHz > 0 && typeof e.modulation == "string" && e.modulation.length > 0 && e.modulation.length <= 40).map((e) => ({
		id: e.id,
		name: e.name,
		frequencyHz: e.frequencyHz,
		modulation: e.modulation
	})) : [];
}
function wi(e) {
	if (!e) return [];
	let t = Si(e);
	if (!t) return [];
	try {
		return Ci(JSON.parse(window.localStorage.getItem(t) ?? "[]"));
	} catch {
		return [];
	}
}
function Ti(e, t) {
	if (!e || !t.name.trim() || t.name.trim().length > xi || !Number.isFinite(t.frequencyHz) || t.frequencyHz <= 0 || !t.modulation || t.modulation.length > 40) return null;
	let n = Si(e);
	if (!n) return null;
	let r = wi(e), i = t.name.trim(), a = r.find((e) => e.name.toLocaleLowerCase() === i.toLocaleLowerCase()), o = a ? r.map((e) => e.id === a.id ? {
		...e,
		name: i,
		frequencyHz: t.frequencyHz,
		modulation: t.modulation
	} : e) : [{
		...t,
		id: crypto.randomUUID(),
		name: i
	}, ...r].slice(0, bi);
	try {
		return window.localStorage.setItem(n, JSON.stringify(o)), o;
	} catch {
		return null;
	}
}
function Ei(e, t) {
	if (!e || !t) return null;
	let n = Si(e);
	if (!n) return null;
	let r = wi(e).filter((e) => e.id !== t);
	try {
		return window.localStorage.setItem(n, JSON.stringify(r)), r;
	} catch {
		return null;
	}
}
//#endregion
//#region src/ReceiverIsland.svelte
var Di = /* @__PURE__ */ Z("<button type=\"button\" class=\"receiver-island__bookmark svelte-apy39n\"> </button> <button type=\"button\" class=\"receiver-island__bookmark svelte-apy39n\">Open separate window</button>", 1), Oi = /* @__PURE__ */ Z("<option></option>"), ki = /* @__PURE__ */ Z("<option> </option>"), Ai = /* @__PURE__ */ Z("<label class=\"receiver-island__layout-select-label svelte-apy39n\" for=\"receiver-modern-layout-list\">THIS RECEIVER PROFILE</label> <div class=\"receiver-island__layout-actions svelte-apy39n\"><select id=\"receiver-modern-layout-list\" class=\"svelte-apy39n\"><option>Choose a saved layout</option><!></select> <button type=\"button\" class=\"receiver-island__apply svelte-apy39n\">Apply</button> <button type=\"button\" class=\"receiver-island__zoom svelte-apy39n\">Remove</button></div>", 1), ji = /* @__PURE__ */ Z("<p class=\"receiver-island__layout-empty svelte-apy39n\">Save a frequency and mode combination for quick recall.</p>"), Mi = /* @__PURE__ */ Z("<span class=\"receiver-island__audio-warning svelte-apy39n\" role=\"status\"> </span>"), Ni = /* @__PURE__ */ Z("<span class=\"receiver-island__health-error svelte-apy39n\" role=\"status\"> </span>"), Pi = /* @__PURE__ */ Z("<li class=\"svelte-apy39n\"><span> </span> <p class=\"svelte-apy39n\"> </p></li>"), Fi = /* @__PURE__ */ Z("<ol class=\"receiver-island__data2g-aprs svelte-apy39n\"></ol>"), Ii = /* @__PURE__ */ Z("<li class=\"svelte-apy39n\"><span> </span> <code class=\"svelte-apy39n\"> </code></li>"), Li = /* @__PURE__ */ Z("<ol class=\"svelte-apy39n\"></ol>"), Ri = /* @__PURE__ */ Z("<p class=\"svelte-apy39n\">No complete Data2G frame received yet. Decoded frames appear here.</p>"), zi = /* @__PURE__ */ Z("<li class=\"svelte-apy39n\"> </li>"), Bi = /* @__PURE__ */ Z("<ol class=\"receiver-island__data2g-activity svelte-apy39n\" aria-label=\"Recent Data2G channel and burst activity\"></ol>"), Vi = /* @__PURE__ */ Z("<section class=\"receiver-island__data2g svelte-apy39n\" aria-label=\"Data2G receive activity\"><div class=\"receiver-island__data2g-heading svelte-apy39n\"><strong>DATA2G RECEIVE</strong> <span aria-live=\"polite\" class=\"svelte-apy39n\"> </span></div> <!> <!> <!></section>"), Hi = /* @__PURE__ */ Z("<button type=\"button\" class=\"receiver-island__record svelte-apy39n\"> </button>"), Ui = /* @__PURE__ */ Z("<section class=\"receiver-island svelte-apy39n\" aria-label=\"Receiver tuning and status\"><div class=\"receiver-island__identity svelte-apy39n\"><span class=\"receiver-island__eyebrow svelte-apy39n\"> </span> <span class=\"receiver-island__mode svelte-apy39n\"> </span> <button type=\"button\" class=\"receiver-island__bookmark svelte-apy39n\">Save bookmark</button> <!> <button type=\"button\" class=\"receiver-island__advanced-toggle\" aria-controls=\"openwebrx-panel-receiver\"> </button> <span class=\"receiver-island__message svelte-apy39n\" aria-live=\"polite\"> </span></div> <form class=\"receiver-island__mode-picker svelte-apy39n\" aria-label=\"Select receiver mode\"><label for=\"receiver-modern-mode\">MODE</label> <input id=\"receiver-modern-mode\" type=\"search\" list=\"receiver-modern-mode-options\" aria-describedby=\"receiver-modern-mode-message\" autocomplete=\"off\" placeholder=\"Search modes\" class=\"svelte-apy39n\"/> <datalist id=\"receiver-modern-mode-options\"><!></datalist> <button type=\"submit\" class=\"receiver-island__apply svelte-apy39n\">Set mode</button> <span id=\"receiver-modern-mode-message\" class=\"receiver-island__message svelte-apy39n\" aria-live=\"polite\"> </span></form> <details class=\"receiver-island__layouts svelte-apy39n\"><summary class=\"svelte-apy39n\">Saved layouts <span class=\"svelte-apy39n\"> </span></summary> <div class=\"receiver-island__layouts-panel svelte-apy39n\"><form class=\"receiver-island__layout-save svelte-apy39n\"><label for=\"receiver-modern-layout-name\" class=\"svelte-apy39n\">SAVE CURRENT FREQUENCY + MODE</label> <input id=\"receiver-modern-layout-name\" maxlength=\"48\" placeholder=\"Layout name\" autocomplete=\"off\" class=\"svelte-apy39n\"/> <button type=\"submit\" class=\"receiver-island__apply svelte-apy39n\">Save</button></form> <!> <span class=\"receiver-island__layout-message svelte-apy39n\" aria-live=\"polite\"> </span></div></details> <form class=\"receiver-island__tuning svelte-apy39n\"><button type=\"button\" class=\"receiver-island__nudge svelte-apy39n\" aria-label=\"Tune down one step\">−</button> <label class=\"receiver-island__frequency-label svelte-apy39n\" for=\"receiver-modern-frequency\">FREQUENCY · MHz</label> <input id=\"receiver-modern-frequency\" class=\"receiver-island__frequency svelte-apy39n\" type=\"number\" inputmode=\"decimal\" min=\"0.001\" step=\"0.000001\" aria-describedby=\"receiver-modern-tune-message\" aria-label=\"Tune frequency in megahertz\"/> <button type=\"submit\" class=\"receiver-island__apply svelte-apy39n\">Tune</button> <button type=\"button\" class=\"receiver-island__nudge svelte-apy39n\" aria-label=\"Tune up one step\">+</button> <span id=\"receiver-modern-tune-message\" class=\"receiver-island__message svelte-apy39n\" aria-live=\"polite\"> </span></form> <div class=\"receiver-island__waterfall-controls svelte-apy39n\" aria-label=\"Waterfall controls\"><span class=\"receiver-island__waterfall-label svelte-apy39n\"> </span> <button type=\"button\" class=\"receiver-island__zoom svelte-apy39n\">Zoom out</button> <button type=\"button\" class=\"receiver-island__zoom svelte-apy39n\">Zoom in</button> <button type=\"button\" class=\"receiver-island__zoom svelte-apy39n\">Full spectrum</button> <button type=\"button\" class=\"receiver-island__zoom svelte-apy39n\">Auto levels</button> <button type=\"button\" class=\"receiver-island__zoom svelte-apy39n\">Reset range</button> <span class=\"receiver-island__message svelte-apy39n\" aria-live=\"polite\"> </span></div> <div class=\"receiver-island__status svelte-apy39n\" aria-label=\"Receiver status\"><span><i aria-hidden=\"true\" class=\"svelte-apy39n\"></i> </span> <span><i aria-hidden=\"true\" class=\"svelte-apy39n\"></i> </span> <span><i aria-hidden=\"true\" class=\"svelte-apy39n\"></i> </span> <!> <!> <span><i aria-hidden=\"true\" class=\"svelte-apy39n\"></i> </span> <span class=\"receiver-island__status-step svelte-apy39n\"> </span></div> <!> <div class=\"receiver-island__audio svelte-apy39n\" aria-label=\"Audio controls\"><button type=\"button\" class=\"receiver-island__mute svelte-apy39n\"> </button> <!> <label for=\"receiver-modern-volume\">VOLUME</label> <input id=\"receiver-modern-volume\" type=\"range\" min=\"0\" max=\"150\" step=\"1\" aria-label=\"Audio volume\" class=\"svelte-apy39n\"/> <output for=\"receiver-modern-volume\" class=\"svelte-apy39n\"> </output> <span class=\"receiver-island__record-message svelte-apy39n\" aria-live=\"polite\"> </span></div></section>");
function Wi(e, t) {
	ze(t, !0);
	let n = /* @__PURE__ */ F(Vt({
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
	})), r = /* @__PURE__ */ F(""), i = /* @__PURE__ */ F(""), a = /* @__PURE__ */ F(!1), o = /* @__PURE__ */ F(!1), s = /* @__PURE__ */ F(""), c = /* @__PURE__ */ F(""), l = /* @__PURE__ */ F(""), u = /* @__PURE__ */ F(""), d = /* @__PURE__ */ F(""), f = /* @__PURE__ */ F(""), p = /* @__PURE__ */ F(""), m = /* @__PURE__ */ F(!1), h = /* @__PURE__ */ F(!1), g = /* @__PURE__ */ F(!1), _ = null, v = null, y = null, b = "", x = /* @__PURE__ */ F(Vt([])), S = /* @__PURE__ */ F(""), ee = /* @__PURE__ */ F(""), C = /* @__PURE__ */ F(""), w = /* @__PURE__ */ F("waiting for receiver audio"), te = /* @__PURE__ */ F(Vt([])), ne = /* @__PURE__ */ F(Vt([])), re = /* @__PURE__ */ F(Vt([]));
	ni(() => {
		document.body.classList.add("receiver-modern-modes-mounted"), I(g, document.body.classList.contains("receiver-modern-secondary-document"), !0);
		let e = (e) => {
			e.key === "Escape" && Y(h) && (I(h, !1), document.body.classList.remove("receiver-modern-advanced-open"));
		};
		window.addEventListener("keydown", e), b = gi() ?? "", I(x, wi(b || null), !0);
		let t = (e) => {
			let t = e.detail;
			!t || t.schema_version !== 1 || !Number.isInteger(t.port) || Number(t.port) < 0 || Number(t.port) > 15 || !Number.isInteger(t.command) || Number(t.command) < 0 || Number(t.command) > 15 || !Number.isInteger(t.payload_bytes) || Number(t.payload_bytes) < 0 || Number(t.payload_bytes) > 4096 || typeof t.payload_hex != "string" || t.payload_hex.length > 8192 || !/^(?:[0-9a-f]{2})*$/i.test(t.payload_hex) || t.payload_hex.length !== Number(t.payload_bytes) * 2 || (I(te, [{
				port: Number(t.port),
				command: Number(t.command),
				payloadBytes: Number(t.payload_bytes),
				payloadHex: t.payload_hex.slice(0, 2048),
				receivedAt: Number.isFinite(t.received_at) ? Number(t.received_at) : Date.now() / 1e3
			}, ...Y(te)].slice(0, 10), !0), I(w, "frames received"));
		}, s = (e) => {
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
						e = n === "busy" ? "channel busy" : "channel clear", I(w, n === "busy" ? "channel busy" : "listening · channel clear", !0);
					} else if (n === "heard") {
						if (!Number.isInteger(t.port) || Number(t.port) < 0 || Number(t.port) > 15 || t.call !== void 0 && (typeof t.call != "string" || !/^[A-Z0-9/-]{1,10}$/.test(t.call))) return;
						e = `burst checked · KISS ${t.port}${t.call ? ` · ${t.call}` : ""}`, I(w, e, !0);
					} else if (n === "lost" || n === "dropped") {
						if (!Number.isInteger(t.port) || Number(t.port) < 0 || Number(t.port) > 15 || !Number.isInteger(t.count) || Number(t.count) < 0 || Number(t.count) > 999999) return;
						e = n === "lost" ? `burst incomplete · KISS ${t.port} · ${t.count} lost` : `frames dropped · KISS ${t.port} · ${t.count}`, I(w, e, !0);
					} else {
						if (typeof t.submode != "string" || !/^[A-Za-z0-9./_-]{1,48}$/.test(t.submode) || !Number.isInteger(t.codewords) || Number(t.codewords) < 0 || Number(t.codewords) > 999) return;
						e = `possible missed burst · ${t.submode} · ${t.codewords} codewords`, I(w, e, !0);
					}
					I(re, [{
						text: e,
						receivedAt: Date.now() / 1e3
					}, ...Y(re)].slice(0, 20), !0);
				} else [
					"listening",
					"audio_overrun",
					"error",
					"restarting"
				].includes(n) && I(w, n === "listening" ? "listening · 8 kHz RX" : n === "audio_overrun" ? `audio queue dropped ${Number(t.dropped_chunks) || 0} chunks` : n === "error" ? `worker error · ${String(t.message ?? "unknown").slice(0, 160)}` : n, !0);
			}
		}, c = (e) => {
			let t = e.detail, n = t?.message;
			if (!t || t.schema_version !== 1 || !n || typeof n != "object") return;
			let r = n;
			typeof r.source == "string" && typeof r.destination == "string" && typeof r.data == "string" && (I(ne, [{
				source: r.source.slice(0, 16),
				destination: r.destination.slice(0, 16),
				text: r.data.slice(0, 512),
				receivedAt: Number.isFinite(t.received_at) ? Number(t.received_at) : Date.now() / 1e3
			}, ...Y(ne)].slice(0, 20), !0), I(w, "APRS decoded"));
		};
		window.addEventListener("openwebrx:data2g-frame", t), window.addEventListener("openwebrx:data2g-status", s), window.addEventListener("openwebrx:data2g-aprs", c);
		let l = vi((e) => {
			I(n, e, !0);
			let t = gi() ?? "";
			t !== b && (b = t, I(x, wi(b || null), !0), I(S, "")), Y(a) || I(r, e.frequencyHz === null ? "" : (e.frequencyHz / 1e6).toFixed(6), !0), Y(o) || I(i, e.availableModes.find((t) => t.modulation === e.mode)?.name ?? e.mode, !0);
		});
		return () => {
			l(), window.removeEventListener("keydown", e), window.removeEventListener("openwebrx:data2g-frame", t), window.removeEventListener("openwebrx:data2g-status", s), window.removeEventListener("openwebrx:data2g-aprs", c), _ !== null && window.clearInterval(_), v !== null && window.clearInterval(v), y?.remove(), document.body.classList.remove("receiver-modern-dual"), document.body.classList.remove("receiver-modern-advanced-open"), document.documentElement.classList.remove("receiver-modern-dual-document"), document.body.classList.remove("receiver-modern-modes-mounted");
		};
	});
	function ie() {
		I(h, !Y(h)), document.body.classList.toggle("receiver-modern-advanced-open", Y(h));
	}
	function ae(e) {
		oe(e);
	}
	function oe(e) {
		Y(n).frequencyHz !== null && (ci(Y(n).frequencyHz + e * Y(n).tuningStepHz) && I(n, si(), !0), I(s, ""));
	}
	function se(e) {
		let t = e.key === "ArrowUp" || e.key === "PageUp" ? 1 : e.key === "ArrowDown" || e.key === "PageDown" ? -1 : 0;
		t && (e.preventDefault(), oe(t * (e.key === "PageUp" || e.key === "PageDown" ? 10 : 1)));
	}
	function ce(e) {
		e.preventDefault();
		let t = Number(Y(r));
		!Number.isFinite(t) || t <= 0 || !ci(t * 1e6) ? I(s, "Frequency unavailable") : (I(a, !1), I(n, si(), !0), I(s, ""));
	}
	function le(e) {
		let t = e.currentTarget;
		t instanceof HTMLInputElement && (li(Number(t.value)), I(n, si(), !0));
	}
	function ue() {
		ui(), I(n, si(), !0);
	}
	function de() {
		di(!Y(n).recording) ? (I(d, ""), I(n, si(), !0)) : I(d, "Recording unavailable");
	}
	function fe(e) {
		fi(e), I(n, si(), !0);
	}
	function pe(e) {
		I(f, pi(e) ? "" : "Waterfall controls unavailable", !0);
	}
	function T() {
		I(l, hi() ? "" : "Bookmark controls unavailable", !0);
	}
	function me() {
		if (Y(n).frequencyHz === null || Y(n).mode === "No mode") {
			I(C, "Tune a frequency and select a mode before saving");
			return;
		}
		let e = Ti(b || null, {
			name: Y(ee),
			frequencyHz: Y(n).frequencyHz,
			modulation: Y(n).mode
		});
		if (!e) {
			I(C, Y(ee).trim() ? "Could not save layout in this browser" : "Enter a layout name", !0);
			return;
		}
		I(x, e, !0);
		let t = e.find((e) => e.name.toLocaleLowerCase() === Y(ee).trim().toLocaleLowerCase());
		I(S, t?.id ?? "", !0), I(ee, ""), I(C, "Layout saved for this receiver profile");
	}
	function he() {
		let e = Y(x).find((e) => e.id === Y(S));
		e ? Y(n).availableModes.some((t) => t.modulation === e.modulation) ? !mi(e.modulation) || !ci(e.frequencyHz) ? I(C, "Could not apply the saved layout") : (I(o, !1), I(a, !1), I(i, Y(n).availableModes.find((t) => t.modulation === e.modulation)?.name ?? e.modulation, !0), I(r, (e.frequencyHz / 1e6).toFixed(6), !0), I(n, si(), !0), I(C, `Applied ${e.name}`)) : I(C, "Saved mode is unavailable on this receiver") : I(C, "Choose a saved layout");
	}
	function ge() {
		let e = Ei(b || null, Y(S));
		e ? (I(x, e, !0), I(S, ""), I(C, "Saved layout removed")) : I(C, "Could not update saved layouts in this browser");
	}
	function _e() {
		v !== null && window.clearInterval(v), I(p, "");
		let e = _i();
		if (!e) {
			I(u, "Configure a second enabled source for the other tuner");
			return;
		}
		let t = window.open(window.location.href, "openwebrx-second-receiver", "popup,width=1100,height=760");
		if (t === null) I(u, "Allow popups to open another receiver");
		else try {
			t.opener = null, I(u, "Opening second receiver…");
			let n = 0;
			v = window.setInterval(() => {
				n += 1;
				try {
					if (t.closed) {
						v !== null && window.clearInterval(v), v = null, I(u, "Second receiver window closed");
						return;
					}
					let r = t.OpenWebRXReceiver, i = r?.getProfiles().some((t) => t.id === e.id);
					r && i && r.selectProfile(e.id) ? (v !== null && window.clearInterval(v), v = null, I(u, `Second receiver opened on ${e.name}`)) : n >= 100 && (v !== null && window.clearInterval(v), v = null, I(u, `Could not select ${e.name} in the second receiver window`));
				} catch {
					v !== null && window.clearInterval(v), v = null, I(u, "Second receiver window is unavailable");
				}
			}, 200);
		} catch {
			I(u, "Choose another profile in the second receiver window");
		}
	}
	function ve() {
		if (Y(m)) {
			_ !== null && window.clearInterval(_), _ = null, y?.remove(), y = null, I(m, !1), document.body.classList.remove("receiver-modern-dual"), document.documentElement.classList.remove("receiver-modern-dual-document"), I(p, "Second receiver closed");
			return;
		}
		let e = _i(), t = document.getElementById("receiver-modern-secondary");
		if (!e || !t) {
			I(p, "Configure a second enabled source for the other tuner");
			return;
		}
		let n = new URL(window.location.href);
		n.searchParams.set("receiver-pane", "secondary");
		let r = document.createElement("iframe");
		r.title = `${e.name} receiver`, r.setAttribute("allow", "autoplay"), r.setAttribute("loading", "eager"), r.src = n.toString(), t.replaceChildren(r), y = r, I(m, !0), document.body.classList.add("receiver-modern-dual"), document.documentElement.classList.add("receiver-modern-dual-document"), I(p, `Connecting ${e.name}…`);
		let i = 0;
		_ = window.setInterval(() => {
			i += 1;
			try {
				if (r.contentWindow?.closed) {
					_ !== null && window.clearInterval(_), _ = null;
					return;
				}
				let t = r.contentWindow?.OpenWebRXReceiver, n = t?.getProfiles().some((t) => t.id === e.id);
				t && n && t.selectProfile(e.id) ? (_ !== null && window.clearInterval(_), _ = null, I(p, `Second tuner connected · ${e.name}`)) : i >= 120 && (_ !== null && window.clearInterval(_), _ = null, I(p, `Second tuner not available · ${e.name}`));
			} catch {
				_ !== null && window.clearInterval(_), _ = null, I(p, "Second receiver could not be reached");
			}
		}, 250);
	}
	function E(e) {
		return {
			wsjtx: "WSJT-X decoders",
			wsjtx_2_3: "WSJT-X 2.3 or newer",
			wsjtx_2_4: "WSJT-X 2.4 or newer",
			msk144decoder: "MSK144 decoder",
			js8: "JS8Call",
			js8py: "JS8 Python decoder"
		}[e] ?? e.replaceAll("_", " ");
	}
	function ye(e) {
		return `Unavailable: requires ${e.map(E).join(", ")}`;
	}
	function D(e) {
		let t = e.currentTarget;
		if (!(t instanceof HTMLInputElement)) return;
		I(i, t.value, !0);
		let r = t.value.trim().toLocaleLowerCase(), a = Y(n).modeCapabilities.find((e) => !e.available && (e.name.toLocaleLowerCase() === r || e.modulation.toLocaleLowerCase() === r));
		I(c, a ? ye(a.missing_requirements) : "", !0);
	}
	function O(e) {
		e.preventDefault();
		let t = Y(i).trim().toLocaleLowerCase(), r = Y(n).availableModes.find((e) => e.name.toLocaleLowerCase() === t || e.modulation.toLocaleLowerCase() === t), a = Y(n).modeCapabilities.find((e) => !e.available && (e.name.toLocaleLowerCase() === t || e.modulation.toLocaleLowerCase() === t));
		a ? I(c, ye(a.missing_requirements), !0) : !r || !mi(r.modulation) ? I(c, "Choose an available receiver mode") : (I(c, ""), I(o, !1), I(i, r.name, !0), I(n, si(), !0));
	}
	var be = Ui(), Se = L(be), Ce = L(Se), we = R(Ce), Te = z(Ce, 2), Ee = R(Te, !0), De = z(Te, 2), Oe = z(De, 2), ke = (e) => {
		var t = Di(), n = Qt(t), r = R(n, !0), i = z(n, 2);
		B(() => {
			Yr(n, "aria-pressed", Y(m)), $(r, Y(m) ? "Close second tuner" : "Dual tuner view");
		}), X("click", n, ve), X("click", i, _e), Q(e, t);
	};
	Cr(Oe, (e) => {
		Y(g) || e(ke);
	});
	var Ae = z(Oe, 2), je = R(Ae, !0), Me = R(z(Ae, 2), !0);
	k(Se);
	var Ne = z(Se, 2), Pe = z(L(Ne), 2);
	qr(Pe);
	var Fe = z(Pe, 2), Ie = L(Fe), Le = (e) => {
		var t = pr();
		Dr(Qt(t), 17, () => Y(n).modeCapabilities, (e) => e.modulation, (e, t) => {
			var n = Oi(), r = {};
			B((e) => {
				Yr(n, "label", e), r !== (r = Y(t).name) && (n.value = (n.__value = r) ?? "");
			}, [() => Y(t).available ? Y(t).type === "digimode" ? "Digital decoder" : "Analog demodulator" : ye(Y(t).missing_requirements)]), Q(e, n);
		}), Q(e, t);
	}, A = (e) => {
		var t = pr();
		Dr(Qt(t), 17, () => Y(n).availableModes, (e) => e.modulation, (e, t) => {
			var n = Oi(), r = {};
			B(() => {
				Yr(n, "label", Y(t).type === "digimode" ? "Digital decoder" : "Analog demodulator"), r !== (r = Y(t).name) && (n.value = (n.__value = r) ?? "");
			}), Q(e, n);
		}), Q(e, t);
	};
	Cr(Ie, (e) => {
		Y(n).modeCapabilities.length ? e(Le) : e(A, -1);
	}), k(Fe);
	var Re = R(z(Fe, 4), !0);
	k(Ne);
	var Ve = z(Ne, 2), He = L(Ve), Ue = R(z(L(He)), !0);
	k(He);
	var We = z(He, 2), j = L(We), Ge = z(L(j), 2);
	qr(Ge), xe(2), k(j);
	var Ke = z(j, 2), M = (e) => {
		var t = Ai(), n = z(Qt(t), 2), r = L(n), i = L(r);
		i.value = i.__value = "", Dr(z(i), 17, () => Y(x), (e) => e.id, (e, t) => {
			var n = ki(), r = R(n), i = {};
			B((e) => {
				$(r, `${Y(t).name ?? ""} · ${e ?? ""} MHz · ${Y(t).modulation ?? ""}`), i !== (i = Y(t).id) && (n.value = (n.__value = i) ?? "");
			}, [() => (Y(t).frequencyHz / 1e6).toFixed(6)]), Q(e, n);
		}), k(r), zr(r);
		var a = z(r, 2), o = z(a, 2);
		k(n), B(() => {
			a.disabled = !Y(S), o.disabled = !Y(S);
		}), Br(r, () => Y(S), (e) => I(S, e)), X("click", a, he), X("click", o, ge), Q(e, t);
	}, qe = (e) => {
		Q(e, ji());
	};
	Cr(Ke, (e) => {
		Y(x).length ? e(M) : e(qe, -1);
	});
	var Je = R(z(Ke, 2), !0);
	k(We), k(Ve);
	var Ye = z(Ve, 2), Xe = L(Ye), N = z(Xe, 4);
	qr(N);
	var Ze = z(N, 4), Qe = R(z(Ze, 2), !0);
	k(Ye);
	var $e = z(Ye, 2), et = L($e), tt = R(et), nt = z(et, 2), rt = z(nt, 2), it = z(rt, 2), ot = z(it, 2), st = z(ot, 2), ct = R(z(st, 2), !0);
	k($e);
	var lt = z($e, 2), ut = L(lt);
	let dt;
	var ft = z(L(ut), 1, !0);
	k(ut);
	var P = z(ut, 2);
	let pt;
	var mt = z(L(P));
	k(P);
	var ht = z(P, 2);
	let gt;
	var _t = z(L(ht), 1, !0);
	k(ht);
	var vt = z(ht, 2), yt = (e) => {
		var t = Mi(), r = R(t);
		B((e) => $(r, `Audio buffer dropped ${e ?? ""} samples`), [() => Y(n).audioDroppedSamples.toLocaleString()]), Q(e, t);
	};
	Cr(vt, (e) => {
		Y(n).audioDroppedSamples > 0 && e(yt);
	});
	var bt = z(vt, 2), xt = (e) => {
		var t = Ni(), r = R(t);
		B(() => {
			Yr(t, "title", Y(n).decoderError), $(r, `Decoder error · ${Y(n).decoderError ?? ""}`);
		}), Q(e, t);
	};
	Cr(bt, (e) => {
		Y(n).decoderError && e(xt);
	});
	var St = z(bt, 2);
	let Ct;
	var wt = z(L(St), 1, !0);
	k(St);
	var Tt = R(z(St, 2));
	k(lt);
	var Et = z(lt, 2), Dt = (e) => {
		var t = Vi(), n = L(t), r = R(z(L(n), 2), !0);
		k(n);
		var i = z(n, 2), a = (e) => {
			var t = Fi();
			Dr(t, 23, () => Y(ne), (e, t) => e.receivedAt + ":" + t, (e, t) => {
				var n = Pi(), r = L(n), i = R(r), a = R(z(r, 2), !0);
				k(n), B((e) => {
					$(i, `${e ?? ""} · ${Y(t).source ?? ""} → ${Y(t).destination ?? ""}`), $(a, Y(t).text);
				}, [() => (/* @__PURE__ */ new Date(Y(t).receivedAt * 1e3)).toLocaleTimeString()]), Q(e, n);
			}), k(t), Q(e, t);
		};
		Cr(i, (e) => {
			Y(ne).length && e(a);
		});
		var o = z(i, 2), s = (e) => {
			var t = Li();
			Dr(t, 23, () => Y(te), (e, t) => e.receivedAt + ":" + t, (e, t) => {
				var n = Ii(), r = L(n), i = R(r), a = R(z(r, 2), !0);
				k(n), B((e) => {
					$(i, `${e ?? ""} · KISS ${Y(t).port ?? ""} · ${Y(t).command === 0 ? "DATA" : `CMD ${Y(t).command}`} · ${Y(t).payloadBytes ?? ""} B`), $(a, Y(t).payloadHex);
				}, [() => (/* @__PURE__ */ new Date(Y(t).receivedAt * 1e3)).toLocaleTimeString()]), Q(e, n);
			}), k(t), Q(e, t);
		}, c = (e) => {
			Q(e, Ri());
		};
		Cr(o, (e) => {
			Y(te).length ? e(s) : Y(ne).length || e(c, 1);
		});
		var l = z(o, 2), u = (e) => {
			var t = Bi();
			Dr(t, 23, () => Y(re), (e, t) => e.receivedAt + ":" + t, (e, t) => {
				var n = zi(), r = R(n);
				B((e) => $(r, `${e ?? ""} · ${Y(t).text ?? ""}`), [() => (/* @__PURE__ */ new Date(Y(t).receivedAt * 1e3)).toLocaleTimeString()]), Q(e, n);
			}), k(t), Q(e, t);
		};
		Cr(l, (e) => {
			Y(re).length && e(u);
		}), k(t), B(() => $(r, Y(w))), Q(e, t);
	}, Ot = /* @__PURE__ */ at(() => Y(n).mode.toLocaleLowerCase() === "data2g");
	Cr(Et, (e) => {
		Y(Ot) && e(Dt);
	});
	var kt = z(Et, 2), At = L(kt), jt = R(At, !0), Mt = z(At, 2), Nt = (e) => {
		var t = Hi(), r = R(t, !0);
		B(() => {
			Yr(t, "aria-pressed", Y(n).recording), t.disabled = !Y(n).recording && Y(n).audio !== "playing", $(r, Y(n).recording ? "Stop recording" : "Record audio");
		}), X("click", t, de), Q(e, t);
	};
	Cr(Mt, (e) => {
		(Y(n).recordingAllowed || Y(n).recording) && e(Nt);
	});
	var Pt = z(Mt, 4);
	qr(Pt);
	var Ft = z(Pt, 2), It = R(Ft), Lt = R(z(Ft, 2), !0);
	k(kt), k(be), B((e, t, r) => {
		$(we, `OPENWEBRX+ · ${Y(n).profileName ?? ""}`), $(Ee, e), Yr(Ae, "aria-expanded", Y(h)), $(je, Y(h) ? "Close RF controls" : "RF controls"), $(Me, Y(p) || Y(l) || Y(u)), $(Re, Y(c)), $(Ue, Y(x).length), $(Je, Y(C)), $(Qe, Y(s)), $(tt, `WATERFALL · ZOOM ${Y(n).waterfallZoomLevel + 1}/${Y(n).waterfallZoomMaximum + 1}`), nt.disabled = Y(n).waterfallZoomLevel === 0, rt.disabled = Y(n).waterfallZoomLevel >= Y(n).waterfallZoomMaximum, $(ct, Y(f)), dt = Fr(ut, 1, "receiver-island__status-item svelte-apy39n", null, dt, { "receiver-island__status--active": Y(n).connection === "connected" }), $(ft, Y(n).connection === "connected" ? "Connected" : Y(n).connection === "starting" ? "Starting" : "Reconnecting"), pt = Fr(P, 1, "receiver-island__status-item svelte-apy39n", null, pt, {
			"receiver-island__status--active": Y(n).deviceState === "running",
			"receiver-island__health-warning": Y(n).deviceSeverity === "warning",
			"receiver-island__health-error": Y(n).deviceSeverity === "error"
		}), Yr(P, "title", Y(n).deviceMessage ?? ""), Yr(P, "aria-label", `SDR ${Y(n).deviceName ?? "source"}: ${Y(n).deviceState}`), $(mt, `${Y(n).deviceName ?? "SDR" ?? ""} · ${t ?? ""}`), gt = Fr(ht, 1, "receiver-island__status-item svelte-apy39n", null, gt, { "receiver-island__status--active": Y(n).audio === "playing" }), $(_t, Y(n).audio === "playing" ? "Audio live" : "Audio waiting"), Ct = Fr(St, 1, "receiver-island__status-item svelte-apy39n", null, Ct, { "receiver-island__status--active": Y(n).decoder === "output" }), $(wt, Y(n).decoder === "off" ? "Decoder off" : Y(n).decoder === "output" ? `${Y(n).mode} output received` : `${Y(n).mode} selected · waiting for output`), $(Tt, `STEP ${r ?? ""} Hz`), Yr(At, "aria-pressed", Y(n).muted), At.disabled = Y(n).audio !== "playing", $(jt, Y(n).muted ? "Unmute" : "Mute"), Jr(Pt, Y(n).volume), Pt.disabled = Y(n).audio !== "playing" || Y(n).muted, $(It, `${Y(n).volume ?? ""}%`), $(Lt, Y(d));
	}, [
		() => Y(n).availableModes.find((e) => e.modulation === Y(n).mode)?.name ?? Y(n).mode,
		() => Y(n).deviceState.replaceAll("_", " "),
		() => Y(n).tuningStepHz.toLocaleString()
	]), X("click", De, T), X("click", Ae, ie), ir("submit", Ne, O), X("input", Pe, D), ir("focus", Pe, () => I(o, !0)), ir("blur", Pe, () => I(o, !1)), $r(Pe, () => Y(i), (e) => I(i, e)), ir("submit", j, (e) => {
		e.preventDefault(), me();
	}), $r(Ge, () => Y(ee), (e) => I(ee, e)), ir("submit", Ye, ce), X("click", Xe, () => ae(-1)), X("keydown", N, se), ir("focus", N, () => I(a, !0)), ir("blur", N, () => I(a, !1)), $r(N, () => Y(r), (e) => I(r, e)), X("click", Ze, () => ae(1)), X("click", nt, () => fe("out")), X("click", rt, () => fe("in")), X("click", it, () => fe("full")), X("click", ot, () => pe("auto")), X("click", st, () => pe("default")), X("click", At, ue), X("input", Pt, le), Q(e, be), Be();
}
//#endregion
//#region src/main.ts
ar([
	"click",
	"input",
	"keydown"
]), new URLSearchParams(window.location.search).get("receiver-pane") === "secondary" && document.body.classList.add("receiver-modern-secondary-document");
function Gi() {
	let e = document.getElementById("receiver-modern-ui");
	e && e.dataset.mounted !== "true" && (e.dataset.mounted = "true", vr(Wi, { target: e }));
}
document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", Gi, { once: !0 }) : Gi();
//#endregion
