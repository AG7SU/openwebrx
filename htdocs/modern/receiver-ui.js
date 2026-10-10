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
var m = 1024, h = 2048, g = 4096, _ = 8192, v = 16384, y = 32768, b = 1 << 25, x = 65536, S = 1 << 19, ee = 1 << 20, C = 1 << 25, w = 1 << 21, T = 1 << 22, E = 1 << 23, te = Symbol("$state"), ne = Symbol("component"), re = Symbol(""), ie = Symbol("attributes"), ae = Symbol("class"), oe = Symbol("style"), se = Symbol("text"), ce = Symbol("form reset"), le = new class extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), ue = !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml"), de = {}, D = Symbol("uninitialized"), fe = "http://www.w3.org/1999/xhtml";
function pe() {
	console.warn("https://svelte.dev/e/derived_inert");
}
function me(e) {
	console.warn("https://svelte.dev/e/hydration_mismatch");
}
function he() {
	console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function ge() {
	console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/hydration.js
var O = !1;
function _e(e) {
	O = e;
}
var k;
function A(e) {
	if (e === null) throw me(), de;
	return k = e;
}
function ve() {
	return A(/* @__PURE__ */ Jt(k));
}
function j(e) {
	if (O) {
		if (/* @__PURE__ */ Jt(k) !== null) throw me(), de;
		k = e;
	}
}
function ye(e = 1) {
	if (O) {
		for (var t = e, n = k; t--;) n = /* @__PURE__ */ Jt(n);
		k = n;
	}
}
function be(e = !0) {
	for (var t = 0, n = k;;) {
		if (n.nodeType === 8) {
			var r = n.data;
			if (r === "]") {
				if (t === 0) return n;
				--t;
			} else (r === "[" || r === "[!" || r[0] === "[" && !isNaN(Number(r.slice(1)))) && (t += 1);
		}
		var i = /* @__PURE__ */ Jt(n);
		e && n.remove(), n = i;
	}
}
function xe(e) {
	if (!e || e.nodeType !== 8) throw me(), de;
	return e.data;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/equality.js
function Se(e) {
	return e === this.v;
}
function Ce(e, t) {
	return e == e ? e !== t || typeof e == "object" && !!e || typeof e == "function" : t == t;
}
function we(e) {
	return !Ce(e, this.v);
}
function Te(e) {
	throw Error("https://svelte.dev/e/lifecycle_outside_component");
}
//#endregion
//#region node_modules/svelte/src/internal/client/errors.js
function Ee() {
	throw Error("https://svelte.dev/e/async_derived_orphan");
}
function De(e, t, n) {
	throw Error("https://svelte.dev/e/each_key_duplicate");
}
function Oe(e) {
	throw Error("https://svelte.dev/e/effect_in_teardown");
}
function ke() {
	throw Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function Ae(e) {
	throw Error("https://svelte.dev/e/effect_orphan");
}
function je() {
	throw Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Me() {
	throw Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Ne() {
	throw Error("https://svelte.dev/e/state_prototype_fixed");
}
function Pe() {
	throw Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Fe() {
	throw Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
//#endregion
//#region node_modules/svelte/src/internal/client/context.js
var M = null;
function Ie(e) {
	M = e;
}
function Le(e, t = !1, n) {
	M = {
		p: M,
		i: !1,
		c: null,
		e: null,
		s: e,
		x: null,
		r: K,
		l: null
	};
}
function Re(e) {
	var t = M, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) ln(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, M = t.p, ze(e);
}
function ze(e = {}) {
	return i(e, ne, { value: !0 }), e;
}
function Be() {
	return !0;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/task.js
var Ve = [];
function He() {
	var e = Ve;
	Ve = [], f(e);
}
function N(e) {
	if (Ve.length === 0 && !mt) {
		var t = Ve;
		queueMicrotask(() => {
			t === Ve && He();
		});
	}
	Ve.push(e);
}
function Ue() {
	for (; Ve.length > 0;) He();
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/status.js
var We = ~(h | g | m);
function P(e, t) {
	e.f = e.f & We | t;
}
function Ge(e) {
	e.f & 512 || e.deps === null ? P(e, m) : P(e, g);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/utils.js
function Ke(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), P(e, m);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/misc.js
var qe = !1;
function Je() {
	qe || (qe = !0, document.addEventListener("reset", (e) => {
		Promise.resolve().then(() => {
			if (!e.defaultPrevented) for (let t of e.target.elements) t[ce]?.();
		});
	}, { capture: !0 }));
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function Ye(e) {
	var t = G, n = K;
	An(null), jn(null);
	try {
		return e();
	} finally {
		An(t), jn(n);
	}
}
function Xe(e, t, n, r = n) {
	e.addEventListener(t, () => Ye(n));
	let i = e[ce];
	e[ce] = i ? () => {
		i(), r(!0);
	} : () => r(!0), Je();
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/async.js
function Ze(e, t, n, r) {
	let i = Be() ? tt : at;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = K, c = Qe(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function u(e) {
		if (!(s.f & 16384)) {
			c();
			try {
				r([...o, ...e]);
			} catch (e) {
				tn(e, s);
			}
			$e();
		}
	}
	var d = et();
	if (n.length === 0) {
		l.then(() => u([])).finally(d);
		return;
	}
	function f() {
		Promise.all(n.map((e) => /* @__PURE__ */ rt(e))).then(u).catch((e) => tn(e, s)).finally(d);
	}
	l ? l.then(() => {
		s.f & 16384 ? d() : (c(), f(), $e());
	}) : f();
}
function Qe() {
	var e = K, t = G, n = M, r = F;
	return function(i = !0) {
		jn(e), An(t), Ie(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function $e(e = !0) {
	jn(null), An(null), Ie(null), e && F?.deactivate();
}
function et() {
	var e = K, t = e.b, n = F, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function tt(e) {
	var t = 2 | h;
	return K !== null && (K.f |= S), {
		ctx: M,
		deps: null,
		effects: null,
		equals: Se,
		f: t,
		fn: e,
		reactions: null,
		rv: 0,
		v: D,
		wv: 0,
		parent: K,
		ac: null
	};
}
var nt = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function rt(e, t, n) {
	let r = K;
	r === null && Ee();
	var i = void 0, a = jt(D), o = !G, s = /* @__PURE__ */ new Set();
	return fn(() => {
		var t = K, n = p();
		i = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== le && n.reject(e);
			}).finally($e);
		} catch (e) {
			n.reject(e), $e();
		}
		var c = F;
		if (o) {
			if (t.f & 32768) var l = et();
			if (r.b?.is_rendered()) c.async_deriveds.get(t)?.reject(nt);
			else for (let e of s.values()) e.reject(nt);
			s.add(n), c.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), s.delete(n), t !== nt && (c.activate(), t ? (a.f |= E, Ft(a, t)) : (a.f & 8388608 && (a.f ^= E), Ft(a, e)), c.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), sn(() => {
		for (let e of s) e.reject(nt);
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
function it(e) {
	let t = /* @__PURE__ */ tt(e);
	return Nn(t), t;
}
/*#__NO_SIDE_EFFECTS__*/
function at(e) {
	let t = /* @__PURE__ */ tt(e);
	return t.equals = we, t;
}
function ot(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) W(t[n]);
	}
}
function st(e) {
	var t, n = K, r = e.parent;
	if (!Dn && r !== null && e.v !== D && r.f & 24576) return pe(), e.v;
	jn(r);
	try {
		ot(e), t = Un(e);
	} finally {
		jn(n);
	}
	return t;
}
function ct(e) {
	var t = st(e);
	!e.equals(t) && (e.wv = Bn(), (!F?.is_fork || e.deps === null) && (F === null ? e.v = t : (F.capture(e, t, !0), ft?.capture(e, t, !0)), e.deps === null)) ? P(e, m) : Dn || (I === null ? Ge(e) : (on() || F?.is_fork) && I.set(e, t));
}
function lt(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && Ye(() => {
		t.ac.abort(le), t.ac = null;
	}), t.fn !== null && (t.teardown = d), Kn(t, 0), _n(t));
}
function ut(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && qn(t);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/batch.js
var dt = null, F = null, ft = null, I = null, pt = null, mt = !1, ht = !1, gt = null, _t = null, vt = 0, yt = 1, bt = class e {
	id = yt++;
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
		dt === null ? dt = this : (dt.#n = this, this.#t = dt), dt = this;
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
			for (var r of n.d) P(r, h), t(r);
			for (r of n.m) P(r, g), t(r);
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
		for (let e of this.#u) this.#d.delete(e), P(e, h), this.schedule(e);
		for (let e of this.#d) P(e, g), this.schedule(e);
		this.apply();
		for (var t = gt = [], n = [], r = _t = []; this.#c.length > 0;) {
			vt++ > 1e3 && (this.#S(), St());
			for (let e of this.#g()) try {
				this.#v(e, t, n);
			} catch (t) {
				throw Dt(e), this.#h() || this.discard(), t;
			}
		}
		if (F = null, r.length > 0) {
			var i = e.ensure();
			for (let e of r) i.schedule(e);
		}
		if (gt = null, _t = null, this.#h()) {
			this.#x(n), this.#x(t);
			for (let [e, t] of this.#f) Et(e, t);
			r.length > 0 && F.#_();
			return;
		}
		let a = this.#y();
		if (a) this.#x(n), this.#x(t), a.#b(this);
		else {
			this.#u.clear(), this.#d.clear();
			for (let e of this.#r) e(this);
			this.#r.clear(), ft = this, wt(n), wt(t), ft = null, this.#s?.resolve();
			var o = F;
			if (this.#a === 0 && (this.#c.length === 0 || o !== null) && this.#S(), this.#c.length > 0) {
				if (o !== null) {
					for (let e of this.#c) o.#c.push(e);
					this.#c = [];
				} else o = this;
			}
			o !== null && (kt.clear(), o.#_());
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
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), P(i, h), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#S(), F = this, this.#_();
	}
	#x(e) {
		for (var t = 0; t < e.length; t += 1) Ke(e[t], this.#u, this.#d);
	}
	capture(e, t, n = !1) {
		e.v !== D && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [t, n]), I?.set(e, t)), this.is_fork || (e.v = t);
	}
	activate() {
		F = this;
	}
	deactivate() {
		F = null, I = null;
	}
	flush() {
		try {
			ht = !0, F = this, this.#_();
		} finally {
			vt = 0, pt = null, gt = null, _t = null, ht = !1, F = null, I = null, kt.clear();
		}
	}
	discard() {
		for (let e of this.#i) e(this);
		this.#i.clear();
		for (let e of this.async_deriveds.values()) e.reject(nt);
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
		this.#m || (this.#m = !0, N(() => {
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
		if (F === null) {
			let t = F = new e();
			!ht && !mt && N(() => {
				t.#e || t.flush();
			});
		}
		return F;
	}
	apply() {
		I = null;
	}
	schedule(e) {
		pt = e, e.b?.is_pending && e.f & 16777228 && !(e.f & 32768) ? e.b.defer_effect(e) : this.#c.push(e);
	}
	#S() {
		if (this.linked) {
			var e = this.#t, t = this.#n;
			e === null || (e.#n = t), t === null ? dt = e : t.#t = e, this.linked = !1;
		}
	}
};
function xt(e) {
	var t = mt, n = ft;
	ft = null, mt = !0;
	try {
		var r;
		for (e && (xt(), r = e());;) {
			if (Ue(), F === null) return r;
			F.flush();
		}
	} finally {
		mt = t, ft = n;
	}
}
function St() {
	try {
		je();
	} catch (e) {
		tn(e, pt);
	}
}
var Ct = null;
function wt(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && Vn(r) && (Ct = /* @__PURE__ */ new Set(), qn(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && bn(r), Ct?.size > 0)) {
				kt.clear();
				for (let e of Ct) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) Ct.has(n) && (Ct.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || qn(n);
					}
				}
				Ct.clear();
			}
		}
		Ct = null;
	}
}
function Tt(e) {
	F.schedule(e);
}
function Et(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), P(e, m);
		for (var n = e.first; n !== null;) Et(n, t), n = n.next;
	}
}
function Dt(e) {
	P(e, m);
	for (var t = e.first; t !== null;) Dt(t), t = t.next;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/sources.js
var Ot = /* @__PURE__ */ new Set(), kt = /* @__PURE__ */ new Map(), At = !1;
function jt(e, t) {
	return {
		f: 0,
		v: e,
		reactions: null,
		equals: Se,
		rv: 0,
		wv: 0
	};
}
/*#__NO_SIDE_EFFECTS__*/
function L(e, t) {
	let n = jt(e, t);
	return Nn(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function Mt(e, t = !1, n = !0) {
	let r = jt(e);
	return t || (r.equals = we), r;
}
function R(e, t, n = !1) {
	return G !== null && (!kn || G.f & 131072) && Be() && G.f & 4325394 && (Mn === null || !Mn.has(e)) && Pe(), Ft(e, n ? zt(t) : t, _t);
}
var Nt = null, Pt = 0;
function Ft(e, t, n = null) {
	if (!e.equals(t)) {
		Dn ? kt.set(e, t) : kt.has(e) || kt.set(e, e.v);
		var r = bt.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && st(t), I === null && Ge(t);
		}
		e.wv = Bn(), Nt = null, Pt = 0, Rt(e, h, n), Nt = null, Be() && K !== null && K.f & 1024 && !(K.f & 96) && (Pn === null ? Fn([e]) : Pn.push(e)), !r.is_fork && Ot.size > 0 && !At && It();
	}
	return t;
}
function It() {
	At = !1;
	for (let e of Ot) {
		e.f & 1024 && P(e, g);
		let t;
		try {
			t = Vn(e);
		} catch {
			t = !0;
		}
		t && qn(e);
	}
	Ot.clear();
}
function Lt(e) {
	R(e, e.v + 1);
}
function Rt(e, t, n) {
	var r = e.reactions;
	if (r !== null) {
		var i = Be(), a = r.length;
		if (Pt += a, Pt > 1e5 && Nt === null && (Nt = /* @__PURE__ */ new Set()), Nt !== null) {
			if (Nt.has(e)) return;
			Nt.add(e);
		}
		for (var o = 0; o < a; o++) {
			var s = r[o], c = s.f;
			if (i || s !== K) {
				var l = (c & h) === 0;
				if (l && P(s, t), c & 131072) Ot.add(s);
				else if (c & 2) {
					var u = s;
					I?.delete(u), Rt(u, g, n);
				} else if (l) {
					var d = s;
					c & 16 && Ct !== null && Ct.add(d), n === null ? Tt(d) : n.push(d);
				}
			}
		}
	}
}
function zt(t) {
	if (typeof t != "object" || !t || te in t || ne in t) return t;
	let n = l(t);
	if (n !== s && n !== c) return t;
	var r = /* @__PURE__ */ new Map(), i = e(t), o = /* @__PURE__ */ L(0), u = null, d = Rn, f = (e) => {
		if (Rn === d) return e();
		var t = G, n = Rn;
		An(null), zn(d);
		var r = e();
		return An(t), zn(n), r;
	};
	return i && r.set("length", /* @__PURE__ */ L(t.length, u)), new Proxy(t, {
		defineProperty(e, t, n) {
			(!("value" in n) || n.configurable === !1 || n.enumerable === !1 || n.writable === !1) && Me();
			var i = r.get(t);
			return i === void 0 ? f(() => {
				var e = /* @__PURE__ */ L(n.value, u);
				return r.set(t, e), e;
			}) : R(i, n.value, !0), !0;
		},
		deleteProperty(e, t) {
			var n = r.get(t);
			if (n === void 0) {
				if (t in e) {
					let e = f(() => /* @__PURE__ */ L(D, u));
					r.set(t, e), Lt(o);
				}
			} else R(n, D), Lt(o);
			return !0;
		},
		get(e, n, i) {
			if (n === te) return t;
			var o = r.get(n), s = n in e;
			if (o === void 0 && (!s || a(e, n)?.writable) && (o = f(() => /* @__PURE__ */ L(zt(s ? e[n] : D), u)), r.set(n, o)), o !== void 0) {
				var c = Y(o);
				return c === D ? void 0 : c;
			}
			return Reflect.get(e, n, i);
		},
		getOwnPropertyDescriptor(e, t) {
			this.has?.(e, t);
			var n = Reflect.getOwnPropertyDescriptor(e, t), i = r.get(t);
			if (i !== void 0) {
				var a = Y(i);
				if (a === D) return;
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
			if (t === te) return !0;
			var n = r.get(t), i = n !== void 0 && n.v !== D || Reflect.has(e, t);
			return (n !== void 0 || K !== null && (!i || a(e, t)?.writable)) && (n === void 0 && (n = f(() => /* @__PURE__ */ L(i ? zt(e[t]) : D, u)), r.set(t, n)), Y(n) === D) ? !1 : i;
		},
		set(e, t, n, s) {
			var c = r.get(t), l = t in e;
			if (i && t === "length") for (var d = n; d < c.v; d += 1) {
				var p = r.get(d + "");
				p === void 0 ? d in e && (p = f(() => /* @__PURE__ */ L(D, u)), r.set(d + "", p)) : R(p, D);
			}
			if (c === void 0) (!l || a(e, t)?.writable) && (c = f(() => /* @__PURE__ */ L(void 0, u)), R(c, zt(n)), r.set(t, c));
			else {
				l = c.v !== D;
				var m = f(() => zt(n));
				R(c, m);
			}
			var h = Reflect.getOwnPropertyDescriptor(e, t);
			if (h?.set && h.set.call(s, n), !l) {
				if (i && typeof t == "string") {
					var g = r.get("length"), _ = Number(t);
					Number.isInteger(_) && _ >= g.v && R(g, _ + 1);
				}
				Lt(o);
			}
			return !0;
		},
		ownKeys(e) {
			Y(o);
			var t = Reflect.ownKeys(e).filter((e) => {
				var t = r.get(e);
				return t === void 0 || t.v !== D;
			});
			for (var [n, i] of r) i.v !== D && !(n in e) && t.push(n);
			return t;
		},
		setPrototypeOf() {
			Ne();
		}
	});
}
function Bt(e) {
	try {
		if (typeof e == "object" && e && te in e) return e[te];
	} catch {}
	return e;
}
function Vt(e, t) {
	return Object.is(Bt(e), Bt(t));
}
var Ht, Ut, Wt, Gt;
function Kt() {
	if (Ht === void 0) {
		Ht = window, Ut = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		Wt = a(t, "firstChild").get, Gt = a(t, "nextSibling").get, u(e) && (e[ae] = void 0, e[ie] = null, e[oe] = void 0, e.__e = void 0), u(n) && (n[se] = void 0);
	}
}
function z(e = "") {
	return document.createTextNode(e);
}
/*@__NO_SIDE_EFFECTS__*/
function qt(e) {
	return Wt.call(e);
}
/*@__NO_SIDE_EFFECTS__*/
function Jt(e) {
	return Gt.call(e);
}
function B(e, t) {
	if (!O) return /* @__PURE__ */ qt(e);
	var n = /* @__PURE__ */ qt(k);
	if (n === null) n = k.appendChild(z());
	else if (t && n.nodeType !== 3) {
		var r = z();
		return n?.before(r), A(r), r;
	}
	return t && $t(n), A(n), n;
}
function Yt(e, t = !1) {
	if (!O) {
		var n = /* @__PURE__ */ qt(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ Jt(n) : n;
	}
	if (t) {
		if (k?.nodeType !== 3) {
			var r = z();
			return k?.before(r), A(r), r;
		}
		$t(k);
	}
	return k;
}
function V(e, t = !1) {
	if (!O) return /* @__PURE__ */ qt(e);
	var n = B(e, t);
	return j(e), n;
}
function H(e, t = 1, n = !1) {
	let r = O ? k : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ Jt(r);
	if (!O) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = z();
			return r === null ? i?.after(a) : r.before(a), A(a), a;
		}
		$t(r);
	}
	return A(r), r;
}
function Xt(e) {
	e.textContent = "";
}
function Zt() {
	return !1;
}
function Qt(e, t, n) {
	return t == null || t === "http://www.w3.org/1999/xhtml" ? n ? document.createElement(e, { is: n }) : document.createElement(e) : n ? document.createElementNS(t, e, { is: n }) : document.createElementNS(t, e);
}
function $t(e) {
	if (e.nodeValue.length < 65536) return;
	let t = e.nextSibling;
	for (; t !== null && t.nodeType === 3;) t.remove(), e.nodeValue += t.nodeValue, t = e.nextSibling;
}
function en(e) {
	var t = K;
	if (t === null) return G.f |= E, e;
	if (!(t.f & 32768) && !(t.f & 4)) throw e;
	tn(e, t);
}
function tn(e, t) {
	if (e === de) throw e;
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
function nn(e) {
	K === null && (G === null && Ae(e), ke()), Dn && Oe(e);
}
function rn(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function an(e, t) {
	var n = K;
	n !== null && n.f & 8192 && (e |= _);
	var r = {
		ctx: M,
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
	F?.register_created_effect(r);
	var i = r;
	if (e & 4) gt === null ? bt.ensure().schedule(r) : gt.push(r);
	else if (t !== null) {
		try {
			qn(r);
		} catch (e) {
			throw W(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= x));
	}
	if (i !== null && (i.parent = n, n !== null && rn(i, n), G !== null && G.f & 2 && !(e & 64))) {
		var a = G;
		(a.effects ??= []).push(i);
	}
	return r;
}
function on() {
	return G !== null && !kn;
}
function sn(e) {
	let t = an(8, null);
	return P(t, m), t.teardown = e, t;
}
function cn(e) {
	nn("$effect");
	var t = K.f;
	if (!G && t & 32 && M !== null && !M.i) {
		var n = M;
		(n.e ??= []).push(e);
	} else return ln(e);
}
function ln(e) {
	return an(4 | ee, e);
}
function un(e) {
	bt.ensure();
	let t = an(64 | S, e);
	return (e = {}) => new Promise((n) => {
		e.outro ? xn(t, () => {
			W(t), n(void 0);
		}) : (W(t), n(void 0));
	});
}
function dn(e) {
	return an(4, e);
}
function fn(e) {
	return an(T | S, e);
}
function pn(e, t = 0) {
	return an(8 | t, e);
}
function U(e, t = [], n = [], r = []) {
	Ze(r, t, n, (t) => {
		an(8, () => {
			e(...t.map(Y));
		});
	});
}
function mn(e, t = 0) {
	return an(16 | t, e);
}
function hn(e) {
	return an(32 | S, e);
}
function gn(e) {
	var t = e.teardown;
	if (t !== null) {
		let n = Dn, r = G;
		On(!0), An(null);
		try {
			t.call(null);
		} catch (t) {
			tn(t, e.parent);
		} finally {
			On(n), An(r);
		}
	}
}
function _n(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && Ye(() => {
			e.abort(le);
		});
		var r = n.next;
		n.f & 64 ? n.parent = null : W(n, t), n = r;
	}
}
function vn(e) {
	for (var t = e.first; t !== null;) {
		var n = t.next;
		t.f & 32 || W(t), t = n;
	}
}
function W(e, t = !0) {
	var n = !1;
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (yn(e.nodes.start, e.nodes.end), n = !0), e.f |= b, _n(e, t && !n), Kn(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	gn(e), e.f ^= b, e.f |= v;
	var i = e.parent;
	i !== null && i.first !== null && bn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function yn(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ Jt(e);
		e.remove(), e = n;
	}
}
function bn(e) {
	var t = e.parent, n = e.prev, r = e.next;
	n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function xn(e, t, n = !0) {
	var r = [];
	e.f |= 256, Sn(e, r, !0);
	var i = () => {
		n && W(e), t && t();
	}, a = r.length;
	if (a > 0) {
		var o = () => --a || i();
		for (var s of r) s.out(o);
	} else i();
}
function Sn(e, t, n) {
	if (!(e.f & 8192)) {
		e.f ^= _;
		var r = e.nodes && e.nodes.t;
		if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
		for (var i = e.first; i !== null;) {
			var a = i.next;
			if (!(i.f & 64)) {
				var o = !!(i.f & 65536) || !!(i.f & 32) && !!(e.f & 16);
				Sn(i, t, o ? n : !1);
			}
			i = a;
		}
	}
}
function Cn(e) {
	e.f &= -257, wn(e, !0);
}
function wn(e, t) {
	if (!(e.f & 256) && e.f & 8192) {
		e.f ^= _, e.f & 1024 || (P(e, h), bt.ensure().schedule(e));
		for (var n = e.first; n !== null;) {
			var r = n.next, i = !!(n.f & 65536) || !!(n.f & 32);
			wn(n, i ? t : !1), n = r;
		}
		var a = e.nodes && e.nodes.t;
		if (a !== null) for (let e of a) (e.is_global || t) && e.in();
	}
}
function Tn(e, t) {
	if (e.nodes) for (var n = e.nodes.start, r = e.nodes.end; n !== null;) {
		var i = n === r ? null : /* @__PURE__ */ Jt(n);
		t.append(n), n = i;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/legacy.js
var En = null, Dn = !1;
function On(e) {
	Dn = e;
}
var G = null, kn = !1;
function An(e) {
	G = e;
}
var K = null;
function jn(e) {
	K = e;
}
var Mn = null;
function Nn(e) {
	G !== null && (G.f & 2097152 || G.f & 2) && (Mn ??= /* @__PURE__ */ new Set()).add(e);
}
var q = null, J = 0, Pn = null;
function Fn(e) {
	Pn = e;
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
			if (Vn(a) && ct(a), a.wv > e.wv) return !0;
		}
		t & 512 && I === null && P(e, m);
	}
	return !1;
}
function Hn(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(Mn !== null && Mn.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? Hn(a, t, !1) : t === a && (n ? P(a, h) : a.f & 1024 && P(a, g), Tt(a));
	}
}
function Un(e) {
	var t = q, n = J, r = Pn, i = G, a = Mn, o = M, s = kn, c = Rn, l = e.f;
	q = null, J = 0, Pn = null, G = l & 96 ? null : e, Mn = null, Ie(e.ctx), kn = !1, Rn = ++Ln, e.ac !== null && (Ye(() => {
		e.ac.abort(le);
	}), e.ac = null);
	try {
		e.f |= w;
		var u = e.fn, d = u();
		e.f |= y;
		var f = Wn(e);
		if (Be() && Pn !== null && !kn && f !== null && !(e.f & 6146)) for (var p = 0; p < Pn.length; p++) Hn(Pn[p], e);
		if (i !== null && i !== e) {
			if (Ln++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = Ln;
			if (t !== null) for (let e of t) e.rv = Ln;
			Pn !== null && (r === null ? r = Pn : r.push(...Pn));
		}
		return e.f & 8388608 && (e.f ^= E), d;
	} catch (t) {
		return Wn(e), en(t);
	} finally {
		e.f ^= w, q = t, J = n, Pn = r, G = i, Mn = a, Ie(o), kn = s, Rn = c;
	}
}
function Wn(e) {
	var t = e.deps, n = F?.is_fork;
	if (q !== null) {
		var r;
		if (n || Kn(e, J), t !== null && J > 0) for (t.length = J + q.length, r = 0; r < q.length; r++) t[J + r] = q[r];
		else e.deps = t = q;
		if (on() && e.f & 512) for (r = J; r < t.length; r++) (t[r].reactions ??= []).push(e);
	} else !n && t !== null && J < t.length && (Kn(e, J), t.length = J);
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
	if (i === null && r.f & 2 && (q === null || !n.call(q, r))) {
		var s = r;
		s.f & 512 && (s.f ^= 512), s.v !== D && Ge(s), s.ac !== null && Ye(() => {
			s.ac.abort(le), s.ac = null, P(s, h);
		}), lt(s), Kn(s, 0);
	}
}
function Kn(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) Gn(e, n[r]);
}
function qn(e) {
	var t = e.f;
	if (!(t & 16384)) {
		P(e, m);
		var n = K;
		K = e;
		try {
			t & 16777232 ? vn(e) : _n(e), gn(e);
			var r = Un(e);
			e.teardown = typeof r == "function" ? r : null, e.wv = In;
		} finally {
			K = n;
		}
	}
}
async function Jn() {
	await Promise.resolve(), xt();
}
function Y(e) {
	var t = !!(e.f & 2);
	if (En?.add(e), G !== null && !kn && !(K !== null && K.f & 16384) && (Mn === null || !Mn.has(e))) {
		var r = G.deps;
		if (G.f & 2097152) e.rv < Ln && (e.rv = Ln, q === null && r !== null && r[J] === e ? J++ : q === null ? q = [e] : q.push(e));
		else {
			G.deps ??= [], n.call(G.deps, e) || G.deps.push(e);
			var i = e.reactions;
			i === null ? e.reactions = [G] : n.call(i, G) || i.push(G);
		}
	}
	if (Dn && kt.has(e)) return kt.get(e);
	if (t) {
		var a = e;
		if (Dn) {
			var o = a.v;
			return (!(a.f & 1024) && a.reactions !== null || Xn(a)) && (o = st(a)), kt.set(a, o), o;
		}
		var s = !(a.f & 512) && !kn && G !== null && !!(G.f & 512), c = (a.f & y) === 0;
		Vn(a) && (s && (a.f |= 512), ct(a)), s && !c && (ut(a), Yn(a));
	}
	if (I?.has(e)) return I.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function Yn(e) {
	if (e.f |= 512, e.deps !== null) for (let r of e.deps) {
		var t = r.reactions;
		t === null ? r.reactions = [e] : n.call(t, e) || t.push(e), r.f & 2 && !(r.f & 512) && (ut(r), Yn(r));
	}
}
function Xn(e) {
	if (e.v === D) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (kt.has(t) || t.f & 2 && Xn(t)) return !0;
	return !1;
}
function Zn(e) {
	var t = kn;
	try {
		return kn = !0, e();
	} finally {
		kn = t;
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
		if (r.capture || cr.call(t, e), !e.cancelBubble) return Ye(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? (i.__removed = !1, N(() => {
		i.__removed || t.addEventListener(e, i, r);
	})) : t.addEventListener(e, i, r), i;
}
function ir(e, t, n, r, i) {
	var a = {
		capture: r,
		passive: i
	}, o = rr(e, t, n, a);
	(t === document.body || t === window || t === document || t instanceof HTMLMediaElement) && sn(() => {
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
		var d = G, f = K;
		An(null), jn(null);
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
			e[er] = t, delete e.currentTarget, An(d), jn(f);
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
	var t = Qt("template");
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
		if (O) return fr(k, null), k;
		i === void 0 && (i = dr(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ qt(i)));
		var t = r || Ut ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ qt(t), s = t.lastChild;
			fr(o, s);
		} else fr(t, t);
		return t;
	};
}
function pr() {
	if (O) return fr(k, null), k;
	var e = document.createDocumentFragment(), t = document.createComment(""), n = z();
	return e.append(t, n), fr(t, n), e;
}
function Q(e, t) {
	if (O) {
		var n = K;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = k), ve();
	} else e !== null && e.before(t);
}
//#endregion
//#region node_modules/svelte/src/reactivity/create-subscriber.js
function mr(e) {
	let t = 0, n = jt(0), r;
	return () => {
		on() && (Y(n), pn(() => (t === 0 && (r = Zn(() => e(() => Lt(n)))), t += 1, () => {
			N(() => {
				--t, t === 0 && (r?.(), r = void 0, Lt(n));
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
	#t = O ? k : null;
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
	#h = mr(() => (this.#m = jt(this.#l), () => {
		this.#m = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#n = t, this.#r = (e) => {
			var t = K;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = K.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = mn(() => {
			if (O) {
				let e = xe(this.#t);
				ve();
				let t = e === "[!";
				if (e.startsWith("[?")) {
					let t = JSON.parse(e.slice(2));
					this.#_(t);
				} else t ? this.#b() : this.#g();
			} else this.#x();
		}, hr), O && (this.#e = k);
	}
	#g() {
		try {
			this.#a = hn(() => this.#r(this.#e));
		} catch (e) {
			this.error(e);
		}
	}
	#_(e) {
		let t = this.#n.failed, { reset: n, invoke_onerror: r } = this.#v(e);
		N(r), t && (this.#s = hn(() => {
			t(this.#e, () => e, () => n);
		}));
	}
	#v(e) {
		var t = !1, n = !1;
		let r = () => {
			this.#y() || (t ? ge() : (t = !0, n && Fe(), this.#s !== null && xn(this.#s, () => {
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
					tn(e, this.#i && this.#i.parent);
				}
			}
		};
	}
	#y() {
		return (this.#i.f & (v | b)) !== 0;
	}
	#b() {
		let e = this.#n.pending;
		e && (this.is_pending = !0, this.#o = hn(() => e(this.#e)), N(() => {
			if (!this.#y()) {
				var e = this.#c = document.createDocumentFragment(), t = z(), n = !1;
				e.append(t), this.#a = this.#C(() => {
					try {
						return hn(() => this.#r(t));
					} catch (e) {
						try {
							this.error(e), n = !0;
						} catch (e) {
							tn(e, this.#i.parent);
						}
						return null;
					}
				}), this.#a === null ? (this.#c = null, n && this.#S(F)) : this.#u === 0 && (this.#e.before(e), this.#c = null, xn(this.#o, () => {
					this.#o = null;
				}), this.#S(F));
			}
		}));
	}
	#x() {
		try {
			if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#l = 0, this.#a = hn(() => {
				this.#r(this.#e);
			}), this.#u > 0) {
				var e = this.#c = document.createDocumentFragment();
				Tn(this.#a, e);
				let t = this.#n.pending;
				this.#o = hn(() => t(this.#e));
			} else this.#S(F);
		} catch (e) {
			this.error(e);
		}
	}
	#S(e) {
		this.is_pending = !1, e.transfer_effects(this.#f, this.#p);
	}
	defer_effect(e) {
		Ke(e, this.#f, this.#p);
	}
	is_rendered() {
		return !this.is_pending && (!this.parent || this.parent.is_rendered());
	}
	has_pending_snippet() {
		return !!this.#n.pending;
	}
	#C(e) {
		var t = K, n = G, r = M;
		jn(this.#i), An(this.#i), Ie(this.#i.ctx);
		try {
			return bt.ensure(), e();
		} finally {
			jn(t), An(n), Ie(r);
		}
	}
	#w(e, t) {
		this.has_pending_snippet() ? (this.#u += e, this.#u === 0 && (this.#S(t), this.#o && xn(this.#o, () => {
			this.#o = null;
		}), this.#c &&= (this.#e.before(this.#c), null))) : this.parent && this.parent.#w(e, t);
	}
	update_pending_count(e, t) {
		this.#w(e, t), this.#l += e, !(!this.#m || this.#d) && (this.#d = !0, N(() => {
			this.#d = !1, this.#m && Ft(this.#m, this.#l);
		}));
	}
	get_effect_pending() {
		return this.#h(), Y(this.#m);
	}
	error(e) {
		if (e === de || !this.#n.onerror && !this.#n.failed) throw e;
		F?.is_fork ? (this.#a && F.skip_effect(this.#a), this.#o && F.skip_effect(this.#o), this.#s && F.skip_effect(this.#s), F.oncommit(() => {
			this.#y() || this.#T(e);
		})) : this.#T(e);
	}
	#T(e) {
		this.#a &&= (W(this.#a), null), this.#o &&= (W(this.#o), null), this.#s &&= (W(this.#s), null), O && (A(this.#t), ye(), A(be()));
		let t = this.#n.failed, n = (e) => {
			if (this.#y()) return;
			let { reset: n, invoke_onerror: r } = this.#v(e);
			r(), t && !this.#y() && (this.#s = this.#C(() => {
				try {
					return hn(() => {
						var r = K;
						r.b = this, r.f |= 128, t(this.#e, () => e, () => n);
					});
				} catch (e) {
					return tn(e, this.#i.parent), null;
				}
			}));
		};
		N(() => {
			if (!this.#y()) {
				var t;
				try {
					t = this.transform_error(e);
				} catch (e) {
					tn(e, this.#i && this.#i.parent);
					return;
				}
				typeof t == "object" && t && typeof t.then == "function" ? t.then(n, (e) => tn(e, this.#i && this.#i.parent)) : n(t);
			}
		});
	}
};
function $(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[se] ??= e.nodeValue) && (e[se] = n, e.nodeValue = `${n}`);
}
function vr(e, t) {
	return br(e, t);
}
var yr = /* @__PURE__ */ new Map();
function br(e, { target: t, anchor: n, props: i = {}, events: a, context: o, intro: s = !0, transformError: c }) {
	Kt();
	var l = void 0, u = un(() => {
		var s = n ?? t.appendChild(z());
		gr(s, { pending: () => {} }, (t) => {
			Le({});
			var n = M;
			if (o && (n.c = o), a && (i.$$events = a), O && fr(t, null), l = e(t, i) || ze(), O && (K.nodes.end = k, k === null || k.nodeType !== 8 || k.data !== "]")) throw me(), de;
			Re();
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
			if (n) Cn(n), this.#r.delete(t);
			else {
				var r = this.#n.get(t);
				r && (Cn(r.effect), this.#t.set(t, r.effect), this.#n.delete(t), r.fragment.lastChild.remove(), this.anchor.before(r.fragment), n = r.effect);
			}
			for (let [t, n] of this.#e) {
				if (this.#e.delete(t), t === e) break;
				let r = this.#n.get(n);
				r && (W(r.effect), this.#n.delete(n));
			}
			for (let [e, r] of this.#t) {
				if (e === t || this.#r.has(e)) continue;
				let i = () => {
					if (Array.from(this.#e.values()).includes(e)) {
						var t = document.createDocumentFragment();
						Tn(r, t), t.append(z()), this.#n.set(e, {
							effect: r,
							fragment: t
						});
					} else W(r);
					this.#r.delete(e), this.#t.delete(e);
				};
				this.#i || !n ? (this.#r.add(e), xn(r, i, !1)) : i();
			}
		}
	};
	#o = (e) => {
		this.#e.delete(e);
		let t = Array.from(this.#e.values());
		for (let [e, n] of this.#n) t.includes(e) || (W(n.effect), this.#n.delete(e));
	};
	ensure(e, t) {
		var n = F, r = Zt();
		if (t && !this.#t.has(e) && !this.#n.has(e)) {
			if (r) {
				var i = document.createDocumentFragment(), a = z();
				i.append(a), this.#n.set(e, {
					effect: hn(() => t(a)),
					fragment: i
				});
			} else this.#t.set(e, hn(() => t(this.anchor)));
		}
		if (this.#e.set(n, e), r) {
			for (let [t, r] of this.#t) t === e ? n.unskip_effect(r) : n.skip_effect(r);
			for (let [t, r] of this.#n) t === e ? n.unskip_effect(r.effect) : n.skip_effect(r.effect);
			n.oncommit(this.#a), n.ondiscard(this.#o);
		} else O && (this.anchor = k), this.#a(n);
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/if.js
function Cr(e, t, n = !1) {
	var r;
	O && (r = k, ve());
	var i = new Sr(e), a = n ? x : 0;
	function o(e, t) {
		if (O) {
			var n = xe(r);
			if (e !== parseInt(n.substring(1))) {
				var a = be();
				A(a), i.anchor = a, _e(!1), i.ensure(e, t), _e(!0);
				return;
			}
		}
		i.ensure(e, t);
	}
	mn(() => {
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
		xn(n, () => {
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
			Xt(d), d.append(u), e.items.clear();
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
		r?.has(a) ? (a.f |= C, Tn(a, document.createDocumentFragment())) : W(t[i], n);
	}
}
var Er;
function Dr(t, n, i, a, o, s = null) {
	var c = t, l = /* @__PURE__ */ new Map();
	if (n & 4) {
		var u = t;
		c = O ? A(/* @__PURE__ */ qt(u)) : u.appendChild(z());
	}
	O && ve();
	var d = null, f = /* @__PURE__ */ at(() => {
		var t = i();
		return e(t) ? t : t == null ? [] : r(t);
	}), p = /* @__PURE__ */ new Map(), m = !0;
	function h(e) {
		if (!(_.effect.f & 16384)) {
			_.pending.delete(e);
			var t = Y(f);
			_.fallback = d, kr(_, t, c, n, a), d !== null && (t.length === 0 ? d.f & 33554432 ? (d.f ^= C, jr(d, null, c)) : Cn(d) : xn(d, () => {
				d = null;
			}));
		}
	}
	function g(e) {
		_.pending.delete(e);
	}
	var _ = {
		effect: mn(() => {
			var e = Y(f), t = e.length;
			let r = !1;
			O && xe(c) === "[!" != (t === 0) && (c = be(), A(c), _e(!1), r = !0);
			for (var u = /* @__PURE__ */ new Set(), _ = F, v = Zt(), y = 0; y < t; y += 1) {
				O && k.nodeType === 8 && k.data === "]" && (c = k, r = !0, _e(!1));
				var b = e[y], x = a(b, y), S = m ? null : l.get(x);
				S ? (S.v && Ft(S.v, b), S.i && Ft(S.i, y), v && _.unskip_effect(S.e)) : (S = Ar(l, m ? c : Er ??= z(), b, x, y, o, n, i), m || (S.e.f |= C), l.set(x, S)), u.add(x);
			}
			if (t === 0 && s && !d && (m ? d = hn(() => s(c)) : (d = hn(() => s(Er ??= z())), d.f |= C)), t > u.size && De("", "", ""), O && t > 0 && A(be()), !m) {
				if (p.set(_, u), v) {
					for (let [e, t] of l) u.has(e) || _.skip_effect(t.e);
					_.oncommit(h), _.ondiscard(g);
				} else h(_);
			}
			r && _e(!0), Y(f);
		}),
		flags: n,
		items: l,
		pending: p,
		outrogroups: null,
		fallback: d
	};
	m = !1, O && (c = k);
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
		if (_.f & 8192 && (Cn(_), o && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
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
		var T = w.length;
		if (T > 0) {
			var E = i & 4 && s === 0 ? n : null;
			if (o) {
				for (v = 0; v < T; v += 1) w[v].nodes?.a?.measure();
				for (v = 0; v < T; v += 1) w[v].nodes?.a?.fix();
			}
			wr(e, w, E);
		}
	}
	o && N(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function Ar(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? jt(n) : /* @__PURE__ */ Mt(n, !1, !1) : null, l = o & 2 ? jt(i) : null;
	return {
		v: c,
		i: l,
		e: hn(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function jr(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ Jt(r);
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
	var o = e[ae];
	if (O || o !== n || o === void 0) {
		var s = Pr(n, r, a);
		(!O || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[ae] = n;
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
			Ir(c, i ? a.includes(l) : Vt(l, r));
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
		if (!e(n)) return he();
		for (var i of t.options) i.selected = n.includes(Vr(i));
	} else {
		for (i of t.options) if (Vt(Vr(i), n)) {
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
	}), sn(() => {
		t.disconnect();
	});
}
function Br(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet(), i = !0;
	Xe(e, "change", (t) => {
		var i = t ? "[selected]" : ":checked", a;
		if (e.multiple) a = [].map.call(e.querySelectorAll(i), Vr);
		else {
			var o = e.querySelector(i) ?? e.querySelector("option:not([disabled])");
			a = o && Vr(o);
		}
		n(a), e.__value = a, F !== null && r.add(F);
	}), dn(() => {
		var a = t();
		if (e === document.activeElement) {
			var o = F;
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
var Ur = Symbol("is custom element"), Wr = Symbol("is html"), Gr = ue ? "link" : "LINK", Kr = ue ? "progress" : "PROGRESS";
function qr(e) {
	if (O) {
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
		e[ce] = n, N(n), Je();
	}
}
function Jr(e, t) {
	var n = Xr(e);
	n.value !== (n.value = t ?? void 0) && (e.value !== t || t === 0 && e.nodeName === Kr) && (e.value = t ?? "");
}
function Yr(e, t, n, r) {
	var i = Xr(e);
	O && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === Gr) || i[t] !== (i[t] = n) && (t === "loading" && (e[re] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && Qr(e).has(t) ? e[t] = n : e.setAttribute(t, n));
}
function Xr(e) {
	return e[ie] ??= {
		[Ur]: e.nodeName.includes("-"),
		[Wr]: e.namespaceURI === fe
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
	Xe(e, "input", async (i) => {
		var a = i ? e.defaultValue : e.value;
		if (a = ei(e) ? ti(a) : a, n(a), F !== null && r.add(F), await Jn(), a !== (a = t())) {
			var o = e.selectionStart, s = e.selectionEnd, c = e.value.length;
			if (e.value = a ?? "", s !== null) {
				var l = e.value.length;
				o === s && s === c && l > c ? (e.selectionStart = l, e.selectionEnd = l) : (e.selectionStart = o, e.selectionEnd = Math.min(s, l));
			}
		}
	}), (O && e.defaultValue !== e.value || Zn(t) == null && e.value) && (n(ei(e) ? ti(e.value) : e.value), F !== null && r.add(F)), pn(() => {
		var n = t();
		if (e === document.activeElement) {
			var i = F;
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
	M === null && Te("onMount"), cn(() => {
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
var Di = /* @__PURE__ */ Z("<button type=\"button\" class=\"receiver-island__bookmark svelte-apy39n\"> </button> <button type=\"button\" class=\"receiver-island__bookmark svelte-apy39n\">Open separate window</button>", 1), Oi = /* @__PURE__ */ Z("<option> </option>"), ki = /* @__PURE__ */ Z("<button type=\"button\" class=\"receiver-island__record svelte-apy39n\"> </button>"), Ai = /* @__PURE__ */ Z("<span class=\"receiver-island__audio-warning svelte-apy39n\" role=\"status\"> </span>"), ji = /* @__PURE__ */ Z("<span class=\"receiver-island__health-error svelte-apy39n\" role=\"status\"> </span>"), Mi = /* @__PURE__ */ Z("<li class=\"svelte-apy39n\"><span> </span> <p class=\"svelte-apy39n\"> </p></li>"), Ni = /* @__PURE__ */ Z("<ol class=\"receiver-island__data2g-aprs svelte-apy39n\"></ol>"), Pi = /* @__PURE__ */ Z("<li class=\"svelte-apy39n\"><span> </span> <code class=\"svelte-apy39n\"> </code></li>"), Fi = /* @__PURE__ */ Z("<ol class=\"svelte-apy39n\"></ol>"), Ii = /* @__PURE__ */ Z("<p class=\"svelte-apy39n\">No complete Data2G frame received yet. Decoded frames appear here.</p>"), Li = /* @__PURE__ */ Z("<li class=\"svelte-apy39n\"> </li>"), Ri = /* @__PURE__ */ Z("<ol class=\"receiver-island__data2g-activity svelte-apy39n\" aria-label=\"Recent Data2G channel and burst activity\"></ol>"), zi = /* @__PURE__ */ Z("<section class=\"receiver-island__data2g svelte-apy39n\" aria-label=\"Data2G receive activity\"><div class=\"receiver-island__data2g-heading svelte-apy39n\"><strong>DATA2G RECEIVE</strong> <span aria-live=\"polite\" class=\"svelte-apy39n\"> </span></div> <!> <!> <!></section>"), Bi = /* @__PURE__ */ Z("<label class=\"receiver-island__layout-select-label svelte-apy39n\" for=\"receiver-modern-layout-list\">THIS RECEIVER PROFILE</label> <div class=\"receiver-island__layout-actions svelte-apy39n\"><select id=\"receiver-modern-layout-list\" class=\"svelte-apy39n\"><option>Choose a saved layout</option><!></select> <button type=\"button\" class=\"receiver-island__apply svelte-apy39n\">Apply</button> <button type=\"button\" class=\"receiver-island__zoom svelte-apy39n\">Remove</button></div>", 1), Vi = /* @__PURE__ */ Z("<p class=\"receiver-island__layout-empty svelte-apy39n\">Save a frequency and mode combination for quick recall.</p>"), Hi = /* @__PURE__ */ Z("<li class=\"svelte-apy39n\"><header class=\"svelte-apy39n\"><time> </time> <span> </span> <span> </span> <span> </span></header> <pre class=\"svelte-apy39n\"> </pre></li>"), Ui = /* @__PURE__ */ Z("<ol class=\"receiver-island__history-list svelte-apy39n\"></ol>"), Wi = /* @__PURE__ */ Z("<p class=\"svelte-apy39n\"> </p>"), Gi = /* @__PURE__ */ Z("<section class=\"receiver-island svelte-apy39n\" aria-label=\"Receiver tuning and status\"><header class=\"receiver-island__identity svelte-apy39n\"><div class=\"receiver-island__receiver-name svelte-apy39n\"><span class=\"receiver-island__eyebrow svelte-apy39n\">OPENWEBRX+</span> <span class=\"receiver-island__profile svelte-apy39n\"> </span></div> <div class=\"receiver-island__header-actions svelte-apy39n\"><button type=\"button\" class=\"receiver-island__bookmark svelte-apy39n\">Save station</button> <!> <button type=\"button\" class=\"receiver-island__advanced-toggle svelte-apy39n\" aria-controls=\"openwebrx-panel-receiver\"> </button></div> <span class=\"receiver-island__header-message svelte-apy39n\" aria-live=\"polite\"> </span></header> <div class=\"receiver-island__listening-bar svelte-apy39n\"><form class=\"receiver-island__tuning svelte-apy39n\"><button type=\"button\" class=\"receiver-island__nudge svelte-apy39n\" aria-label=\"Tune down one step\">−</button> <label class=\"receiver-island__frequency-label svelte-apy39n\" for=\"receiver-modern-frequency\">FREQUENCY · MHz</label> <input id=\"receiver-modern-frequency\" class=\"receiver-island__frequency svelte-apy39n\" type=\"number\" inputmode=\"decimal\" min=\"0.001\" step=\"0.000001\" aria-describedby=\"receiver-modern-tune-message\" aria-label=\"Tune frequency in megahertz\"/> <button type=\"submit\" class=\"receiver-island__apply svelte-apy39n\">Tune</button> <button type=\"button\" class=\"receiver-island__nudge svelte-apy39n\" aria-label=\"Tune up one step\">+</button> <span class=\"receiver-island__step svelte-apy39n\"> </span> <span id=\"receiver-modern-tune-message\" class=\"receiver-island__message svelte-apy39n\" aria-live=\"polite\"> </span></form> <form class=\"receiver-island__mode-picker svelte-apy39n\" aria-label=\"Select receiver mode\"><label for=\"receiver-modern-mode\">MODE</label> <select id=\"receiver-modern-mode\" aria-describedby=\"receiver-modern-mode-message\" class=\"svelte-apy39n\"><!></select> <button type=\"submit\" class=\"receiver-island__apply svelte-apy39n\">Apply</button> <span id=\"receiver-modern-mode-message\" class=\"receiver-island__message svelte-apy39n\" aria-live=\"polite\"> </span></form> <div class=\"receiver-island__audio svelte-apy39n\" aria-label=\"Audio controls\"><button type=\"button\" class=\"receiver-island__mute svelte-apy39n\"> </button> <!> <label for=\"receiver-modern-volume\">VOLUME</label> <input id=\"receiver-modern-volume\" type=\"range\" min=\"0\" max=\"150\" step=\"1\" aria-label=\"Audio volume\" class=\"svelte-apy39n\"/> <output for=\"receiver-modern-volume\" class=\"svelte-apy39n\"> </output> <span class=\"receiver-island__record-message svelte-apy39n\" aria-live=\"polite\"> </span></div></div> <div class=\"receiver-island__status svelte-apy39n\" aria-label=\"Receiver status\"><span><i aria-hidden=\"true\" class=\"svelte-apy39n\"></i> </span> <span><i aria-hidden=\"true\" class=\"svelte-apy39n\"></i> </span> <span><i aria-hidden=\"true\" class=\"svelte-apy39n\"></i> </span> <!> <!> <span><i aria-hidden=\"true\" class=\"svelte-apy39n\"></i> </span> <span class=\"receiver-island__status-step svelte-apy39n\"> </span></div> <div class=\"receiver-island__waterfall-controls svelte-apy39n\" aria-label=\"Waterfall controls\"><span class=\"receiver-island__waterfall-label svelte-apy39n\"> </span> <button type=\"button\" class=\"receiver-island__zoom svelte-apy39n\">Zoom out</button> <button type=\"button\" class=\"receiver-island__zoom svelte-apy39n\">Zoom in</button> <button type=\"button\" class=\"receiver-island__zoom svelte-apy39n\">Full spectrum</button> <button type=\"button\" class=\"receiver-island__zoom svelte-apy39n\">Auto levels</button> <button type=\"button\" class=\"receiver-island__zoom svelte-apy39n\">Reset range</button> <span class=\"receiver-island__message svelte-apy39n\" aria-live=\"polite\"> </span></div> <!> <details class=\"receiver-island__layouts svelte-apy39n\"><summary class=\"svelte-apy39n\">Saved layouts <span class=\"svelte-apy39n\"> </span></summary> <div class=\"receiver-island__layouts-panel svelte-apy39n\"><form class=\"receiver-island__layout-save svelte-apy39n\"><label for=\"receiver-modern-layout-name\" class=\"svelte-apy39n\">SAVE CURRENT FREQUENCY + MODE</label> <input id=\"receiver-modern-layout-name\" maxlength=\"48\" placeholder=\"Layout name\" autocomplete=\"off\" class=\"svelte-apy39n\"/> <button type=\"submit\" class=\"receiver-island__apply svelte-apy39n\">Save</button></form> <!> <span class=\"receiver-island__layout-message svelte-apy39n\" aria-live=\"polite\"> </span></div></details> <details class=\"receiver-island__history svelte-apy39n\"><summary class=\"svelte-apy39n\"> </summary> <div class=\"receiver-island__history-tools svelte-apy39n\"><label for=\"receiver-modern-history-search\" class=\"svelte-apy39n\">Search time, frequency, mode, source, or decoded content</label> <input id=\"receiver-modern-history-search\" type=\"search\" autocomplete=\"off\" class=\"svelte-apy39n\"/> <button type=\"button\" class=\"svelte-apy39n\">Clear history</button> <span role=\"status\" aria-live=\"polite\" class=\"svelte-apy39n\"> </span></div> <!></details></section>");
function Ki(e, t) {
	Le(t, !0);
	let n = "openwebrx.reception-history.v1", r = 864e13, i = /* @__PURE__ */ L(zt({
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
	})), a = /* @__PURE__ */ L(""), o = /* @__PURE__ */ L(""), s = /* @__PURE__ */ L(!1), c = /* @__PURE__ */ L(!1), l = /* @__PURE__ */ L(""), u = /* @__PURE__ */ L(""), d = /* @__PURE__ */ L(""), f = /* @__PURE__ */ L(""), p = /* @__PURE__ */ L(""), m = /* @__PURE__ */ L(""), h = /* @__PURE__ */ L(""), g = /* @__PURE__ */ L(!1), _ = /* @__PURE__ */ L(!1), v = /* @__PURE__ */ L(!1), y = null, b = null, x = null, S = "", ee = /* @__PURE__ */ L(zt([])), C = /* @__PURE__ */ L(""), w = /* @__PURE__ */ L(""), T = /* @__PURE__ */ L(""), E = /* @__PURE__ */ L("waiting for receiver audio"), te = /* @__PURE__ */ L(zt([])), ne = /* @__PURE__ */ L(zt([])), re = /* @__PURE__ */ L(zt([])), ie = /* @__PURE__ */ L(zt([])), ae = /* @__PURE__ */ L(""), oe = /* @__PURE__ */ L(""), se = /* @__PURE__ */ it(() => {
		let e = Y(ae).trim().toLocaleLowerCase();
		return e ? Y(ie).filter((t) => [
			new Date(t.timestampMs).toISOString(),
			new Date(t.timestampMs).toLocaleString(),
			t.mode,
			t.profile,
			t.content,
			t.frequencyHz === null ? "" : String(t.frequencyHz),
			t.frequencyHz === null ? "" : (t.frequencyHz / 1e6).toFixed(6)
		].some((t) => t.toLocaleLowerCase().includes(e))) : Y(ie);
	});
	function ce() {
		try {
			let e = localStorage.getItem(n) ?? "[]";
			if (e.length > 15e5) return [];
			let t = JSON.parse(e);
			return Array.isArray(t) ? t.filter((e) => !!e && Number.isFinite(e.timestampMs) && e.timestampMs >= 0 && e.timestampMs <= r && (e.frequencyHz === null || Number.isFinite(e.frequencyHz) && e.frequencyHz > 0 && e.frequencyHz <= 0xe8d4a51000) && typeof e.mode == "string" && e.mode.length <= 48 && typeof e.profile == "string" && e.profile.length <= 80 && typeof e.content == "string" && e.content.length <= 2048).slice(0, 500) : [];
		} catch {
			return [];
		}
	}
	function le() {
		R(ie, [], !0), R(oe, "");
		try {
			localStorage.removeItem(n);
		} catch {
			R(oe, "Could not clear browser storage");
		}
	}
	function ue(e) {
		(e.key === n || e.key === null) && R(ie, ce(), !0);
	}
	ni(() => {
		document.body.classList.add("receiver-modern-modes-mounted"), R(v, document.body.classList.contains("receiver-modern-secondary-document"), !0), R(ie, ce(), !0);
		let e = (e) => {
			let t = e.detail;
			if (!t || t.schema_version !== 1 || !Number.isFinite(t.timestamp_ms) || Number(t.timestamp_ms) < 0 || Number(t.timestamp_ms) > r || !(t.frequency_hz === null || Number.isFinite(t.frequency_hz) && Number(t.frequency_hz) > 0 && Number(t.frequency_hz) <= 0xe8d4a51000) || typeof t.mode != "string" || !t.mode.trim() || t.mode.length > 48 || typeof t.profile != "string" || t.profile.length > 80 || typeof t.content != "string" || !t.content.trim() || t.content.length > 2048) return;
			let i = {
				timestampMs: Number(t.timestamp_ms),
				frequencyHz: t.frequency_hz === null ? null : Number(t.frequency_hz),
				mode: t.mode,
				profile: t.profile,
				content: t.content
			};
			R(ie, [i, ...ce()].slice(0, 500), !0);
			try {
				localStorage.setItem(n, JSON.stringify(Y(ie))), R(oe, "");
			} catch {
				R(oe, "History is available for this page only; browser storage is full");
			}
		};
		window.addEventListener("openwebrx:reception", e), window.addEventListener("storage", ue);
		let t = (e) => {
			e.key === "Escape" && Y(_) && (R(_, !1), document.body.classList.remove("receiver-modern-advanced-open"));
		};
		window.addEventListener("keydown", t), S = gi() ?? "", R(ee, wi(S || null), !0);
		let l = (e) => {
			let t = e.detail;
			!t || t.schema_version !== 1 || !Number.isInteger(t.port) || Number(t.port) < 0 || Number(t.port) > 15 || !Number.isInteger(t.command) || Number(t.command) < 0 || Number(t.command) > 15 || !Number.isInteger(t.payload_bytes) || Number(t.payload_bytes) < 0 || Number(t.payload_bytes) > 4096 || typeof t.payload_hex != "string" || t.payload_hex.length > 8192 || !/^(?:[0-9a-f]{2})*$/i.test(t.payload_hex) || t.payload_hex.length !== Number(t.payload_bytes) * 2 || (R(te, [{
				port: Number(t.port),
				command: Number(t.command),
				payloadBytes: Number(t.payload_bytes),
				payloadHex: t.payload_hex.slice(0, 2048),
				receivedAt: Number.isFinite(t.received_at) ? Number(t.received_at) : Date.now() / 1e3
			}, ...Y(te)].slice(0, 10), !0), R(E, "frames received"));
		}, u = (e) => {
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
						e = n === "busy" ? "channel busy" : "channel clear", R(E, n === "busy" ? "channel busy" : "listening · channel clear", !0);
					} else if (n === "heard") {
						if (!Number.isInteger(t.port) || Number(t.port) < 0 || Number(t.port) > 15 || t.call !== void 0 && (typeof t.call != "string" || !/^[A-Z0-9/-]{1,10}$/.test(t.call))) return;
						e = `burst checked · KISS ${t.port}${t.call ? ` · ${t.call}` : ""}`, R(E, e, !0);
					} else if (n === "lost" || n === "dropped") {
						if (!Number.isInteger(t.port) || Number(t.port) < 0 || Number(t.port) > 15 || !Number.isInteger(t.count) || Number(t.count) < 0 || Number(t.count) > 999999) return;
						e = n === "lost" ? `burst incomplete · KISS ${t.port} · ${t.count} lost` : `frames dropped · KISS ${t.port} · ${t.count}`, R(E, e, !0);
					} else {
						if (typeof t.submode != "string" || !/^[A-Za-z0-9./_-]{1,48}$/.test(t.submode) || !Number.isInteger(t.codewords) || Number(t.codewords) < 0 || Number(t.codewords) > 999) return;
						e = `possible missed burst · ${t.submode} · ${t.codewords} codewords`, R(E, e, !0);
					}
					R(re, [{
						text: e,
						receivedAt: Date.now() / 1e3
					}, ...Y(re)].slice(0, 20), !0);
				} else [
					"listening",
					"audio_overrun",
					"error",
					"restarting"
				].includes(n) && R(E, n === "listening" ? "listening · 8 kHz RX" : n === "audio_overrun" ? `audio queue dropped ${Number(t.dropped_chunks) || 0} chunks` : n === "error" ? `worker error · ${String(t.message ?? "unknown").slice(0, 160)}` : n, !0);
			}
		}, d = (e) => {
			let t = e.detail, n = t?.message;
			if (!t || t.schema_version !== 1 || !n || typeof n != "object") return;
			let r = n;
			typeof r.source == "string" && typeof r.destination == "string" && typeof r.data == "string" && (R(ne, [{
				source: r.source.slice(0, 16),
				destination: r.destination.slice(0, 16),
				text: r.data.slice(0, 512),
				receivedAt: Number.isFinite(t.received_at) ? Number(t.received_at) : Date.now() / 1e3
			}, ...Y(ne)].slice(0, 20), !0), R(E, "APRS decoded"));
		};
		window.addEventListener("openwebrx:data2g-frame", l), window.addEventListener("openwebrx:data2g-status", u), window.addEventListener("openwebrx:data2g-aprs", d);
		let f = vi((e) => {
			R(i, e, !0);
			let t = gi() ?? "";
			t !== S && (S = t, R(ee, wi(S || null), !0), R(C, "")), Y(s) || R(a, e.frequencyHz === null ? "" : (e.frequencyHz / 1e6).toFixed(6), !0), Y(c) || R(o, e.availableModes.find((t) => t.modulation === e.mode)?.name ?? e.mode, !0);
		});
		return () => {
			f(), window.removeEventListener("keydown", t), window.removeEventListener("openwebrx:reception", e), window.removeEventListener("storage", ue), window.removeEventListener("openwebrx:data2g-frame", l), window.removeEventListener("openwebrx:data2g-status", u), window.removeEventListener("openwebrx:data2g-aprs", d), y !== null && window.clearInterval(y), b !== null && window.clearInterval(b), x?.remove(), document.body.classList.remove("receiver-modern-dual"), document.body.classList.remove("receiver-modern-advanced-open"), document.documentElement.classList.remove("receiver-modern-dual-document"), document.body.classList.remove("receiver-modern-modes-mounted");
		};
	});
	function de() {
		R(_, !Y(_)), document.body.classList.toggle("receiver-modern-advanced-open", Y(_));
	}
	function D(e) {
		fe(e);
	}
	function fe(e) {
		Y(i).frequencyHz !== null && (ci(Y(i).frequencyHz + e * Y(i).tuningStepHz) && R(i, si(), !0), R(l, ""));
	}
	function pe(e) {
		let t = e.key === "ArrowUp" || e.key === "PageUp" ? 1 : e.key === "ArrowDown" || e.key === "PageDown" ? -1 : 0;
		t && (e.preventDefault(), fe(t * (e.key === "PageUp" || e.key === "PageDown" ? 10 : 1)));
	}
	function me(e) {
		e.preventDefault();
		let t = Number(Y(a));
		!Number.isFinite(t) || t <= 0 || !ci(t * 1e6) ? R(l, "Frequency unavailable") : (R(s, !1), R(i, si(), !0), R(l, ""));
	}
	function he(e) {
		let t = e.currentTarget;
		t instanceof HTMLInputElement && (li(Number(t.value)), R(i, si(), !0));
	}
	function ge() {
		ui(), R(i, si(), !0);
	}
	function O() {
		di(!Y(i).recording) ? (R(p, ""), R(i, si(), !0)) : R(p, "Recording unavailable");
	}
	function _e(e) {
		fi(e), R(i, si(), !0);
	}
	function k(e) {
		R(m, pi(e) ? "" : "Waterfall controls unavailable", !0);
	}
	function A() {
		R(d, hi() ? "" : "Bookmark controls unavailable", !0);
	}
	function ve() {
		if (Y(i).frequencyHz === null || Y(i).mode === "No mode") {
			R(T, "Tune a frequency and select a mode before saving");
			return;
		}
		let e = Ti(S || null, {
			name: Y(w),
			frequencyHz: Y(i).frequencyHz,
			modulation: Y(i).mode
		});
		if (!e) {
			R(T, Y(w).trim() ? "Could not save layout in this browser" : "Enter a layout name", !0);
			return;
		}
		R(ee, e, !0);
		let t = e.find((e) => e.name.toLocaleLowerCase() === Y(w).trim().toLocaleLowerCase());
		R(C, t?.id ?? "", !0), R(w, ""), R(T, "Layout saved for this receiver profile");
	}
	function be() {
		let e = Y(ee).find((e) => e.id === Y(C));
		e ? Y(i).availableModes.some((t) => t.modulation === e.modulation) ? !mi(e.modulation) || !ci(e.frequencyHz) ? R(T, "Could not apply the saved layout") : (R(c, !1), R(s, !1), R(o, Y(i).availableModes.find((t) => t.modulation === e.modulation)?.name ?? e.modulation, !0), R(a, (e.frequencyHz / 1e6).toFixed(6), !0), R(i, si(), !0), R(T, `Applied ${e.name}`)) : R(T, "Saved mode is unavailable on this receiver") : R(T, "Choose a saved layout");
	}
	function xe() {
		let e = Ei(S || null, Y(C));
		e ? (R(ee, e, !0), R(C, ""), R(T, "Saved layout removed")) : R(T, "Could not update saved layouts in this browser");
	}
	function Se() {
		b !== null && window.clearInterval(b), R(h, "");
		let e = _i();
		if (!e) {
			R(f, "Configure a second enabled source for the other tuner");
			return;
		}
		let t = window.open(window.location.href, "openwebrx-second-receiver", "popup,width=1100,height=760");
		if (t === null) R(f, "Allow popups to open another receiver");
		else try {
			t.opener = null, R(f, "Opening second receiver…");
			let n = 0;
			b = window.setInterval(() => {
				n += 1;
				try {
					if (t.closed) {
						b !== null && window.clearInterval(b), b = null, R(f, "Second receiver window closed");
						return;
					}
					let r = t.OpenWebRXReceiver, i = r?.getProfiles().some((t) => t.id === e.id);
					r && i && r.selectProfile(e.id) ? (b !== null && window.clearInterval(b), b = null, R(f, `Second receiver opened on ${e.name}`)) : n >= 100 && (b !== null && window.clearInterval(b), b = null, R(f, `Could not select ${e.name} in the second receiver window`));
				} catch {
					b !== null && window.clearInterval(b), b = null, R(f, "Second receiver window is unavailable");
				}
			}, 200);
		} catch {
			R(f, "Choose another profile in the second receiver window");
		}
	}
	function Ce() {
		if (Y(g)) {
			y !== null && window.clearInterval(y), y = null, x?.remove(), x = null, R(g, !1), document.body.classList.remove("receiver-modern-dual"), document.documentElement.classList.remove("receiver-modern-dual-document"), R(h, "Second receiver closed");
			return;
		}
		let e = _i(), t = document.getElementById("receiver-modern-secondary");
		if (!e || !t) {
			R(h, "Configure a second enabled source for the other tuner");
			return;
		}
		let n = new URL(window.location.href);
		n.searchParams.set("receiver-pane", "secondary");
		let r = document.createElement("iframe");
		r.title = `${e.name} receiver`, r.setAttribute("allow", "autoplay"), r.setAttribute("loading", "eager"), r.src = n.toString(), t.replaceChildren(r), x = r, R(g, !0), document.body.classList.add("receiver-modern-dual"), document.documentElement.classList.add("receiver-modern-dual-document"), R(h, `Connecting ${e.name}…`);
		let i = 0;
		y = window.setInterval(() => {
			i += 1;
			try {
				if (r.contentWindow?.closed) {
					y !== null && window.clearInterval(y), y = null;
					return;
				}
				let t = r.contentWindow?.OpenWebRXReceiver, n = t?.getProfiles().some((t) => t.id === e.id);
				t && n && t.selectProfile(e.id) ? (y !== null && window.clearInterval(y), y = null, R(h, `Second tuner connected · ${e.name}`)) : i >= 120 && (y !== null && window.clearInterval(y), y = null, R(h, `Second tuner not available · ${e.name}`));
			} catch {
				y !== null && window.clearInterval(y), y = null, R(h, "Second receiver could not be reached");
			}
		}, 250);
	}
	function we(e) {
		return {
			wsjtx: "WSJT-X decoders",
			wsjtx_2_3: "WSJT-X 2.3 or newer",
			wsjtx_2_4: "WSJT-X 2.4 or newer",
			msk144decoder: "MSK144 decoder",
			js8: "JS8Call",
			js8py: "JS8 Python decoder"
		}[e] ?? e.replaceAll("_", " ");
	}
	function Te(e) {
		return `Unavailable: requires ${e.map(we).join(", ")}`;
	}
	function Ee(e) {
		e.preventDefault();
		let t = Y(o).trim().toLocaleLowerCase(), n = Y(i).availableModes.find((e) => e.name.toLocaleLowerCase() === t || e.modulation.toLocaleLowerCase() === t), r = Y(i).modeCapabilities.find((e) => !e.available && (e.name.toLocaleLowerCase() === t || e.modulation.toLocaleLowerCase() === t));
		r ? R(u, Te(r.missing_requirements), !0) : !n || !mi(n.modulation) ? R(u, "Choose an available receiver mode") : (R(u, ""), R(c, !1), R(o, n.name, !0), R(i, si(), !0));
	}
	var De = Gi(), Oe = B(De), ke = B(Oe), Ae = V(H(B(ke), 2), !0);
	j(ke);
	var je = H(ke, 2), Me = B(je), Ne = H(Me, 2), Pe = (e) => {
		var t = Di(), n = Yt(t), r = V(n, !0), i = H(n, 2);
		U(() => {
			Yr(n, "aria-pressed", Y(g)), $(r, Y(g) ? "Close second tuner" : "Dual tuner view");
		}), X("click", n, Ce), X("click", i, Se), Q(e, t);
	};
	Cr(Ne, (e) => {
		Y(v) || e(Pe);
	});
	var Fe = H(Ne, 2), M = V(Fe, !0);
	j(je);
	var Ie = V(H(je, 2), !0);
	j(Oe);
	var ze = H(Oe, 2), Be = B(ze), Ve = B(Be), He = H(Ve, 4);
	qr(He);
	var N = H(He, 4), Ue = H(N, 2), We = V(Ue), P = V(H(Ue, 2), !0);
	j(Be);
	var Ge = H(Be, 2), Ke = H(B(Ge), 2), qe = B(Ke), Je = (e) => {
		var t = pr();
		Dr(Yt(t), 17, () => Y(i).modeCapabilities, (e) => e.modulation, (e, t) => {
			var n = Oi(), r = V(n), i = {};
			U((e) => {
				n.disabled = !Y(t).available, $(r, `${Y(t).name ?? ""}${e ?? ""}`), i !== (i = Y(t).name) && (n.value = (n.__value = i) ?? "");
			}, [() => Y(t).available ? "" : ` · ${Te(Y(t).missing_requirements)}`]), Q(e, n);
		}), Q(e, t);
	}, Ye = (e) => {
		var t = pr();
		Dr(Yt(t), 17, () => Y(i).availableModes, (e) => e.modulation, (e, t) => {
			var n = Oi(), r = V(n, !0), i = {};
			U(() => {
				$(r, Y(t).name), i !== (i = Y(t).name) && (n.value = (n.__value = i) ?? "");
			}), Q(e, n);
		}), Q(e, t);
	};
	Cr(qe, (e) => {
		Y(i).modeCapabilities.length ? e(Je) : e(Ye, -1);
	}), j(Ke), zr(Ke);
	var Xe = V(H(Ke, 4), !0);
	j(Ge);
	var Ze = H(Ge, 2), Qe = B(Ze), $e = V(Qe, !0), et = H(Qe, 2), tt = (e) => {
		var t = ki(), n = V(t, !0);
		U(() => {
			Yr(t, "aria-pressed", Y(i).recording), t.disabled = !Y(i).recording && Y(i).audio !== "playing", $(n, Y(i).recording ? "Stop recording" : "Record");
		}), X("click", t, O), Q(e, t);
	};
	Cr(et, (e) => {
		(Y(i).recordingAllowed || Y(i).recording) && e(tt);
	});
	var nt = H(et, 4);
	qr(nt);
	var rt = H(nt, 2), at = V(rt), ot = V(H(rt, 2), !0);
	j(Ze), j(ze);
	var st = H(ze, 2), ct = B(st);
	let lt;
	var ut = H(B(ct), 1, !0);
	j(ct);
	var dt = H(ct, 2);
	let F;
	var ft = H(B(dt));
	j(dt);
	var I = H(dt, 2);
	let pt;
	var mt = H(B(I), 1, !0);
	j(I);
	var ht = H(I, 2), gt = (e) => {
		var t = Ai(), n = V(t);
		U((e) => $(n, `Audio buffer dropped ${e ?? ""} samples`), [() => Y(i).audioDroppedSamples.toLocaleString()]), Q(e, t);
	};
	Cr(ht, (e) => {
		Y(i).audioDroppedSamples > 0 && e(gt);
	});
	var _t = H(ht, 2), vt = (e) => {
		var t = ji(), n = V(t);
		U(() => {
			Yr(t, "title", Y(i).decoderError), $(n, `Decoder error · ${Y(i).decoderError ?? ""}`);
		}), Q(e, t);
	};
	Cr(_t, (e) => {
		Y(i).decoderError && e(vt);
	});
	var yt = H(_t, 2);
	let bt;
	var xt = H(B(yt), 1, !0);
	j(yt);
	var St = V(H(yt, 2));
	j(st);
	var Ct = H(st, 2), wt = B(Ct), Tt = V(wt), Et = H(wt, 2), Dt = H(Et, 2), Ot = H(Dt, 2), kt = H(Ot, 2), At = H(kt, 2), jt = V(H(At, 2), !0);
	j(Ct);
	var Mt = H(Ct, 2), Nt = (e) => {
		var t = zi(), n = B(t), r = V(H(B(n), 2), !0);
		j(n);
		var i = H(n, 2), a = (e) => {
			var t = Ni();
			Dr(t, 23, () => Y(ne), (e, t) => e.receivedAt + ":" + t, (e, t) => {
				var n = Mi(), r = B(n), i = V(r), a = V(H(r, 2), !0);
				j(n), U((e) => {
					$(i, `${e ?? ""} · ${Y(t).source ?? ""} → ${Y(t).destination ?? ""}`), $(a, Y(t).text);
				}, [() => (/* @__PURE__ */ new Date(Y(t).receivedAt * 1e3)).toLocaleTimeString()]), Q(e, n);
			}), j(t), Q(e, t);
		};
		Cr(i, (e) => {
			Y(ne).length && e(a);
		});
		var o = H(i, 2), s = (e) => {
			var t = Fi();
			Dr(t, 23, () => Y(te), (e, t) => e.receivedAt + ":" + t, (e, t) => {
				var n = Pi(), r = B(n), i = V(r), a = V(H(r, 2), !0);
				j(n), U((e) => {
					$(i, `${e ?? ""} · KISS ${Y(t).port ?? ""} · ${Y(t).command === 0 ? "DATA" : `CMD ${Y(t).command}`} · ${Y(t).payloadBytes ?? ""} B`), $(a, Y(t).payloadHex);
				}, [() => (/* @__PURE__ */ new Date(Y(t).receivedAt * 1e3)).toLocaleTimeString()]), Q(e, n);
			}), j(t), Q(e, t);
		}, c = (e) => {
			Q(e, Ii());
		};
		Cr(o, (e) => {
			Y(te).length ? e(s) : Y(ne).length || e(c, 1);
		});
		var l = H(o, 2), u = (e) => {
			var t = Ri();
			Dr(t, 23, () => Y(re), (e, t) => e.receivedAt + ":" + t, (e, t) => {
				var n = Li(), r = V(n);
				U((e) => $(r, `${e ?? ""} · ${Y(t).text ?? ""}`), [() => (/* @__PURE__ */ new Date(Y(t).receivedAt * 1e3)).toLocaleTimeString()]), Q(e, n);
			}), j(t), Q(e, t);
		};
		Cr(l, (e) => {
			Y(re).length && e(u);
		}), j(t), U(() => $(r, Y(E))), Q(e, t);
	}, Pt = /* @__PURE__ */ it(() => Y(i).mode.toLocaleLowerCase() === "data2g");
	Cr(Mt, (e) => {
		Y(Pt) && e(Nt);
	});
	var Ft = H(Mt, 2), It = B(Ft), Lt = V(H(B(It)), !0);
	j(It);
	var Rt = H(It, 2), Bt = B(Rt), Vt = H(B(Bt), 2);
	qr(Vt), ye(2), j(Bt);
	var Ht = H(Bt, 2), Ut = (e) => {
		var t = Bi(), n = H(Yt(t), 2), r = B(n), i = B(r);
		i.value = i.__value = "", Dr(H(i), 17, () => Y(ee), (e) => e.id, (e, t) => {
			var n = Oi(), r = V(n), i = {};
			U((e) => {
				$(r, `${Y(t).name ?? ""} · ${e ?? ""} MHz · ${Y(t).modulation ?? ""}`), i !== (i = Y(t).id) && (n.value = (n.__value = i) ?? "");
			}, [() => (Y(t).frequencyHz / 1e6).toFixed(6)]), Q(e, n);
		}), j(r), zr(r);
		var a = H(r, 2), o = H(a, 2);
		j(n), U(() => {
			a.disabled = !Y(C), o.disabled = !Y(C);
		}), Br(r, () => Y(C), (e) => R(C, e)), X("click", a, be), X("click", o, xe), Q(e, t);
	}, Wt = (e) => {
		Q(e, Vi());
	};
	Cr(Ht, (e) => {
		Y(ee).length ? e(Ut) : e(Wt, -1);
	});
	var Gt = V(H(Ht, 2), !0);
	j(Rt), j(Ft);
	var Kt = H(Ft, 2), z = B(Kt), qt = V(z), Jt = H(z, 2), Xt = H(B(Jt), 2);
	qr(Xt);
	var Zt = H(Xt, 2), Qt = V(H(Zt, 2), !0);
	j(Jt);
	var $t = H(Jt, 2), en = (e) => {
		var t = Ui();
		Dr(t, 23, () => Y(se), (e, t) => `${e.timestampMs}:${t}`, (e, t) => {
			var n = Hi(), r = B(n), i = B(r), a = V(i, !0), o = H(i, 2), s = V(o, !0), c = H(o, 2), l = V(c, !0), u = V(H(c, 2), !0);
			j(r);
			var d = V(H(r, 2), !0);
			j(n), U((e, n, r) => {
				Yr(i, "datetime", e), $(a, n), $(s, r), $(l, Y(t).mode), $(u, Y(t).profile), $(d, Y(t).content);
			}, [
				() => new Date(Y(t).timestampMs).toISOString(),
				() => new Date(Y(t).timestampMs).toLocaleString(),
				() => Y(t).frequencyHz === null ? "Frequency unknown" : `${(Y(t).frequencyHz / 1e6).toFixed(6)} MHz`
			]), Q(e, n);
		}), j(t), Q(e, t);
	}, tn = (e) => {
		var t = Wi(), n = V(t, !0);
		U(() => $(n, Y(ae) ? "No receptions match this search." : "Decoded receptions will appear here.")), Q(e, t);
	};
	Cr($t, (e) => {
		Y(se).length ? e(en) : e(tn, -1);
	}), j(Kt), j(De), U((e, t, n) => {
		$(Ae, Y(i).profileName), Yr(Fe, "aria-expanded", Y(_)), $(M, Y(_) ? "Close RF controls" : "RF controls"), $(Ie, Y(h) || Y(d) || Y(f)), $(We, `${e ?? ""} Hz step`), $(P, Y(l)), $(Xe, Y(u)), Yr(Qe, "aria-pressed", Y(i).muted), Qe.disabled = Y(i).audio !== "playing", $($e, Y(i).audio === "playing" ? Y(i).muted ? "Unmute" : "Mute" : "Audio waiting"), Jr(nt, Y(i).volume), nt.disabled = Y(i).audio !== "playing" || Y(i).muted, $(at, `${Y(i).volume ?? ""}%`), $(ot, Y(p)), lt = Fr(ct, 1, "receiver-island__status-item svelte-apy39n", null, lt, { "receiver-island__status--active": Y(i).connection === "connected" }), $(ut, Y(i).connection === "connected" ? "Connected" : Y(i).connection === "starting" ? "Starting" : "Reconnecting"), F = Fr(dt, 1, "receiver-island__status-item svelte-apy39n", null, F, {
			"receiver-island__status--active": Y(i).deviceState === "running",
			"receiver-island__health-warning": Y(i).deviceSeverity === "warning",
			"receiver-island__health-error": Y(i).deviceSeverity === "error"
		}), Yr(dt, "title", Y(i).deviceMessage ?? ""), Yr(dt, "aria-label", `SDR ${Y(i).deviceName ?? "source"}: ${Y(i).deviceState}`), $(ft, `${Y(i).deviceName ?? "SDR" ?? ""} · ${t ?? ""}`), pt = Fr(I, 1, "receiver-island__status-item svelte-apy39n", null, pt, { "receiver-island__status--active": Y(i).audio === "playing" }), $(mt, Y(i).audio === "playing" ? "Audio live" : "Audio waiting"), bt = Fr(yt, 1, "receiver-island__status-item svelte-apy39n", null, bt, { "receiver-island__status--active": Y(i).decoder === "output" }), $(xt, Y(i).decoder === "off" ? "Decoder off" : Y(i).decoder === "output" ? `${Y(i).mode} output received` : `${Y(i).mode} selected · waiting for output`), $(St, `STEP ${n ?? ""} Hz`), $(Tt, `WATERFALL · ZOOM ${Y(i).waterfallZoomLevel + 1}/${Y(i).waterfallZoomMaximum + 1}`), Et.disabled = Y(i).waterfallZoomLevel === 0, Dt.disabled = Y(i).waterfallZoomLevel >= Y(i).waterfallZoomMaximum, $(jt, Y(m)), $(Lt, Y(ee).length), $(Gt, Y(T)), $(qt, `Reception history · ${Y(ie).length ?? ""}`), Zt.disabled = Y(ie).length === 0, $(Qt, Y(oe));
	}, [
		() => Y(i).tuningStepHz.toLocaleString(),
		() => Y(i).deviceState.replaceAll("_", " "),
		() => Y(i).tuningStepHz.toLocaleString()
	]), X("click", Me, A), X("click", Fe, de), ir("submit", Be, me), X("click", Ve, () => D(-1)), X("keydown", He, pe), ir("focus", He, () => R(s, !0)), ir("blur", He, () => R(s, !1)), $r(He, () => Y(a), (e) => R(a, e)), X("click", N, () => D(1)), ir("submit", Ge, Ee), ir("focus", Ke, () => R(c, !0)), ir("blur", Ke, () => R(c, !1)), Br(Ke, () => Y(o), (e) => R(o, e)), X("click", Qe, ge), X("input", nt, he), X("click", Et, () => _e("out")), X("click", Dt, () => _e("in")), X("click", Ot, () => _e("full")), X("click", kt, () => k("auto")), X("click", At, () => k("default")), ir("submit", Bt, (e) => {
		e.preventDefault(), ve();
	}), $r(Vt, () => Y(w), (e) => R(w, e)), $r(Xt, () => Y(ae), (e) => R(ae, e)), X("click", Zt, le), Q(e, De), Re();
}
//#endregion
//#region src/main.ts
ar([
	"click",
	"keydown",
	"input"
]), new URLSearchParams(window.location.search).get("receiver-pane") === "secondary" && document.body.classList.add("receiver-modern-secondary-document");
function qi() {
	let e = document.getElementById("receiver-modern-ui");
	e && e.dataset.mounted !== "true" && (e.dataset.mounted = "true", vr(Ki, { target: e }));
}
document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", qi, { once: !0 }) : qi();
//#endregion
