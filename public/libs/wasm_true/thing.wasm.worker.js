var g
g || (g = typeof Module !== 'undefined' ? Module : {})
var aa = Object.assign({}, g),
  ba = [],
  ca = './this.program',
  da = (a, b) => {
    throw b
  },
  t = '',
  ea
t = self.location.href
t = 0 !== t.indexOf('blob:') ? t.substr(0, t.replace(/[?#].*/, '').lastIndexOf('/') + 1) : ''
ea = (a) => {
  var b = new XMLHttpRequest()
  b.open('GET', a, !1)
  b.responseType = 'arraybuffer'
  b.send(null)
  return new Uint8Array(b.response)
}
var fa = g.print || console.log.bind(console),
  w = g.printErr || console.warn.bind(console)
Object.assign(g, aa)
aa = null
g.arguments && (ba = g.arguments)
g.thisProgram && (ca = g.thisProgram)
g.quit && (da = g.quit)
var ha
g.wasmBinary && (ha = g.wasmBinary)
var noExitRuntime = g.noExitRuntime || !0
'object' != typeof WebAssembly && x('no native wasm support detected')
var ia,
  y = !1,
  ja,
  A,
  B,
  C,
  ka,
  D,
  E,
  la,
  ma
function na() {
  var a = ia.buffer
  g.HEAP8 = A = new Int8Array(a)
  g.HEAP16 = C = new Int16Array(a)
  g.HEAP32 = D = new Int32Array(a)
  g.HEAPU8 = B = new Uint8Array(a)
  g.HEAPU16 = ka = new Uint16Array(a)
  g.HEAPU32 = E = new Uint32Array(a)
  g.HEAPF32 = la = new Float32Array(a)
  g.HEAPF64 = ma = new Float64Array(a)
}
var oa,
  pa = [],
  qa = [],
  ra = [],
  sa = [],
  ta = !1
function ua() {
  var a = g.preRun.shift()
  pa.unshift(a)
}
var G = 0,
  va = null,
  wa = null
function x(a) {
  if (g.onAbort) g.onAbort(a)
  a = 'Aborted(' + a + ')'
  w(a)
  y = !0
  ja = 1
  throw new WebAssembly.RuntimeError(a + '. Build with -sASSERTIONS for more info.')
}
function xa(a) {
  return a.startsWith('data:application/octet-stream;base64,')
}
var H
H = 'thing.wasm.worker.wasm'
if (!xa(H)) {
  var ya = H
  H = g.locateFile ? g.locateFile(ya, t) : t + ya
}
function za(a) {
  try {
    if (a == H && ha) return new Uint8Array(ha)
    if (ea) return ea(a)
    throw 'both async and sync fetching of the wasm failed'
  } catch (b) {
    x(b)
  }
}
function Aa(a) {
  return ha || 'function' != typeof fetch
    ? Promise.resolve().then(function () {
        return za(a)
      })
    : fetch(a, { credentials: 'same-origin' })
        .then(function (b) {
          if (!b.ok) throw "failed to load wasm binary file at '" + a + "'"
          return b.arrayBuffer()
        })
        .catch(function () {
          return za(a)
        })
}
function Ba(a, b, c) {
  return Aa(a)
    .then(function (d) {
      return WebAssembly.instantiate(d, b)
    })
    .then(function (d) {
      return d
    })
    .then(c, function (d) {
      w('failed to asynchronously prepare wasm: ' + d)
      x(d)
    })
}
function Ca(a, b) {
  var c = H
  ha || 'function' != typeof WebAssembly.instantiateStreaming || xa(c) || 'function' != typeof fetch
    ? Ba(c, a, b)
    : fetch(c, { credentials: 'same-origin' }).then(function (d) {
        return WebAssembly.instantiateStreaming(d, a).then(b, function (e) {
          w('wasm streaming compile failed: ' + e)
          w('falling back to ArrayBuffer instantiation')
          return Ba(c, a, b)
        })
      })
}
function Da(a) {
  this.name = 'ExitStatus'
  this.message = 'Program terminated with exit(' + a + ')'
  this.status = a
}
function Ea(a) {
  for (; 0 < a.length; ) a.shift()(g)
}
var Fa = {}
function Ga(a) {
  for (; a.length; ) {
    var b = a.pop()
    a.pop()(b)
  }
}
function I(a) {
  return this.fromWireType(D[a >> 2])
}
var K = {},
  L = {},
  Ha = {}
function Ia(a) {
  if (void 0 === a) return '_unknown'
  a = a.replace(/[^a-zA-Z0-9_]/g, '$')
  var b = a.charCodeAt(0)
  return 48 <= b && 57 >= b ? '_' + a : a
}
function Ja(a, b) {
  a = Ia(a)
  return {
    [a]: function () {
      return b.apply(this, arguments)
    }
  }[a]
}
function Ka(a) {
  var b = Error,
    c = Ja(a, function (d) {
      this.name = a
      this.message = d
      d = Error(d).stack
      void 0 !== d && (this.stack = this.toString() + '\n' + d.replace(/^Error(:[^\n]*)?\n/, ''))
    })
  c.prototype = Object.create(b.prototype)
  c.prototype.constructor = c
  c.prototype.toString = function () {
    return void 0 === this.message ? this.name : this.name + ': ' + this.message
  }
  return c
}
var La = void 0
function Ma(a) {
  throw new La(a)
}
function M(a, b, c) {
  function d(k) {
    k = c(k)
    k.length !== a.length && Ma('Mismatched type converter count')
    for (var m = 0; m < a.length; ++m) N(a[m], k[m])
  }
  a.forEach(function (k) {
    Ha[k] = b
  })
  var e = Array(b.length),
    f = [],
    l = 0
  b.forEach((k, m) => {
    L.hasOwnProperty(k)
      ? (e[m] = L[k])
      : (f.push(k),
        K.hasOwnProperty(k) || (K[k] = []),
        K[k].push(() => {
          e[m] = L[k]
          ++l
          l === f.length && d(e)
        }))
  })
  0 === f.length && d(e)
}
var Na = {}
function Oa(a) {
  switch (a) {
    case 1:
      return 0
    case 2:
      return 1
    case 4:
      return 2
    case 8:
      return 3
    default:
      throw new TypeError('Unknown type size: ' + a)
  }
}
var Pa = void 0
function O(a) {
  for (var b = ''; B[a]; ) b += Pa[B[a++]]
  return b
}
var P = void 0
function Q(a) {
  throw new P(a)
}
function N(a, b, c = {}) {
  if (!('argPackAdvance' in b))
    throw new TypeError('registerType registeredInstance requires argPackAdvance')
  var d = b.name
  a || Q('type "' + d + '" must have a positive integer typeid pointer')
  if (L.hasOwnProperty(a)) {
    if (c.pb) return
    Q("Cannot register type '" + d + "' twice")
  }
  L[a] = b
  delete Ha[a]
  K.hasOwnProperty(a) && ((b = K[a]), delete K[a], b.forEach((e) => e()))
}
function Qa(a) {
  Q(a.qa.ta.ra.name + ' instance already deleted')
}
var Ra = !1
function Sa() {}
function Ta(a) {
  --a.count.value
  0 === a.count.value && (a.va ? a.ya.xa(a.va) : a.ta.ra.xa(a.sa))
}
function Ua(a, b, c) {
  if (b === c) return a
  if (void 0 === c.za) return null
  a = Ua(a, b, c.za)
  return null === a ? null : c.kb(a)
}
var Va = {},
  Wa = []
function Xa() {
  for (; Wa.length; ) {
    var a = Wa.pop()
    a.qa.Ga = !1
    a['delete']()
  }
}
var Ya = void 0,
  Za = {}
function $a(a, b) {
  for (void 0 === b && Q('ptr should not be undefined'); a.za; ) (b = a.Ka(b)), (a = a.za)
  return Za[b]
}
function ab(a, b) {
  ;(b.ta && b.sa) || Ma('makeClassHandle requires ptr and ptrType')
  !!b.ya !== !!b.va && Ma('Both smartPtrType and smartPtr must be specified')
  b.count = { value: 1 }
  return bb(Object.create(a, { qa: { value: b } }))
}
function bb(a) {
  if ('undefined' === typeof FinalizationRegistry) return (bb = (b) => b), a
  Ra = new FinalizationRegistry((b) => {
    Ta(b.qa)
  })
  bb = (b) => {
    var c = b.qa
    c.va && Ra.register(b, { qa: c }, b)
    return b
  }
  Sa = (b) => {
    Ra.unregister(b)
  }
  return bb(a)
}
function R() {}
function cb(a, b, c) {
  if (void 0 === a[b].ua) {
    var d = a[b]
    a[b] = function () {
      a[b].ua.hasOwnProperty(arguments.length) ||
        Q(
          "Function '" +
            c +
            "' called with an invalid number of arguments (" +
            arguments.length +
            ') - expects one of (' +
            a[b].ua +
            ')!'
        )
      return a[b].ua[arguments.length].apply(this, arguments)
    }
    a[b].ua = []
    a[b].ua[d.Fa] = d
  }
}
function db(a, b) {
  g.hasOwnProperty(a)
    ? (Q("Cannot register public name '" + a + "' twice"),
      cb(g, a, a),
      g.hasOwnProperty(void 0) &&
        Q(
          'Cannot register multiple overloads of a function with the same number of arguments (undefined)!'
        ),
      (g[a].ua[void 0] = b))
    : (g[a] = b)
}
function eb(a, b, c, d, e, f, l, k) {
  this.name = a
  this.constructor = b
  this.Ha = c
  this.xa = d
  this.za = e
  this.mb = f
  this.Ka = l
  this.kb = k
  this.sb = []
}
function fb(a, b, c) {
  for (; b !== c; )
    b.Ka || Q('Expected null or instance of ' + c.name + ', got an instance of ' + b.name),
      (a = b.Ka(a)),
      (b = b.za)
  return a
}
function gb(a, b) {
  if (null === b) return this.Va && Q('null is not a valid ' + this.name), 0
  b.qa || Q('Cannot pass "' + hb(b) + '" as a ' + this.name)
  b.qa.sa || Q('Cannot pass deleted object as a pointer of type ' + this.name)
  return fb(b.qa.sa, b.qa.ta.ra, this.ra)
}
function ib(a, b) {
  if (null === b) {
    this.Va && Q('null is not a valid ' + this.name)
    if (this.Na) {
      var c = this.Ja()
      null !== a && a.push(this.xa, c)
      return c
    }
    return 0
  }
  b.qa || Q('Cannot pass "' + hb(b) + '" as a ' + this.name)
  b.qa.sa || Q('Cannot pass deleted object as a pointer of type ' + this.name)
  !this.Ma &&
    b.qa.ta.Ma &&
    Q(
      'Cannot convert argument of type ' +
        (b.qa.ya ? b.qa.ya.name : b.qa.ta.name) +
        ' to parameter type ' +
        this.name
    )
  c = fb(b.qa.sa, b.qa.ta.ra, this.ra)
  if (this.Na)
    switch ((void 0 === b.qa.va && Q('Passing raw pointer to smart pointer is illegal'), this.vb)) {
      case 0:
        b.qa.ya === this
          ? (c = b.qa.va)
          : Q(
              'Cannot convert argument of type ' +
                (b.qa.ya ? b.qa.ya.name : b.qa.ta.name) +
                ' to parameter type ' +
                this.name
            )
        break
      case 1:
        c = b.qa.va
        break
      case 2:
        if (b.qa.ya === this) c = b.qa.va
        else {
          var d = b.clone()
          c = this.ub(
            c,
            S(function () {
              d['delete']()
            })
          )
          null !== a && a.push(this.xa, c)
        }
        break
      default:
        Q('Unsupporting sharing policy')
    }
  return c
}
function jb(a, b) {
  if (null === b) return this.Va && Q('null is not a valid ' + this.name), 0
  b.qa || Q('Cannot pass "' + hb(b) + '" as a ' + this.name)
  b.qa.sa || Q('Cannot pass deleted object as a pointer of type ' + this.name)
  b.qa.ta.Ma &&
    Q('Cannot convert argument of type ' + b.qa.ta.name + ' to parameter type ' + this.name)
  return fb(b.qa.sa, b.qa.ta.ra, this.ra)
}
function T(a, b, c, d) {
  this.name = a
  this.ra = b
  this.Va = c
  this.Ma = d
  this.Na = !1
  this.xa = this.ub = this.Ja = this.gb = this.vb = this.rb = void 0
  void 0 !== b.za ? (this.toWireType = ib) : ((this.toWireType = d ? gb : jb), (this.wa = null))
}
function kb(a, b) {
  g.hasOwnProperty(a) || Ma('Replacing nonexistant public symbol')
  g[a] = b
  g[a].Fa = void 0
}
var lb = []
function mb(a) {
  var b = lb[a]
  b || (a >= lb.length && (lb.length = a + 1), (lb[a] = b = oa.get(a)))
  return b
}
function nb(a, b) {
  var c = []
  return function () {
    c.length = 0
    Object.assign(c, arguments)
    if (a.includes('j')) {
      var d = g['dynCall_' + a]
      d = c && c.length ? d.apply(null, [b].concat(c)) : d.call(null, b)
    } else d = mb(b).apply(null, c)
    return d
  }
}
function U(a, b) {
  a = O(a)
  var c = a.includes('j') ? nb(a, b) : mb(b)
  'function' != typeof c && Q('unknown function pointer with signature ' + a + ': ' + b)
  return c
}
var ob = void 0
function pb(a) {
  a = qb(a)
  var b = O(a)
  V(a)
  return b
}
function rb(a, b) {
  function c(f) {
    e[f] || L[f] || (Ha[f] ? Ha[f].forEach(c) : (d.push(f), (e[f] = !0)))
  }
  var d = [],
    e = {}
  b.forEach(c)
  throw new ob(a + ': ' + d.map(pb).join([', ']))
}
function sb(a) {
  var b = Function
  if (!(b instanceof Function))
    throw new TypeError(
      'new_ called with constructor type ' + typeof b + ' which is not a function'
    )
  var c = Ja(b.name || 'unknownFunctionName', function () {})
  c.prototype = b.prototype
  c = new c()
  a = b.apply(c, a)
  return a instanceof Object ? a : c
}
function tb(a, b, c, d, e, f) {
  var l = b.length
  2 > l && Q("argTypes array size mismatch! Must at least get return value and 'this' types!")
  var k = null !== b[1] && null !== c,
    m = !1
  for (c = 1; c < b.length; ++c)
    if (null !== b[c] && void 0 === b[c].wa) {
      m = !0
      break
    }
  var n = 'void' !== b[0].name,
    p = '',
    r = ''
  for (c = 0; c < l - 2; ++c)
    (p += (0 !== c ? ', ' : '') + 'arg' + c), (r += (0 !== c ? ', ' : '') + 'arg' + c + 'Wired')
  a =
    'return function ' +
    Ia(a) +
    '(' +
    p +
    ') {\nif (arguments.length !== ' +
    (l - 2) +
    ") {\nthrowBindingError('function " +
    a +
    " called with ' + arguments.length + ' arguments, expected " +
    (l - 2) +
    " args!');\n}\n"
  m && (a += 'var destructors = [];\n')
  var v = m ? 'destructors' : 'null'
  p = 'throwBindingError invoker fn runDestructors retType classParam'.split(' ')
  d = [Q, d, e, Ga, b[0], b[1]]
  k && (a += 'var thisWired = classParam.toWireType(' + v + ', this);\n')
  for (c = 0; c < l - 2; ++c)
    (a +=
      'var arg' +
      c +
      'Wired = argType' +
      c +
      '.toWireType(' +
      v +
      ', arg' +
      c +
      '); // ' +
      b[c + 2].name +
      '\n'),
      p.push('argType' + c),
      d.push(b[c + 2])
  k && (r = 'thisWired' + (0 < r.length ? ', ' : '') + r)
  a += (n || f ? 'var rv = ' : '') + 'invoker(fn' + (0 < r.length ? ', ' : '') + r + ');\n'
  if (m) a += 'runDestructors(destructors);\n'
  else
    for (c = k ? 1 : 2; c < b.length; ++c)
      (f = 1 === c ? 'thisWired' : 'arg' + (c - 2) + 'Wired'),
        null !== b[c].wa &&
          ((a += f + '_dtor(' + f + '); // ' + b[c].name + '\n'),
          p.push(f + '_dtor'),
          d.push(b[c].wa))
  n && (a += 'var ret = retType.fromWireType(rv);\nreturn ret;\n')
  p.push(a + '}\n')
  return sb(p).apply(null, d)
}
function ub(a, b) {
  for (var c = [], d = 0; d < a; d++) c.push(E[(b + 4 * d) >> 2])
  return c
}
var W = new (function () {
  this.Ba = [void 0]
  this.fb = []
  this.get = function (a) {
    return this.Ba[a]
  }
  this.wb = function (a) {
    let b = this.fb.pop() || this.Ba.length
    this.Ba[b] = a
    return b
  }
  this.Bb = function (a) {
    this.Ba[a] = void 0
    this.fb.push(a)
  }
})()
function vb(a) {
  a >= W.ib && 0 === --W.get(a).hb && W.Bb(a)
}
var X = (a) => {
    a || Q('Cannot use deleted val. handle = ' + a)
    return W.get(a).value
  },
  S = (a) => {
    switch (a) {
      case void 0:
        return 1
      case null:
        return 2
      case !0:
        return 3
      case !1:
        return 4
      default:
        return W.wb({ hb: 1, value: a })
    }
  }
function wb(a, b, c) {
  switch (b) {
    case 0:
      return function (d) {
        return this.fromWireType((c ? A : B)[d])
      }
    case 1:
      return function (d) {
        return this.fromWireType((c ? C : ka)[d >> 1])
      }
    case 2:
      return function (d) {
        return this.fromWireType((c ? D : E)[d >> 2])
      }
    default:
      throw new TypeError('Unknown integer type: ' + a)
  }
}
function xb(a, b) {
  var c = L[a]
  void 0 === c && Q(b + ' has unknown type ' + pb(a))
  return c
}
function hb(a) {
  if (null === a) return 'null'
  var b = typeof a
  return 'object' === b || 'array' === b || 'function' === b ? a.toString() : '' + a
}
function yb(a, b) {
  switch (b) {
    case 2:
      return function (c) {
        return this.fromWireType(la[c >> 2])
      }
    case 3:
      return function (c) {
        return this.fromWireType(ma[c >> 3])
      }
    default:
      throw new TypeError('Unknown float type: ' + a)
  }
}
function zb(a, b, c) {
  switch (b) {
    case 0:
      return c
        ? function (d) {
            return A[d]
          }
        : function (d) {
            return B[d]
          }
    case 1:
      return c
        ? function (d) {
            return C[d >> 1]
          }
        : function (d) {
            return ka[d >> 1]
          }
    case 2:
      return c
        ? function (d) {
            return D[d >> 2]
          }
        : function (d) {
            return E[d >> 2]
          }
    default:
      throw new TypeError('Unknown integer type: ' + a)
  }
}
function Ab(a, b, c, d) {
  if (0 < d) {
    d = c + d - 1
    for (var e = 0; e < a.length; ++e) {
      var f = a.charCodeAt(e)
      if (55296 <= f && 57343 >= f) {
        var l = a.charCodeAt(++e)
        f = (65536 + ((f & 1023) << 10)) | (l & 1023)
      }
      if (127 >= f) {
        if (c >= d) break
        b[c++] = f
      } else {
        if (2047 >= f) {
          if (c + 1 >= d) break
          b[c++] = 192 | (f >> 6)
        } else {
          if (65535 >= f) {
            if (c + 2 >= d) break
            b[c++] = 224 | (f >> 12)
          } else {
            if (c + 3 >= d) break
            b[c++] = 240 | (f >> 18)
            b[c++] = 128 | ((f >> 12) & 63)
          }
          b[c++] = 128 | ((f >> 6) & 63)
        }
        b[c++] = 128 | (f & 63)
      }
    }
    b[c] = 0
  }
}
function Bb(a) {
  for (var b = 0, c = 0; c < a.length; ++c) {
    var d = a.charCodeAt(c)
    127 >= d ? b++ : 2047 >= d ? (b += 2) : 55296 <= d && 57343 >= d ? ((b += 4), ++c) : (b += 3)
  }
  return b
}
var Cb = 'undefined' != typeof TextDecoder ? new TextDecoder('utf8') : void 0
function Y(a, b, c) {
  var d = b + c
  for (c = b; a[c] && !(c >= d); ) ++c
  if (16 < c - b && a.buffer && Cb) return Cb.decode(a.subarray(b, c))
  for (d = ''; b < c; ) {
    var e = a[b++]
    if (e & 128) {
      var f = a[b++] & 63
      if (192 == (e & 224)) d += String.fromCharCode(((e & 31) << 6) | f)
      else {
        var l = a[b++] & 63
        e =
          224 == (e & 240)
            ? ((e & 15) << 12) | (f << 6) | l
            : ((e & 7) << 18) | (f << 12) | (l << 6) | (a[b++] & 63)
        65536 > e
          ? (d += String.fromCharCode(e))
          : ((e -= 65536), (d += String.fromCharCode(55296 | (e >> 10), 56320 | (e & 1023))))
      }
    } else d += String.fromCharCode(e)
  }
  return d
}
var Db = 'undefined' != typeof TextDecoder ? new TextDecoder('utf-16le') : void 0
function Eb(a, b) {
  var c = a >> 1
  for (var d = c + b / 2; !(c >= d) && ka[c]; ) ++c
  c <<= 1
  if (32 < c - a && Db) return Db.decode(B.subarray(a, c))
  c = ''
  for (d = 0; !(d >= b / 2); ++d) {
    var e = C[(a + 2 * d) >> 1]
    if (0 == e) break
    c += String.fromCharCode(e)
  }
  return c
}
function Fb(a, b, c) {
  void 0 === c && (c = 2147483647)
  if (2 > c) return 0
  c -= 2
  var d = b
  c = c < 2 * a.length ? c / 2 : a.length
  for (var e = 0; e < c; ++e) (C[b >> 1] = a.charCodeAt(e)), (b += 2)
  C[b >> 1] = 0
  return b - d
}
function Gb(a) {
  return 2 * a.length
}
function Hb(a, b) {
  for (var c = 0, d = ''; !(c >= b / 4); ) {
    var e = D[(a + 4 * c) >> 2]
    if (0 == e) break
    ++c
    65536 <= e
      ? ((e -= 65536), (d += String.fromCharCode(55296 | (e >> 10), 56320 | (e & 1023))))
      : (d += String.fromCharCode(e))
  }
  return d
}
function Ib(a, b, c) {
  void 0 === c && (c = 2147483647)
  if (4 > c) return 0
  var d = b
  c = d + c - 4
  for (var e = 0; e < a.length; ++e) {
    var f = a.charCodeAt(e)
    if (55296 <= f && 57343 >= f) {
      var l = a.charCodeAt(++e)
      f = (65536 + ((f & 1023) << 10)) | (l & 1023)
    }
    D[b >> 2] = f
    b += 4
    if (b + 4 > c) break
  }
  D[b >> 2] = 0
  return b - d
}
function Jb(a) {
  for (var b = 0, c = 0; c < a.length; ++c) {
    var d = a.charCodeAt(c)
    55296 <= d && 57343 >= d && ++c
    b += 4
  }
  return b
}
function Kb(a, b) {
  for (var c = Array(a), d = 0; d < a; ++d) c[d] = xb(E[(b + 4 * d) >> 2], 'parameter ' + d)
  return c
}
var Lb = {}
function Mb(a) {
  var b = Lb[a]
  return void 0 === b ? O(a) : b
}
var Nb = []
function Ob() {
  return 'object' == typeof globalThis ? globalThis : Function('return this')()
}
function Pb(a) {
  var b = Nb.length
  Nb.push(a)
  return b
}
var Qb = []
function Rb(a) {
  for (var b = '', c = 0; c < a; ++c) b += (0 !== c ? ', ' : '') + 'arg' + c
  var d =
    'return function emval_allocator_' +
    a +
    '(constructor, argTypes, args) {\n  var HEAPU32 = getMemory();\n'
  for (c = 0; c < a; ++c)
    d +=
      'var argType' +
      c +
      " = requireRegisteredType(HEAPU32[((argTypes)>>2)], 'parameter " +
      c +
      "');\nvar arg" +
      c +
      ' = argType' +
      c +
      '.readValueFromPointer(args);\nargs += argType' +
      c +
      "['argPackAdvance'];\nargTypes += 4;\n"
  return new Function(
    'requireRegisteredType',
    'Module',
    'valueToHandle',
    'getMemory',
    d + ('var obj = new constructor(' + b + ');\nreturn valueToHandle(obj);\n}\n')
  )(xb, g, S, () => E)
}
var Sb = {}
function Tb(a) {
  return 0 === a % 4 && (0 !== a % 100 || 0 === a % 400)
}
var Ub = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335],
  Vb = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
function Wb(a) {
  return (Tb(a.getFullYear()) ? Ub : Vb)[a.getMonth()] + a.getDate() - 1
}
function Xb(a) {
  var b = Bb(a) + 1,
    c = Yb(b)
  c && Ab(a, B, c, b)
  return c
}
function Zb(a, b) {
  $b = a
  ac = b
  if (bc)
    if ((cc || (cc = !0), 0 == a))
      Z = function () {
        var d = Math.max(0, dc + b - ec()) | 0
        setTimeout(fc, d)
      }
    else if (1 == a)
      Z = function () {
        gc(fc)
      }
    else if (2 == a) {
      if ('undefined' == typeof setImmediate) {
        var c = []
        addEventListener(
          'message',
          (d) => {
            if ('setimmediate' === d.data || 'setimmediate' === d.data.target)
              d.stopPropagation(), c.shift()()
          },
          !0
        )
        setImmediate = function (d) {
          c.push(d)
          void 0 === g.setImmediates && (g.setImmediates = [])
          g.setImmediates.push(d)
          postMessage({ target: 'setimmediate' })
        }
      }
      Z = function () {
        setImmediate(fc)
      }
    }
}
var ec
ec = () => performance.now()
function hc(a) {
  !bc ||
    x(
      'emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.'
    )
  bc = a
  var b = ic
  cc = !1
  fc = function () {
    if (!y)
      if (0 < jc.length) {
        var c = Date.now(),
          d = jc.shift()
        d.Ra(d.Qa)
        if (kc) {
          var e = kc,
            f = 0 == e % 1 ? e - 1 : Math.floor(e)
          kc = d.Eb ? f : (8 * e + (f + 0.5)) / 9
        }
        fa('main loop blocker "' + d.name + '" took ' + (Date.now() - c) + ' ms')
        g.setStatus &&
          ((c = g.statusMessage || 'Please wait...'),
          (d = kc),
          (e = lc.Gb),
          d
            ? d < e
              ? g.setStatus(c + ' (' + (e - d) + '/' + e + ')')
              : g.setStatus(c)
            : g.setStatus(''))
        b < ic || setTimeout(fc, 0)
      } else
        b < ic ||
          ((mc = (mc + 1) | 0),
          1 == $b && 1 < ac && 0 != mc % ac
            ? Z()
            : (0 == $b && (dc = ec()),
              y ||
                (g.preMainLoop && !1 === g.preMainLoop()) ||
                (nc(a), g.postMainLoop && g.postMainLoop()),
              b < ic ||
                ('object' == typeof SDL && SDL.audio && SDL.audio.tb && SDL.audio.tb(), Z())))
  }
}
function oc(a) {
  a instanceof Da || 'unwind' == a || da(1, a)
}
function rc(a) {
  ja = ja = a
  if (!noExitRuntime) {
    if (g.onExit) g.onExit(a)
    y = !0
  }
  da(a, new Da(a))
}
function nc(a) {
  if (!y)
    try {
      if ((a(), !noExitRuntime))
        try {
          rc(ja)
        } catch (b) {
          oc(b)
        }
    } catch (b) {
      oc(b)
    }
}
function sc(a) {
  setTimeout(function () {
    nc(a)
  }, 1e4)
}
function tc(a) {
  uc || (uc = {})
  uc[a] || ((uc[a] = 1), w(a))
}
var uc,
  cc = !1,
  Z = null,
  ic = 0,
  bc = null,
  $b = 0,
  ac = 0,
  mc = 0,
  jc = [],
  lc = {},
  dc,
  fc,
  kc,
  vc = !1,
  wc = !1,
  xc = [],
  yc = []
function zc() {
  function a() {
    wc =
      document.pointerLockElement === g.canvas ||
      document.mozPointerLockElement === g.canvas ||
      document.webkitPointerLockElement === g.canvas ||
      document.msPointerLockElement === g.canvas
  }
  g.preloadPlugins || (g.preloadPlugins = [])
  if (!Ac) {
    Ac = !0
    try {
      Bc = !0
    } catch (c) {
      ;(Bc = !1), w('warning: no blob constructor, cannot create blobs with mimetypes')
    }
    Cc =
      'undefined' != typeof MozBlobBuilder
        ? MozBlobBuilder
        : 'undefined' != typeof WebKitBlobBuilder
          ? WebKitBlobBuilder
          : Bc
            ? null
            : w('warning: no BlobBuilder')
    Dc = 'undefined' != typeof window ? (window.URL ? window.URL : window.webkitURL) : void 0
    g.eb ||
      'undefined' != typeof Dc ||
      (w(
        'warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.'
      ),
      (g.eb = !0))
    g.preloadPlugins.push({
      canHandle: function (c) {
        return !g.eb && /\.(jpg|jpeg|png|bmp)$/i.test(c)
      },
      handle: function (c, d, e, f) {
        var l = null
        if (Bc)
          try {
            ;(l = new Blob([c], { type: Ec(d) })),
              l.size !== c.length && (l = new Blob([new Uint8Array(c).buffer], { type: Ec(d) }))
          } catch (n) {
            tc('Blob constructor present but fails: ' + n + '; falling back to blob builder')
          }
        l || ((l = new Cc()), l.append(new Uint8Array(c).buffer), (l = l.getBlob()))
        var k = Dc.createObjectURL(l),
          m = new Image()
        m.onload = () => {
          m.complete || x('Image ' + d + ' could not be decoded')
          var n = document.createElement('canvas')
          n.width = m.width
          n.height = m.height
          n.getContext('2d').drawImage(m, 0, 0)
          Dc.revokeObjectURL(k)
          e && e(c)
        }
        m.onerror = () => {
          fa('Image ' + k + ' could not be decoded')
          f && f()
        }
        m.src = k
      }
    })
    g.preloadPlugins.push({
      canHandle: function (c) {
        return !g.Jb && c.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 }
      },
      handle: function (c, d, e, f) {
        function l() {
          m || ((m = !0), e && e(c))
        }
        function k() {
          m || ((m = !0), new Audio(), f && f())
        }
        var m = !1
        if (Bc) {
          try {
            var n = new Blob([c], { type: Ec(d) })
          } catch (r) {
            return k()
          }
          n = Dc.createObjectURL(n)
          var p = new Audio()
          p.addEventListener('canplaythrough', () => l(p), !1)
          p.onerror = function () {
            if (!m) {
              w(
                'warning: browser could not fully decode audio ' +
                  d +
                  ', trying slower base64 approach'
              )
              for (var r = '', v = 0, h = 0, q = 0; q < c.length; q++)
                for (v = (v << 8) | c[q], h += 8; 6 <= h; ) {
                  var u = (v >> (h - 6)) & 63
                  h -= 6
                  r += 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'[u]
                }
              2 == h
                ? ((r += 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'[
                    (v & 3) << 4
                  ]),
                  (r += '=='))
                : 4 == h &&
                  ((r += 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'[
                    (v & 15) << 2
                  ]),
                  (r += '='))
              p.src = 'data:audio/x-' + d.substr(-3) + ';base64,' + r
              l(p)
            }
          }
          p.src = n
          sc(function () {
            l(p)
          })
        } else return k()
      }
    })
    var b = g.canvas
    b &&
      ((b.requestPointerLock =
        b.requestPointerLock ||
        b.mozRequestPointerLock ||
        b.webkitRequestPointerLock ||
        b.msRequestPointerLock ||
        (() => {})),
      (b.exitPointerLock =
        document.exitPointerLock ||
        document.mozExitPointerLock ||
        document.webkitExitPointerLock ||
        document.msExitPointerLock ||
        (() => {})),
      (b.exitPointerLock = b.exitPointerLock.bind(document)),
      document.addEventListener('pointerlockchange', a, !1),
      document.addEventListener('mozpointerlockchange', a, !1),
      document.addEventListener('webkitpointerlockchange', a, !1),
      document.addEventListener('mspointerlockchange', a, !1),
      g.elementPointerLock &&
        b.addEventListener(
          'click',
          (c) => {
            !wc &&
              g.canvas.requestPointerLock &&
              (g.canvas.requestPointerLock(), c.preventDefault())
          },
          !1
        ))
  }
}
function Fc(a, b, c, d) {
  if (b && g.ab && a == g.canvas) return g.ab
  var e
  if (b) {
    var f = { antialias: !1, alpha: !1, Hb: 1 }
    if (d) for (var l in d) f[l] = d[l]
    if ('undefined' != typeof GL && (e = GL.Fb(a, f))) var k = GL.getContext(e).Db
  } else k = a.getContext('2d')
  if (!k) return null
  c &&
    (b ||
      'undefined' == typeof GLctx ||
      x('cannot set in module if GLctx is used, but we are a non-GL context that would replace it'),
    (g.ab = k),
    b && GL.Ib(e),
    (g.Lb = b),
    xc.forEach(function (m) {
      m()
    }),
    zc())
  return k
}
var Gc = !1,
  Hc = void 0,
  Ic = void 0
function Jc(a, b) {
  function c() {
    vc = !1
    var f = d.parentNode
    ;(document.fullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement ||
      document.webkitFullscreenElement ||
      document.webkitCurrentFullScreenElement) === f
      ? ((d.exitFullscreen = Kc),
        Hc && d.requestPointerLock(),
        (vc = !0),
        Ic
          ? ('undefined' != typeof SDL && (D[SDL.screen >> 2] = E[SDL.screen >> 2] | 8388608),
            Lc(g.canvas),
            Mc())
          : Lc(d))
      : (f.parentNode.insertBefore(d, f),
        f.parentNode.removeChild(f),
        Ic
          ? ('undefined' != typeof SDL && (D[SDL.screen >> 2] = E[SDL.screen >> 2] & -8388609),
            Lc(g.canvas),
            Mc())
          : Lc(d))
    if (g.onFullScreen) g.onFullScreen(vc)
    if (g.onFullscreen) g.onFullscreen(vc)
  }
  Hc = a
  Ic = b
  'undefined' == typeof Hc && (Hc = !0)
  'undefined' == typeof Ic && (Ic = !1)
  var d = g.canvas
  Gc ||
    ((Gc = !0),
    document.addEventListener('fullscreenchange', c, !1),
    document.addEventListener('mozfullscreenchange', c, !1),
    document.addEventListener('webkitfullscreenchange', c, !1),
    document.addEventListener('MSFullscreenChange', c, !1))
  var e = document.createElement('div')
  d.parentNode.insertBefore(e, d)
  e.appendChild(d)
  e.requestFullscreen =
    e.requestFullscreen ||
    e.mozRequestFullScreen ||
    e.msRequestFullscreen ||
    (e.webkitRequestFullscreen
      ? () => e.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)
      : null) ||
    (e.webkitRequestFullScreen
      ? () => e.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT)
      : null)
  e.requestFullscreen()
}
function Kc() {
  if (!vc) return !1
  ;(
    document.exitFullscreen ||
    document.cancelFullScreen ||
    document.mozCancelFullScreen ||
    document.msExitFullscreen ||
    document.webkitCancelFullScreen ||
    function () {}
  ).apply(document, [])
  return !0
}
var Nc = 0
function gc(a) {
  if ('function' == typeof requestAnimationFrame) requestAnimationFrame(a)
  else {
    var b = Date.now()
    if (0 === Nc) Nc = b + 1e3 / 60
    else for (; b + 2 >= Nc; ) Nc += 1e3 / 60
    setTimeout(a, Math.max(Nc - b, 0))
  }
}
function Ec(a) {
  return {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    bmp: 'image/bmp',
    ogg: 'audio/ogg',
    wav: 'audio/wav',
    mp3: 'audio/mpeg'
  }[a.substr(a.lastIndexOf('.') + 1)]
}
var Oc = []
function Mc() {
  var a = g.canvas
  Oc.forEach(function (b) {
    b(a.width, a.height)
  })
}
function Lc(a, b, c) {
  b && c ? ((a.Cb = b), (a.ob = c)) : ((b = a.Cb), (c = a.ob))
  var d = b,
    e = c
  g.forcedAspectRatio &&
    0 < g.forcedAspectRatio &&
    (d / e < g.forcedAspectRatio
      ? (d = Math.round(e * g.forcedAspectRatio))
      : (e = Math.round(d / g.forcedAspectRatio)))
  if (
    (document.fullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement ||
      document.webkitFullscreenElement ||
      document.webkitCurrentFullScreenElement) === a.parentNode &&
    'undefined' != typeof screen
  ) {
    var f = Math.min(screen.width / d, screen.height / e)
    d = Math.round(d * f)
    e = Math.round(e * f)
  }
  Ic
    ? (a.width != d && (a.width = d),
      a.height != e && (a.height = e),
      'undefined' != typeof a.style &&
        (a.style.removeProperty('width'), a.style.removeProperty('height')))
    : (a.width != b && (a.width = b),
      a.height != c && (a.height = c),
      'undefined' != typeof a.style &&
        (d != b || e != c
          ? (a.style.setProperty('width', d + 'px', 'important'),
            a.style.setProperty('height', e + 'px', 'important'))
          : (a.style.removeProperty('width'), a.style.removeProperty('height'))))
}
var Ac,
  Bc,
  Cc,
  Dc,
  Pc = {}
function Qc() {
  if (!Rc) {
    var a = {
        USER: 'web_user',
        LOGNAME: 'web_user',
        PATH: '/',
        PWD: '/',
        HOME: '/home/web_user',
        LANG:
          (
            ('object' == typeof navigator && navigator.languages && navigator.languages[0]) ||
            'C'
          ).replace('-', '_') + '.UTF-8',
        _: ca || './this.program'
      },
      b
    for (b in Pc) void 0 === Pc[b] ? delete a[b] : (a[b] = Pc[b])
    var c = []
    for (b in a) c.push(b + '=' + a[b])
    Rc = c
  }
  return Rc
}
var Rc,
  Sc = [null, [], []]
function Tc() {
  if ('object' == typeof crypto && 'function' == typeof crypto.getRandomValues)
    return (a) => crypto.getRandomValues(a)
  x('initRandomDevice')
}
function Uc(a) {
  return (Uc = Tc())(a)
}
var Vc = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
  Wc = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
function Xc(a) {
  var b = Array(Bb(a) + 1)
  Ab(a, b, 0, b.length)
  return b
}
function Yc(a, b, c, d) {
  function e(h, q, u) {
    for (h = 'number' == typeof h ? h.toString() : h || ''; h.length < q; ) h = u[0] + h
    return h
  }
  function f(h, q) {
    return e(h, q, '0')
  }
  function l(h, q) {
    function u(J) {
      return 0 > J ? -1 : 0 < J ? 1 : 0
    }
    var z
    0 === (z = u(h.getFullYear() - q.getFullYear())) &&
      0 === (z = u(h.getMonth() - q.getMonth())) &&
      (z = u(h.getDate() - q.getDate()))
    return z
  }
  function k(h) {
    switch (h.getDay()) {
      case 0:
        return new Date(h.getFullYear() - 1, 11, 29)
      case 1:
        return h
      case 2:
        return new Date(h.getFullYear(), 0, 3)
      case 3:
        return new Date(h.getFullYear(), 0, 2)
      case 4:
        return new Date(h.getFullYear(), 0, 1)
      case 5:
        return new Date(h.getFullYear() - 1, 11, 31)
      case 6:
        return new Date(h.getFullYear() - 1, 11, 30)
    }
  }
  function m(h) {
    var q = h.Da
    for (h = new Date(new Date(h.Ea + 1900, 0, 1).getTime()); 0 < q; ) {
      var u = h.getMonth(),
        z = (Tb(h.getFullYear()) ? Vc : Wc)[u]
      if (q > z - h.getDate())
        (q -= z - h.getDate() + 1),
          h.setDate(1),
          11 > u ? h.setMonth(u + 1) : (h.setMonth(0), h.setFullYear(h.getFullYear() + 1))
      else {
        h.setDate(h.getDate() + q)
        break
      }
    }
    u = new Date(h.getFullYear() + 1, 0, 4)
    q = k(new Date(h.getFullYear(), 0, 4))
    u = k(u)
    return 0 >= l(q, h)
      ? 0 >= l(u, h)
        ? h.getFullYear() + 1
        : h.getFullYear()
      : h.getFullYear() - 1
  }
  var n = D[(d + 40) >> 2]
  d = {
    zb: D[d >> 2],
    yb: D[(d + 4) >> 2],
    Oa: D[(d + 8) >> 2],
    Za: D[(d + 12) >> 2],
    Pa: D[(d + 16) >> 2],
    Ea: D[(d + 20) >> 2],
    Aa: D[(d + 24) >> 2],
    Da: D[(d + 28) >> 2],
    Kb: D[(d + 32) >> 2],
    xb: D[(d + 36) >> 2],
    Ab: n ? (n ? Y(B, n) : '') : ''
  }
  c = c ? Y(B, c) : ''
  n = {
    '%c': '%a %b %d %H:%M:%S %Y',
    '%D': '%m/%d/%y',
    '%F': '%Y-%m-%d',
    '%h': '%b',
    '%r': '%I:%M:%S %p',
    '%R': '%H:%M',
    '%T': '%H:%M:%S',
    '%x': '%m/%d/%y',
    '%X': '%H:%M:%S',
    '%Ec': '%c',
    '%EC': '%C',
    '%Ex': '%m/%d/%y',
    '%EX': '%H:%M:%S',
    '%Ey': '%y',
    '%EY': '%Y',
    '%Od': '%d',
    '%Oe': '%e',
    '%OH': '%H',
    '%OI': '%I',
    '%Om': '%m',
    '%OM': '%M',
    '%OS': '%S',
    '%Ou': '%u',
    '%OU': '%U',
    '%OV': '%V',
    '%Ow': '%w',
    '%OW': '%W',
    '%Oy': '%y'
  }
  for (var p in n) c = c.replace(new RegExp(p, 'g'), n[p])
  var r = 'Sunday Monday Tuesday Wednesday Thursday Friday Saturday'.split(' '),
    v =
      'January February March April May June July August September October November December'.split(
        ' '
      )
  n = {
    '%a': function (h) {
      return r[h.Aa].substring(0, 3)
    },
    '%A': function (h) {
      return r[h.Aa]
    },
    '%b': function (h) {
      return v[h.Pa].substring(0, 3)
    },
    '%B': function (h) {
      return v[h.Pa]
    },
    '%C': function (h) {
      return f(((h.Ea + 1900) / 100) | 0, 2)
    },
    '%d': function (h) {
      return f(h.Za, 2)
    },
    '%e': function (h) {
      return e(h.Za, 2, ' ')
    },
    '%g': function (h) {
      return m(h).toString().substring(2)
    },
    '%G': function (h) {
      return m(h)
    },
    '%H': function (h) {
      return f(h.Oa, 2)
    },
    '%I': function (h) {
      h = h.Oa
      0 == h ? (h = 12) : 12 < h && (h -= 12)
      return f(h, 2)
    },
    '%j': function (h) {
      for (var q = 0, u = 0; u <= h.Pa - 1; q += (Tb(h.Ea + 1900) ? Vc : Wc)[u++]);
      return f(h.Za + q, 3)
    },
    '%m': function (h) {
      return f(h.Pa + 1, 2)
    },
    '%M': function (h) {
      return f(h.yb, 2)
    },
    '%n': function () {
      return '\n'
    },
    '%p': function (h) {
      return 0 <= h.Oa && 12 > h.Oa ? 'AM' : 'PM'
    },
    '%S': function (h) {
      return f(h.zb, 2)
    },
    '%t': function () {
      return '\t'
    },
    '%u': function (h) {
      return h.Aa || 7
    },
    '%U': function (h) {
      return f(Math.floor((h.Da + 7 - h.Aa) / 7), 2)
    },
    '%V': function (h) {
      var q = Math.floor((h.Da + 7 - ((h.Aa + 6) % 7)) / 7)
      2 >= (h.Aa + 371 - h.Da - 2) % 7 && q++
      if (q) 53 == q && ((u = (h.Aa + 371 - h.Da) % 7), 4 == u || (3 == u && Tb(h.Ea)) || (q = 1))
      else {
        q = 52
        var u = (h.Aa + 7 - h.Da - 1) % 7
        ;(4 == u || (5 == u && Tb((h.Ea % 400) - 1))) && q++
      }
      return f(q, 2)
    },
    '%w': function (h) {
      return h.Aa
    },
    '%W': function (h) {
      return f(Math.floor((h.Da + 7 - ((h.Aa + 6) % 7)) / 7), 2)
    },
    '%y': function (h) {
      return (h.Ea + 1900).toString().substring(2)
    },
    '%Y': function (h) {
      return h.Ea + 1900
    },
    '%z': function (h) {
      h = h.xb
      var q = 0 <= h
      h = Math.abs(h) / 60
      return (q ? '+' : '-') + String('0000' + ((h / 60) * 100 + (h % 60))).slice(-4)
    },
    '%Z': function (h) {
      return h.Ab
    },
    '%%': function () {
      return '%'
    }
  }
  c = c.replace(/%%/g, '\x00\x00')
  for (p in n) c.includes(p) && (c = c.replace(new RegExp(p, 'g'), n[p](d)))
  c = c.replace(/\0\0/g, '%')
  p = Xc(c)
  if (p.length > b) return 0
  A.set(p, a)
  return p.length - 1
}
La = g.InternalError = Ka('InternalError')
for (var Zc = Array(256), $c = 0; 256 > $c; ++$c) Zc[$c] = String.fromCharCode($c)
Pa = Zc
P = g.BindingError = Ka('BindingError')
R.prototype.isAliasOf = function (a) {
  if (!(this instanceof R && a instanceof R)) return !1
  var b = this.qa.ta.ra,
    c = this.qa.sa,
    d = a.qa.ta.ra
  for (a = a.qa.sa; b.za; ) (c = b.Ka(c)), (b = b.za)
  for (; d.za; ) (a = d.Ka(a)), (d = d.za)
  return b === d && c === a
}
R.prototype.clone = function () {
  this.qa.sa || Qa(this)
  if (this.qa.Ia) return (this.qa.count.value += 1), this
  var a = bb,
    b = Object,
    c = b.create,
    d = Object.getPrototypeOf(this),
    e = this.qa
  a = a(
    c.call(b, d, {
      qa: { value: { count: e.count, Ga: e.Ga, Ia: e.Ia, sa: e.sa, ta: e.ta, va: e.va, ya: e.ya } }
    })
  )
  a.qa.count.value += 1
  a.qa.Ga = !1
  return a
}
R.prototype['delete'] = function () {
  this.qa.sa || Qa(this)
  this.qa.Ga && !this.qa.Ia && Q('Object already scheduled for deletion')
  Sa(this)
  Ta(this.qa)
  this.qa.Ia || ((this.qa.va = void 0), (this.qa.sa = void 0))
}
R.prototype.isDeleted = function () {
  return !this.qa.sa
}
R.prototype.deleteLater = function () {
  this.qa.sa || Qa(this)
  this.qa.Ga && !this.qa.Ia && Q('Object already scheduled for deletion')
  Wa.push(this)
  1 === Wa.length && Ya && Ya(Xa)
  this.qa.Ga = !0
  return this
}
g.getInheritedInstanceCount = function () {
  return Object.keys(Za).length
}
g.getLiveInheritedInstances = function () {
  var a = [],
    b
  for (b in Za) Za.hasOwnProperty(b) && a.push(Za[b])
  return a
}
g.flushPendingDeletes = Xa
g.setDelayFunction = function (a) {
  Ya = a
  Wa.length && Ya && Ya(Xa)
}
T.prototype.nb = function (a) {
  this.gb && (a = this.gb(a))
  return a
}
T.prototype.bb = function (a) {
  this.xa && this.xa(a)
}
T.prototype.argPackAdvance = 8
T.prototype.readValueFromPointer = I
T.prototype.deleteObject = function (a) {
  if (null !== a) a['delete']()
}
T.prototype.fromWireType = function (a) {
  function b() {
    return this.Na
      ? ab(this.ra.Ha, { ta: this.rb, sa: c, ya: this, va: a })
      : ab(this.ra.Ha, { ta: this, sa: a })
  }
  var c = this.nb(a)
  if (!c) return this.bb(a), null
  var d = $a(this.ra, c)
  if (void 0 !== d) {
    if (0 === d.qa.count.value) return (d.qa.sa = c), (d.qa.va = a), d.clone()
    d = d.clone()
    this.bb(a)
    return d
  }
  d = this.ra.mb(c)
  d = Va[d]
  if (!d) return b.call(this)
  d = this.Ma ? d.jb : d.pointerType
  var e = Ua(c, this.ra, d.ra)
  return null === e
    ? b.call(this)
    : this.Na
      ? ab(d.ra.Ha, { ta: d, sa: e, ya: this, va: a })
      : ab(d.ra.Ha, { ta: d, sa: e })
}
ob = g.UnboundTypeError = Ka('UnboundTypeError')
W.Ba.push({ value: void 0 }, { value: null }, { value: !0 }, { value: !1 })
W.ib = W.Ba.length
g.count_emval_handles = function () {
  for (var a = 0, b = W.ib; b < W.Ba.length; ++b) void 0 !== W.Ba[b] && ++a
  return a
}
g.requestFullscreen = function (a, b) {
  Jc(a, b)
}
g.requestAnimationFrame = function (a) {
  gc(a)
}
g.setCanvasSize = function (a, b, c) {
  Lc(g.canvas, a, b)
  c || Mc()
}
g.pauseMainLoop = function () {
  Z = null
  ic++
}
g.resumeMainLoop = function () {
  ic++
  var a = $b,
    b = ac,
    c = bc
  bc = null
  hc(c)
  Zb(a, b)
  Z()
}
g.getUserMedia = function () {
  window.getUserMedia || (window.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia)
  window.getUserMedia(void 0)
}
g.createContext = function (a, b, c, d) {
  return Fc(a, b, c, d)
}
var cd = {
  v: function (a) {
    var b = Fa[a]
    delete Fa[a]
    var c = b.elements,
      d = c.length,
      e = c
        .map(function (k) {
          return k.Ua
        })
        .concat(
          c.map(function (k) {
            return k.Xa
          })
        ),
      f = b.Ja,
      l = b.xa
    M([a], e, function (k) {
      c.forEach((m, n) => {
        var p = k[n],
          r = m.Sa,
          v = m.Ta,
          h = k[n + d],
          q = m.Wa,
          u = m.Ya
        m.read = (z) => p.fromWireType(r(v, z))
        m.write = (z, J) => {
          var F = []
          q(u, z, h.toWireType(F, J))
          Ga(F)
        }
      })
      return [
        {
          name: b.name,
          fromWireType: function (m) {
            for (var n = Array(d), p = 0; p < d; ++p) n[p] = c[p].read(m)
            l(m)
            return n
          },
          toWireType: function (m, n) {
            if (d !== n.length)
              throw new TypeError(
                'Incorrect number of tuple elements for ' +
                  b.name +
                  ': expected=' +
                  d +
                  ', actual=' +
                  n.length
              )
            for (var p = f(), r = 0; r < d; ++r) c[r].write(p, n[r])
            null !== m && m.push(l, p)
            return p
          },
          argPackAdvance: 8,
          readValueFromPointer: I,
          wa: l
        }
      ]
    })
  },
  D: function (a) {
    var b = Na[a]
    delete Na[a]
    var c = b.Ja,
      d = b.xa,
      e = b.cb,
      f = e.map((l) => l.Ua).concat(e.map((l) => l.Xa))
    M([a], f, (l) => {
      var k = {}
      e.forEach((m, n) => {
        var p = l[n],
          r = m.Sa,
          v = m.Ta,
          h = l[n + e.length],
          q = m.Wa,
          u = m.Ya
        k[m.lb] = {
          read: (z) => p.fromWireType(r(v, z)),
          write: (z, J) => {
            var F = []
            q(u, z, h.toWireType(F, J))
            Ga(F)
          }
        }
      })
      return [
        {
          name: b.name,
          fromWireType: function (m) {
            var n = {},
              p
            for (p in k) n[p] = k[p].read(m)
            d(m)
            return n
          },
          toWireType: function (m, n) {
            for (var p in k) if (!(p in n)) throw new TypeError('Missing field:  "' + p + '"')
            var r = c()
            for (p in k) k[p].write(r, n[p])
            null !== m && m.push(d, r)
            return r
          },
          argPackAdvance: 8,
          readValueFromPointer: I,
          wa: d
        }
      ]
    })
  },
  L: function () {},
  Y: function (a, b, c, d, e) {
    var f = Oa(c)
    b = O(b)
    N(a, {
      name: b,
      fromWireType: function (l) {
        return !!l
      },
      toWireType: function (l, k) {
        return k ? d : e
      },
      argPackAdvance: 8,
      readValueFromPointer: function (l) {
        if (1 === c) var k = A
        else if (2 === c) k = C
        else if (4 === c) k = D
        else throw new TypeError('Unknown boolean type size: ' + b)
        return this.fromWireType(k[l >> f])
      },
      wa: null
    })
  },
  A: function (a, b, c, d, e, f, l, k, m, n, p, r, v) {
    p = O(p)
    f = U(e, f)
    k && (k = U(l, k))
    n && (n = U(m, n))
    v = U(r, v)
    var h = Ia(p)
    db(h, function () {
      rb('Cannot construct ' + p + ' due to unbound types', [d])
    })
    M([a, b, c], d ? [d] : [], function (q) {
      q = q[0]
      if (d) {
        var u = q.ra
        var z = u.Ha
      } else z = R.prototype
      q = Ja(h, function () {
        if (Object.getPrototypeOf(this) !== J) throw new P("Use 'new' to construct " + p)
        if (void 0 === F.Ca) throw new P(p + ' has no accessible constructor')
        var pc = F.Ca[arguments.length]
        if (void 0 === pc)
          throw new P(
            'Tried to invoke ctor of ' +
              p +
              ' with invalid number of parameters (' +
              arguments.length +
              ') - expected (' +
              Object.keys(F.Ca).toString() +
              ') parameters instead!'
          )
        return pc.apply(this, arguments)
      })
      var J = Object.create(z, { constructor: { value: q } })
      q.prototype = J
      var F = new eb(p, q, J, v, u, f, k, n)
      u = new T(p, F, !0, !1)
      z = new T(p + '*', F, !1, !1)
      var qc = new T(p + ' const*', F, !1, !0)
      Va[a] = { pointerType: z, jb: qc }
      kb(h, q)
      return [u, z, qc]
    })
  },
  q: function (a, b, c, d, e, f, l, k) {
    var m = ub(c, d)
    b = O(b)
    f = U(e, f)
    M([], [a], function (n) {
      function p() {
        rb('Cannot call ' + r + ' due to unbound types', m)
      }
      n = n[0]
      var r = n.name + '.' + b
      b.startsWith('@@') && (b = Symbol[b.substring(2)])
      var v = n.ra.constructor
      void 0 === v[b] ? ((p.Fa = c - 1), (v[b] = p)) : (cb(v, b, r), (v[b].ua[c - 1] = p))
      M([], m, function (h) {
        h = tb(r, [h[0], null].concat(h.slice(1)), null, f, l, k)
        void 0 === v[b].ua ? ((h.Fa = c - 1), (v[b] = h)) : (v[b].ua[c - 1] = h)
        return []
      })
      return []
    })
  },
  C: function (a, b, c, d, e, f) {
    0 < b || x()
    var l = ub(b, c)
    e = U(d, e)
    M([], [a], function (k) {
      k = k[0]
      var m = 'constructor ' + k.name
      void 0 === k.ra.Ca && (k.ra.Ca = [])
      if (void 0 !== k.ra.Ca[b - 1])
        throw new P(
          'Cannot register multiple constructors with identical number of parameters (' +
            (b - 1) +
            ") for class '" +
            k.name +
            "'! Overload resolution is currently only performed using the parameter count, not actual type info!"
        )
      k.ra.Ca[b - 1] = () => {
        rb('Cannot construct ' + k.name + ' due to unbound types', l)
      }
      M([], l, function (n) {
        n.splice(1, 0, null)
        k.ra.Ca[b - 1] = tb(m, n, null, e, f)
        return []
      })
      return []
    })
  },
  p: function (a, b, c, d, e, f, l, k, m) {
    var n = ub(c, d)
    b = O(b)
    f = U(e, f)
    M([], [a], function (p) {
      function r() {
        rb('Cannot call ' + v + ' due to unbound types', n)
      }
      p = p[0]
      var v = p.name + '.' + b
      b.startsWith('@@') && (b = Symbol[b.substring(2)])
      k && p.ra.sb.push(b)
      var h = p.ra.Ha,
        q = h[b]
      void 0 === q || (void 0 === q.ua && q.className !== p.name && q.Fa === c - 2)
        ? ((r.Fa = c - 2), (r.className = p.name), (h[b] = r))
        : (cb(h, b, v), (h[b].ua[c - 2] = r))
      M([], n, function (u) {
        u = tb(v, u, p, f, l, m)
        void 0 === h[b].ua ? ((u.Fa = c - 2), (h[b] = u)) : (h[b].ua[c - 2] = u)
        return []
      })
      return []
    })
  },
  X: function (a, b) {
    b = O(b)
    N(a, {
      name: b,
      fromWireType: function (c) {
        var d = X(c)
        vb(c)
        return d
      },
      toWireType: function (c, d) {
        return S(d)
      },
      argPackAdvance: 8,
      readValueFromPointer: I,
      wa: null
    })
  },
  J: function (a, b, c, d) {
    function e() {}
    c = Oa(c)
    b = O(b)
    e.values = {}
    N(a, {
      name: b,
      constructor: e,
      fromWireType: function (f) {
        return this.constructor.values[f]
      },
      toWireType: function (f, l) {
        return l.value
      },
      argPackAdvance: 8,
      readValueFromPointer: wb(b, c, d),
      wa: null
    })
    db(b, e)
  },
  z: function (a, b, c) {
    var d = xb(a, 'enum')
    b = O(b)
    a = d.constructor
    d = Object.create(d.constructor.prototype, {
      value: { value: c },
      constructor: { value: Ja(d.name + '_' + b, function () {}) }
    })
    a.values[c] = d
    a[b] = d
  },
  G: function (a, b, c) {
    c = Oa(c)
    b = O(b)
    N(a, {
      name: b,
      fromWireType: function (d) {
        return d
      },
      toWireType: function (d, e) {
        return e
      },
      argPackAdvance: 8,
      readValueFromPointer: yb(b, c),
      wa: null
    })
  },
  r: function (a, b, c, d, e) {
    b = O(b)
    ;-1 === e && (e = 4294967295)
    e = Oa(c)
    var f = (k) => k
    if (0 === d) {
      var l = 32 - 8 * c
      f = (k) => (k << l) >>> l
    }
    c = b.includes('unsigned')
      ? function (k, m) {
          return m >>> 0
        }
      : function (k, m) {
          return m
        }
    N(a, {
      name: b,
      fromWireType: f,
      toWireType: c,
      argPackAdvance: 8,
      readValueFromPointer: zb(b, e, 0 !== d),
      wa: null
    })
  },
  k: function (a, b, c) {
    function d(f) {
      f >>= 2
      var l = E
      return new e(l.buffer, l[f + 1], l[f])
    }
    var e = [
      Int8Array,
      Uint8Array,
      Int16Array,
      Uint16Array,
      Int32Array,
      Uint32Array,
      Float32Array,
      Float64Array
    ][b]
    c = O(c)
    N(a, { name: c, fromWireType: d, argPackAdvance: 8, readValueFromPointer: d }, { pb: !0 })
  },
  H: function (a, b) {
    b = O(b)
    var c = 'std::string' === b
    N(a, {
      name: b,
      fromWireType: function (d) {
        var e = E[d >> 2],
          f = d + 4
        if (c)
          for (var l = f, k = 0; k <= e; ++k) {
            var m = f + k
            if (k == e || 0 == B[m]) {
              l = l ? Y(B, l, m - l) : ''
              if (void 0 === n) var n = l
              else (n += String.fromCharCode(0)), (n += l)
              l = m + 1
            }
          }
        else {
          n = Array(e)
          for (k = 0; k < e; ++k) n[k] = String.fromCharCode(B[f + k])
          n = n.join('')
        }
        V(d)
        return n
      },
      toWireType: function (d, e) {
        e instanceof ArrayBuffer && (e = new Uint8Array(e))
        var f = 'string' == typeof e
        f ||
          e instanceof Uint8Array ||
          e instanceof Uint8ClampedArray ||
          e instanceof Int8Array ||
          Q('Cannot pass non-string to std::string')
        var l = c && f ? Bb(e) : e.length
        var k = Yb(4 + l + 1),
          m = k + 4
        E[k >> 2] = l
        if (c && f) Ab(e, B, m, l + 1)
        else if (f)
          for (f = 0; f < l; ++f) {
            var n = e.charCodeAt(f)
            255 < n && (V(m), Q('String has UTF-16 code units that do not fit in 8 bits'))
            B[m + f] = n
          }
        else for (f = 0; f < l; ++f) B[m + f] = e[f]
        null !== d && d.push(V, k)
        return k
      },
      argPackAdvance: 8,
      readValueFromPointer: I,
      wa: function (d) {
        V(d)
      }
    })
  },
  B: function (a, b, c) {
    c = O(c)
    if (2 === b) {
      var d = Eb
      var e = Fb
      var f = Gb
      var l = () => ka
      var k = 1
    } else 4 === b && ((d = Hb), (e = Ib), (f = Jb), (l = () => E), (k = 2))
    N(a, {
      name: c,
      fromWireType: function (m) {
        for (var n = E[m >> 2], p = l(), r, v = m + 4, h = 0; h <= n; ++h) {
          var q = m + 4 + h * b
          if (h == n || 0 == p[q >> k])
            (v = d(v, q - v)),
              void 0 === r ? (r = v) : ((r += String.fromCharCode(0)), (r += v)),
              (v = q + b)
        }
        V(m)
        return r
      },
      toWireType: function (m, n) {
        'string' != typeof n && Q('Cannot pass non-string to C++ string type ' + c)
        var p = f(n),
          r = Yb(4 + p + b)
        E[r >> 2] = p >> k
        e(n, r + 4, p + b)
        null !== m && m.push(V, r)
        return r
      },
      argPackAdvance: 8,
      readValueFromPointer: I,
      wa: function (m) {
        V(m)
      }
    })
  },
  w: function (a, b, c, d, e, f) {
    Fa[a] = { name: O(b), Ja: U(c, d), xa: U(e, f), elements: [] }
  },
  f: function (a, b, c, d, e, f, l, k, m) {
    Fa[a].elements.push({ Ua: b, Sa: U(c, d), Ta: e, Xa: f, Wa: U(l, k), Ya: m })
  },
  E: function (a, b, c, d, e, f) {
    Na[a] = { name: O(b), Ja: U(c, d), xa: U(e, f), cb: [] }
  },
  u: function (a, b, c, d, e, f, l, k, m, n) {
    Na[a].cb.push({ lb: O(b), Ua: c, Sa: U(d, e), Ta: f, Xa: l, Wa: U(k, m), Ya: n })
  },
  Z: function (a, b) {
    b = O(b)
    N(a, {
      qb: !0,
      name: b,
      argPackAdvance: 0,
      fromWireType: function () {},
      toWireType: function () {}
    })
  },
  j: function (a, b, c) {
    a = X(a)
    b = xb(b, 'emval::as')
    var d = [],
      e = S(d)
    E[c >> 2] = e
    return b.toWireType(d, a)
  },
  t: function (a, b, c, d) {
    a = X(a)
    c = Kb(b, c)
    for (var e = Array(b), f = 0; f < b; ++f) {
      var l = c[f]
      e[f] = l.readValueFromPointer(d)
      d += l.argPackAdvance
    }
    a = a.apply(void 0, e)
    return S(a)
  },
  y: function (a, b, c, d, e) {
    a = Nb[a]
    b = X(b)
    c = Mb(c)
    var f = []
    E[d >> 2] = S(f)
    return a(b, c, f, e)
  },
  n: function (a, b, c, d) {
    a = Nb[a]
    b = X(b)
    c = Mb(c)
    a(b, c, null, d)
  },
  a: vb,
  g: function (a, b) {
    a = X(a)
    b = X(b)
    return a == b
  },
  m: function (a) {
    if (0 === a) return S(Ob())
    a = Mb(a)
    return S(Ob()[a])
  },
  l: function (a, b) {
    var c = Kb(a, b),
      d = c[0]
    b =
      d.name +
      '_$' +
      c
        .slice(1)
        .map(function (p) {
          return p.name
        })
        .join('_') +
      '$'
    var e = Qb[b]
    if (void 0 !== e) return e
    e = ['retType']
    for (var f = [d], l = '', k = 0; k < a - 1; ++k)
      (l += (0 !== k ? ', ' : '') + 'arg' + k), e.push('argType' + k), f.push(c[1 + k])
    var m = 'return function ' + Ia('methodCaller_' + b) + '(handle, name, destructors, args) {\n',
      n = 0
    for (k = 0; k < a - 1; ++k)
      (m +=
        '    var arg' +
        k +
        ' = argType' +
        k +
        '.readValueFromPointer(args' +
        (n ? '+' + n : '') +
        ');\n'),
        (n += c[k + 1].argPackAdvance)
    m += '    var rv = handle[name](' + l + ');\n'
    for (k = 0; k < a - 1; ++k)
      c[k + 1].deleteObject && (m += '    argType' + k + '.deleteObject(arg' + k + ');\n')
    d.qb || (m += '    return retType.toWireType(destructors, rv);\n')
    e.push(m + '};\n')
    a = sb(e).apply(null, f)
    e = Pb(a)
    return (Qb[b] = e)
  },
  e: function (a, b) {
    a = X(a)
    b = X(b)
    return S(a[b])
  },
  c: function (a) {
    4 < a && (W.get(a).hb += 1)
  },
  s: function (a, b, c, d) {
    a = X(a)
    var e = Sb[b]
    e || ((e = Rb(b)), (Sb[b] = e))
    return e(a, c, d)
  },
  d: function (a) {
    return S(Mb(a))
  },
  h: function (a) {
    var b = X(a)
    Ga(b)
    vb(a)
  },
  o: function (a, b, c) {
    a = X(a)
    b = X(b)
    c = X(c)
    a[b] = c
  },
  i: function (a, b) {
    a = xb(a, '_emval_take_value')
    a = a.readValueFromPointer(b)
    return S(a)
  },
  U: function (a, b) {
    a = new Date(1e3 * (E[a >> 2] + 4294967296 * D[(a + 4) >> 2]))
    D[b >> 2] = a.getSeconds()
    D[(b + 4) >> 2] = a.getMinutes()
    D[(b + 8) >> 2] = a.getHours()
    D[(b + 12) >> 2] = a.getDate()
    D[(b + 16) >> 2] = a.getMonth()
    D[(b + 20) >> 2] = a.getFullYear() - 1900
    D[(b + 24) >> 2] = a.getDay()
    D[(b + 28) >> 2] = Wb(a) | 0
    D[(b + 36) >> 2] = -(60 * a.getTimezoneOffset())
    var c = new Date(a.getFullYear(), 6, 1).getTimezoneOffset(),
      d = new Date(a.getFullYear(), 0, 1).getTimezoneOffset()
    D[(b + 32) >> 2] = (c != d && a.getTimezoneOffset() == Math.min(d, c)) | 0
  },
  V: function (a) {
    var b = new Date(
        D[(a + 20) >> 2] + 1900,
        D[(a + 16) >> 2],
        D[(a + 12) >> 2],
        D[(a + 8) >> 2],
        D[(a + 4) >> 2],
        D[a >> 2],
        0
      ),
      c = D[(a + 32) >> 2],
      d = b.getTimezoneOffset(),
      e = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(),
      f = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(),
      l = Math.min(f, e)
    0 > c
      ? (D[(a + 32) >> 2] = Number(e != f && l == d))
      : 0 < c != (l == d) &&
        ((e = Math.max(f, e)), b.setTime(b.getTime() + 6e4 * ((0 < c ? l : e) - d)))
    D[(a + 24) >> 2] = b.getDay()
    D[(a + 28) >> 2] = Wb(b) | 0
    D[a >> 2] = b.getSeconds()
    D[(a + 4) >> 2] = b.getMinutes()
    D[(a + 8) >> 2] = b.getHours()
    D[(a + 12) >> 2] = b.getDate()
    D[(a + 16) >> 2] = b.getMonth()
    D[(a + 20) >> 2] = b.getYear()
    return (b.getTime() / 1e3) | 0
  },
  R: function (a, b, c) {
    function d(m) {
      return (m = m.toTimeString().match(/\(([A-Za-z ]+)\)$/)) ? m[1] : 'GMT'
    }
    var e = new Date().getFullYear(),
      f = new Date(e, 0, 1),
      l = new Date(e, 6, 1)
    e = f.getTimezoneOffset()
    var k = l.getTimezoneOffset()
    E[a >> 2] = 60 * Math.max(e, k)
    D[b >> 2] = Number(e != k)
    a = d(f)
    b = d(l)
    a = Xb(a)
    b = Xb(b)
    k < e ? ((E[c >> 2] = a), (E[(c + 4) >> 2] = b)) : ((E[c >> 2] = b), (E[(c + 4) >> 2] = a))
  },
  b: function () {
    x('')
  },
  _: function (a, b, c, d, e, f) {
    b = b ? Y(B, b) : ''
    a = yc[a]
    var l = -1
    e && ((l = a.La.length), a.La.push({ Ra: mb(e), Qa: f }), a.$a++)
    b = { funcName: b, callbackId: l, data: c ? new Uint8Array(B.subarray(c, c + d)) : 0 }
    c ? a.worker.postMessage(b, [b.data.buffer]) : a.worker.postMessage(b)
  },
  aa: function (a) {
    a = a ? Y(B, a) : ''
    var b = yc.length
    a = { worker: new Worker(a), La: [], $a: 0, buffer: 0, bufferSize: 0 }
    a.worker.onmessage = function (c) {
      if (!y) {
        var d = yc[b]
        if (d) {
          var e = c.data.callbackId,
            f = d.La[e]
          if (f)
            if ((c.data.finalResponse && (d.$a--, (d.La[e] = null)), (c = c.data.data))) {
              c.byteLength || (c = new Uint8Array(c))
              if (!d.buffer || d.bufferSize < c.length)
                d.buffer && V(d.buffer), (d.bufferSize = c.length), (d.buffer = Yb(c.length))
              B.set(c, d.buffer)
              f.Ra(d.buffer, c.length, f.Qa)
            } else f.Ra(0, 0, f.Qa)
        }
      }
    }
    yc.push(a)
    return b
  },
  F: function () {
    return Date.now()
  },
  $: function (a) {
    var b = yc[a]
    b.worker.terminate()
    b.buffer && V(b.buffer)
    yc[a] = null
  },
  W: function (a, b, c) {
    B.copyWithin(a, b, b + c)
  },
  Q: function (a) {
    var b = B.length
    a >>>= 0
    if (2147483648 < a) return !1
    for (var c = 1; 4 >= c; c *= 2) {
      var d = b * (1 + 0.2 / c)
      d = Math.min(d, a + 100663296)
      var e = Math,
        f = e.min
      d = Math.max(a, d)
      d += (65536 - (d % 65536)) % 65536
      a: {
        var l = ia.buffer
        try {
          ia.grow((f.call(e, 2147483648, d) - l.byteLength + 65535) >>> 16)
          na()
          var k = 1
          break a
        } catch (m) {}
        k = void 0
      }
      if (k) return !0
    }
    return !1
  },
  I: function (a, b) {
    if (ad) throw 'already responded with final response!'
    ad = !0
    b = { callbackId: bd, finalResponse: !0, data: a ? new Uint8Array(B.subarray(a, a + b)) : 0 }
    a ? postMessage(b, [b.data.buffer]) : postMessage(b)
  },
  x: function (a, b) {
    if (ad) throw 'already responded with final response!'
    b = { callbackId: bd, finalResponse: !1, data: a ? new Uint8Array(B.subarray(a, a + b)) : 0 }
    a ? postMessage(b, [b.data.buffer]) : postMessage(b)
  },
  O: function (a, b) {
    var c = 0
    Qc().forEach(function (d, e) {
      var f = b + c
      e = E[(a + 4 * e) >> 2] = f
      for (f = 0; f < d.length; ++f) A[e++ >> 0] = d.charCodeAt(f)
      A[e >> 0] = 0
      c += d.length + 1
    })
    return 0
  },
  P: function (a, b) {
    var c = Qc()
    E[a >> 2] = c.length
    var d = 0
    c.forEach(function (e) {
      d += e.length + 1
    })
    E[b >> 2] = d
    return 0
  },
  T: function () {
    return 52
  },
  K: function () {
    return 70
  },
  S: function (a, b, c, d) {
    for (var e = 0, f = 0; f < c; f++) {
      var l = E[b >> 2],
        k = E[(b + 4) >> 2]
      b += 8
      for (var m = 0; m < k; m++) {
        var n = B[l + m],
          p = Sc[a]
        0 === n || 10 === n ? ((1 === a ? fa : w)(Y(p, 0)), (p.length = 0)) : p.push(n)
      }
      e += k
    }
    E[d >> 2] = e
    return 0
  },
  M: function (a, b) {
    Uc(B.subarray(a, a + b))
    return 0
  },
  N: function (a, b, c, d) {
    return Yc(a, b, c, d)
  }
}
;(function () {
  function a(c) {
    c = c.exports
    g.asm = c
    ia = g.asm.ba
    na()
    oa = g.asm.ja
    qa.unshift(g.asm.ca)
    G--
    g.monitorRunDependencies && g.monitorRunDependencies(G)
    if (0 == G && (null !== va && (clearInterval(va), (va = null)), wa)) {
      var d = wa
      wa = null
      d()
    }
    return c
  }
  var b = { a: cd }
  G++
  g.monitorRunDependencies && g.monitorRunDependencies(G)
  if (g.instantiateWasm)
    try {
      return g.instantiateWasm(b, a)
    } catch (c) {
      return w('Module.instantiateWasm callback failed with error: ' + c), !1
    }
  Ca(b, function (c) {
    a(c.instance)
  })
  return {}
})()
function Yb() {
  return (Yb = g.asm.da).apply(null, arguments)
}
function V() {
  return (V = g.asm.ea).apply(null, arguments)
}
var dd = (g._main = function () {
  return (dd = g._main = g.asm.fa).apply(null, arguments)
})
g._pushData = function () {
  return (g._pushData = g.asm.ga).apply(null, arguments)
}
var qb = (g.___getTypeName = function () {
  return (qb = g.___getTypeName = g.asm.ha).apply(null, arguments)
})
g.__embind_initialize_bindings = function () {
  return (g.__embind_initialize_bindings = g.asm.ia).apply(null, arguments)
}
function ed() {
  return (ed = g.asm.ka).apply(null, arguments)
}
g.dynCall_viijj = function () {
  return (g.dynCall_viijj = g.asm.la).apply(null, arguments)
}
g.dynCall_jiji = function () {
  return (g.dynCall_jiji = g.asm.ma).apply(null, arguments)
}
g.dynCall_iiiiij = function () {
  return (g.dynCall_iiiiij = g.asm.na).apply(null, arguments)
}
g.dynCall_iiiiijj = function () {
  return (g.dynCall_iiiiijj = g.asm.oa).apply(null, arguments)
}
g.dynCall_iiiiiijj = function () {
  return (g.dynCall_iiiiiijj = g.asm.pa).apply(null, arguments)
}
g.out = fa
var fd
wa = function gd() {
  fd || hd()
  fd || (wa = gd)
}
function jd(a = []) {
  var b = dd
  a.unshift(ca)
  var c = a.length,
    d = ed(4 * (c + 1)),
    e = d >> 2
  a.forEach((l) => {
    var k = D,
      m = e++,
      n = Bb(l) + 1,
      p = ed(n)
    Ab(l, B, p, n)
    k[m] = p
  })
  D[e] = 0
  try {
    var f = b(c, d)
    rc(f)
  } catch (l) {
    oc(l)
  }
}
function hd() {
  var a = ba
  function b() {
    if (!fd && ((fd = !0), (g.calledRun = !0), !y)) {
      ta = !0
      Ea(qa)
      Ea(ra)
      if (g.onRuntimeInitialized) g.onRuntimeInitialized()
      kd && jd(a)
      if (g.postRun)
        for ('function' == typeof g.postRun && (g.postRun = [g.postRun]); g.postRun.length; ) {
          var c = g.postRun.shift()
          sa.unshift(c)
        }
      Ea(sa)
    }
  }
  if (!(0 < G)) {
    if (g.preRun)
      for ('function' == typeof g.preRun && (g.preRun = [g.preRun]); g.preRun.length; ) ua()
    Ea(pa)
    0 < G ||
      (g.setStatus
        ? (g.setStatus('Running...'),
          setTimeout(function () {
            setTimeout(function () {
              g.setStatus('')
            }, 1)
            b()
          }, 1))
        : b())
  }
}
if (g.preInit)
  for ('function' == typeof g.preInit && (g.preInit = [g.preInit]); 0 < g.preInit.length; )
    g.preInit.pop()()
var kd = !0
g.noInitialRun && (kd = !1)
hd()
var ad = !1,
  bd = -1
;(function () {
  function a() {
    if (c && ta) {
      var f = c
      c = null
      f.forEach(function (l) {
        onmessage(l)
      })
    }
  }
  function b() {
    a()
    c && setTimeout(b, 100)
  }
  var c = null,
    d = 0,
    e = 0
  onmessage = (f) => {
    if (ta) {
      a()
      var l = g['_' + f.data.funcName]
      if (!l) throw 'invalid worker function to call: ' + f.data.funcName
      var k = f.data.data
      if (k) {
        k.byteLength || (k = new Uint8Array(k))
        if (!d || e < k.length) d && V(d), (e = k.length), (d = Yb(k.length))
        B.set(k, d)
      }
      ad = !1
      bd = f.data.callbackId
      k ? l(d, k.length) : l(0, 0)
    } else c || ((c = []), setTimeout(b, 100)), c.push(f)
  }
})()
