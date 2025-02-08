var TWASMModule = (() => {
  var _scriptDir =
    typeof document !== 'undefined' && document.currentScript
      ? document.currentScript.src
      : undefined

  return function (TWASMModule = {}) {
    var g
    g || (g = typeof TWASMModule !== 'undefined' ? TWASMModule : {})
    var aa, ba
    g.ready = new Promise(function (a, b) {
      aa = a
      ba = b
    })
    var ca = Object.assign({}, g),
      da = [],
      ea = './this.program',
      fa = (a, b) => {
        throw b
      },
      t = ''
    'undefined' != typeof document && document.currentScript && (t = document.currentScript.src)
    _scriptDir && (t = _scriptDir)
    0 !== t.indexOf('blob:')
      ? (t = t.substr(0, t.replace(/[?#].*/, '').lastIndexOf('/') + 1))
      : (t = '')
    var ha = g.print || console.log.bind(console),
      w = g.printErr || console.warn.bind(console)
    Object.assign(g, ca)
    ca = null
    g.arguments && (da = g.arguments)
    g.thisProgram && (ea = g.thisProgram)
    g.quit && (fa = g.quit)
    var ia
    g.wasmBinary && (ia = g.wasmBinary)
    var noExitRuntime = g.noExitRuntime || !0
    'object' != typeof WebAssembly && x('no native wasm support detected')
    var ja,
      y = !1,
      ka,
      A,
      B,
      C,
      la,
      D,
      F,
      ma,
      na
    function oa() {
      var a = ja.buffer
      g.HEAP8 = A = new Int8Array(a)
      g.HEAP16 = C = new Int16Array(a)
      g.HEAP32 = D = new Int32Array(a)
      g.HEAPU8 = B = new Uint8Array(a)
      g.HEAPU16 = la = new Uint16Array(a)
      g.HEAPU32 = F = new Uint32Array(a)
      g.HEAPF32 = ma = new Float32Array(a)
      g.HEAPF64 = na = new Float64Array(a)
    }
    var pa,
      qa = [],
      ra = [],
      sa = [],
      ta = []
    function ua() {
      var a = g.preRun.shift()
      qa.unshift(a)
    }
    var G = 0,
      va = null,
      wa = null
    function x(a) {
      if (g.onAbort) g.onAbort(a)
      a = 'Aborted(' + a + ')'
      w(a)
      y = !0
      ka = 1
      a = new WebAssembly.RuntimeError(a + '. Build with -sASSERTIONS for more info.')
      ba(a)
      throw a
    }
    function xa(a) {
      return a.startsWith('data:application/octet-stream;base64,')
    }
    var H
    H = 'thing.wasm.wasm'
    if (!xa(H)) {
      var ya = H
      H = g.locateFile ? g.locateFile(ya, t) : t + ya
    }
    function za(a) {
      try {
        if (a == H && ia) return new Uint8Array(ia)
        throw 'both async and sync fetching of the wasm failed'
      } catch (b) {
        x(b)
      }
    }
    function Aa(a) {
      return ia || 'function' != typeof fetch
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
      return ia ||
        'function' != typeof WebAssembly.instantiateStreaming ||
        xa(c) ||
        'function' != typeof fetch
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
          void 0 !== d &&
            (this.stack = this.toString() + '\n' + d.replace(/^Error(:[^\n]*)?\n/, ''))
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
        if (c.mb) return
        Q("Cannot register type '" + d + "' twice")
      }
      L[a] = b
      delete Ha[a]
      K.hasOwnProperty(a) && ((b = K[a]), delete K[a], b.forEach((e) => e()))
    }
    function Qa(a) {
      Q(a.na.qa.oa.name + ' instance already deleted')
    }
    var Ra = !1
    function Sa() {}
    function Ta(a) {
      --a.count.value
      0 === a.count.value && (a.sa ? a.va.ua(a.sa) : a.qa.oa.ua(a.pa))
    }
    function Ua(a, b, c) {
      if (b === c) return a
      if (void 0 === c.wa) return null
      a = Ua(a, b, c.wa)
      return null === a ? null : c.hb(a)
    }
    var Va = {},
      Wa = []
    function Xa() {
      for (; Wa.length; ) {
        var a = Wa.pop()
        a.na.Da = !1
        a['delete']()
      }
    }
    var Ya = void 0,
      Za = {}
    function $a(a, b) {
      for (void 0 === b && Q('ptr should not be undefined'); a.wa; ) (b = a.Ha(b)), (a = a.wa)
      return Za[b]
    }
    function ab(a, b) {
      ;(b.qa && b.pa) || Ma('makeClassHandle requires ptr and ptrType')
      !!b.va !== !!b.sa && Ma('Both smartPtrType and smartPtr must be specified')
      b.count = { value: 1 }
      return bb(Object.create(a, { na: { value: b } }))
    }
    function bb(a) {
      if ('undefined' === typeof FinalizationRegistry) return (bb = (b) => b), a
      Ra = new FinalizationRegistry((b) => {
        Ta(b.na)
      })
      bb = (b) => {
        var c = b.na
        c.sa && Ra.register(b, { na: c }, b)
        return b
      }
      Sa = (b) => {
        Ra.unregister(b)
      }
      return bb(a)
    }
    function R() {}
    function cb(a, b, c) {
      if (void 0 === a[b].ra) {
        var d = a[b]
        a[b] = function () {
          a[b].ra.hasOwnProperty(arguments.length) ||
            Q(
              "Function '" +
                c +
                "' called with an invalid number of arguments (" +
                arguments.length +
                ') - expects one of (' +
                a[b].ra +
                ')!'
            )
          return a[b].ra[arguments.length].apply(this, arguments)
        }
        a[b].ra = []
        a[b].ra[d.Ca] = d
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
          (g[a].ra[void 0] = b))
        : (g[a] = b)
    }
    function eb(a, b, c, d, e, f, l, k) {
      this.name = a
      this.constructor = b
      this.Ea = c
      this.ua = d
      this.wa = e
      this.jb = f
      this.Ha = l
      this.hb = k
      this.pb = []
    }
    function fb(a, b, c) {
      for (; b !== c; )
        b.Ha || Q('Expected null or instance of ' + c.name + ', got an instance of ' + b.name),
          (a = b.Ha(a)),
          (b = b.wa)
      return a
    }
    function gb(a, b) {
      if (null === b) return this.Sa && Q('null is not a valid ' + this.name), 0
      b.na || Q('Cannot pass "' + hb(b) + '" as a ' + this.name)
      b.na.pa || Q('Cannot pass deleted object as a pointer of type ' + this.name)
      return fb(b.na.pa, b.na.qa.oa, this.oa)
    }
    function ib(a, b) {
      if (null === b) {
        this.Sa && Q('null is not a valid ' + this.name)
        if (this.Ka) {
          var c = this.Ga()
          null !== a && a.push(this.ua, c)
          return c
        }
        return 0
      }
      b.na || Q('Cannot pass "' + hb(b) + '" as a ' + this.name)
      b.na.pa || Q('Cannot pass deleted object as a pointer of type ' + this.name)
      !this.Ja &&
        b.na.qa.Ja &&
        Q(
          'Cannot convert argument of type ' +
            (b.na.va ? b.na.va.name : b.na.qa.name) +
            ' to parameter type ' +
            this.name
        )
      c = fb(b.na.pa, b.na.qa.oa, this.oa)
      if (this.Ka)
        switch (
          (void 0 === b.na.sa && Q('Passing raw pointer to smart pointer is illegal'), this.ub)
        ) {
          case 0:
            b.na.va === this
              ? (c = b.na.sa)
              : Q(
                  'Cannot convert argument of type ' +
                    (b.na.va ? b.na.va.name : b.na.qa.name) +
                    ' to parameter type ' +
                    this.name
                )
            break
          case 1:
            c = b.na.sa
            break
          case 2:
            if (b.na.va === this) c = b.na.sa
            else {
              var d = b.clone()
              c = this.tb(
                c,
                S(function () {
                  d['delete']()
                })
              )
              null !== a && a.push(this.ua, c)
            }
            break
          default:
            Q('Unsupporting sharing policy')
        }
      return c
    }
    function jb(a, b) {
      if (null === b) return this.Sa && Q('null is not a valid ' + this.name), 0
      b.na || Q('Cannot pass "' + hb(b) + '" as a ' + this.name)
      b.na.pa || Q('Cannot pass deleted object as a pointer of type ' + this.name)
      b.na.qa.Ja &&
        Q('Cannot convert argument of type ' + b.na.qa.name + ' to parameter type ' + this.name)
      return fb(b.na.pa, b.na.qa.oa, this.oa)
    }
    function T(a, b, c, d) {
      this.name = a
      this.oa = b
      this.Sa = c
      this.Ja = d
      this.Ka = !1
      this.ua = this.tb = this.Ga = this.eb = this.ub = this.ob = void 0
      void 0 !== b.wa ? (this.toWireType = ib) : ((this.toWireType = d ? gb : jb), (this.ta = null))
    }
    function kb(a, b) {
      g.hasOwnProperty(a) || Ma('Replacing nonexistant public symbol')
      g[a] = b
      g[a].Ca = void 0
    }
    var lb = []
    function mb(a) {
      var b = lb[a]
      b || (a >= lb.length && (lb.length = a + 1), (lb[a] = b = pa.get(a)))
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
        if (null !== b[c] && void 0 === b[c].ta) {
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
            null !== b[c].ta &&
              ((a += f + '_dtor(' + f + '); // ' + b[c].name + '\n'),
              p.push(f + '_dtor'),
              d.push(b[c].ta))
      n && (a += 'var ret = retType.fromWireType(rv);\nreturn ret;\n')
      p.push(a + '}\n')
      return sb(p).apply(null, d)
    }
    function ub(a, b) {
      for (var c = [], d = 0; d < a; d++) c.push(F[(b + 4 * d) >> 2])
      return c
    }
    var W = new (function () {
      this.ya = [void 0]
      this.bb = []
      this.get = function (a) {
        return this.ya[a]
      }
      this.qb = function (a) {
        let b = this.bb.pop() || this.ya.length
        this.ya[b] = a
        return b
      }
      this.sb = function (a) {
        this.ya[a] = void 0
        this.bb.push(a)
      }
    })()
    function vb(a) {
      a >= W.cb && 0 === --W.get(a).fb && W.sb(a)
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
            return W.qb({ fb: 1, value: a })
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
            return this.fromWireType((c ? C : la)[d >> 1])
          }
        case 2:
          return function (d) {
            return this.fromWireType((c ? D : F)[d >> 2])
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
            return this.fromWireType(ma[c >> 2])
          }
        case 3:
          return function (c) {
            return this.fromWireType(na[c >> 3])
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
                return la[d >> 1]
              }
        case 2:
          return c
            ? function (d) {
                return D[d >> 2]
              }
            : function (d) {
                return F[d >> 2]
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
        127 >= d
          ? b++
          : 2047 >= d
            ? (b += 2)
            : 55296 <= d && 57343 >= d
              ? ((b += 4), ++c)
              : (b += 3)
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
      for (var d = c + b / 2; !(c >= d) && la[c]; ) ++c
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
      for (var c = Array(a), d = 0; d < a; ++d) c[d] = xb(F[(b + 4 * d) >> 2], 'parameter ' + d)
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
      )(xb, g, S, () => F)
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
              postMessage('setimmediate', '*')
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
            d.Oa(d.Na)
            if (kc) {
              var e = kc,
                f = 0 == e % 1 ? e - 1 : Math.floor(e)
              kc = d.Bb ? f : (8 * e + (f + 0.5)) / 9
            }
            ha('main loop blocker "' + d.name + '" took ' + (Date.now() - c) + ' ms')
            g.setStatus &&
              ((c = g.statusMessage || 'Please wait...'),
              (d = kc),
              (e = lc.Db),
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
                    (pc(a), g.postMainLoop && g.postMainLoop()),
                  b < ic ||
                    ('object' == typeof SDL && SDL.audio && SDL.audio.rb && SDL.audio.rb(), Z())))
      }
    }
    function qc(a) {
      a instanceof Da || 'unwind' == a || fa(1, a)
    }
    function rc(a) {
      ka = ka = a
      if (!noExitRuntime) {
        if (g.onExit) g.onExit(a)
        y = !0
      }
      fa(a, new Da(a))
    }
    function pc(a) {
      if (!y)
        try {
          if ((a(), !noExitRuntime))
            try {
              rc(ka)
            } catch (b) {
              qc(b)
            }
        } catch (b) {
          qc(b)
        }
    }
    function sc(a) {
      setTimeout(function () {
        pc(a)
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
        g.ab ||
          'undefined' != typeof Dc ||
          (w(
            'warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.'
          ),
          (g.ab = !0))
        g.preloadPlugins.push({
          canHandle: function (c) {
            return !g.ab && /\.(jpg|jpeg|png|bmp)$/i.test(c)
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
              ha('Image ' + k + ' could not be decoded')
              f && f()
            }
            m.src = k
          }
        })
        g.preloadPlugins.push({
          canHandle: function (c) {
            return !g.Gb && c.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 }
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
      if (b && g.Ya && a == g.canvas) return g.Ya
      var e
      if (b) {
        var f = { antialias: !1, alpha: !1, Eb: 1 }
        if (d) for (var l in d) f[l] = d[l]
        if ('undefined' != typeof GL && (e = GL.Cb(a, f))) var k = GL.getContext(e).Ab
      } else k = a.getContext('2d')
      if (!k) return null
      c &&
        (b ||
          'undefined' == typeof GLctx ||
          x(
            'cannot set in module if GLctx is used, but we are a non-GL context that would replace it'
          ),
        (g.Ya = k),
        b && GL.Fb(e),
        (g.Ib = b),
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
              ? ('undefined' != typeof SDL && (D[SDL.screen >> 2] = F[SDL.screen >> 2] | 8388608),
                Lc(g.canvas),
                Mc())
              : Lc(d))
          : (f.parentNode.insertBefore(d, f),
            f.parentNode.removeChild(f),
            Ic
              ? ('undefined' != typeof SDL && (D[SDL.screen >> 2] = F[SDL.screen >> 2] & -8388609),
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
      b && c ? ((a.zb = b), (a.lb = c)) : ((b = a.zb), (c = a.lb))
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
            _: ea || './this.program'
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
        var q = h.Aa
        for (h = new Date(new Date(h.Ba + 1900, 0, 1).getTime()); 0 < q; ) {
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
        xb: D[d >> 2],
        wb: D[(d + 4) >> 2],
        La: D[(d + 8) >> 2],
        Wa: D[(d + 12) >> 2],
        Ma: D[(d + 16) >> 2],
        Ba: D[(d + 20) >> 2],
        xa: D[(d + 24) >> 2],
        Aa: D[(d + 28) >> 2],
        Hb: D[(d + 32) >> 2],
        vb: D[(d + 36) >> 2],
        yb: n ? (n ? Y(B, n) : '') : ''
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
          return r[h.xa].substring(0, 3)
        },
        '%A': function (h) {
          return r[h.xa]
        },
        '%b': function (h) {
          return v[h.Ma].substring(0, 3)
        },
        '%B': function (h) {
          return v[h.Ma]
        },
        '%C': function (h) {
          return f(((h.Ba + 1900) / 100) | 0, 2)
        },
        '%d': function (h) {
          return f(h.Wa, 2)
        },
        '%e': function (h) {
          return e(h.Wa, 2, ' ')
        },
        '%g': function (h) {
          return m(h).toString().substring(2)
        },
        '%G': function (h) {
          return m(h)
        },
        '%H': function (h) {
          return f(h.La, 2)
        },
        '%I': function (h) {
          h = h.La
          0 == h ? (h = 12) : 12 < h && (h -= 12)
          return f(h, 2)
        },
        '%j': function (h) {
          for (var q = 0, u = 0; u <= h.Ma - 1; q += (Tb(h.Ba + 1900) ? Vc : Wc)[u++]);
          return f(h.Wa + q, 3)
        },
        '%m': function (h) {
          return f(h.Ma + 1, 2)
        },
        '%M': function (h) {
          return f(h.wb, 2)
        },
        '%n': function () {
          return '\n'
        },
        '%p': function (h) {
          return 0 <= h.La && 12 > h.La ? 'AM' : 'PM'
        },
        '%S': function (h) {
          return f(h.xb, 2)
        },
        '%t': function () {
          return '\t'
        },
        '%u': function (h) {
          return h.xa || 7
        },
        '%U': function (h) {
          return f(Math.floor((h.Aa + 7 - h.xa) / 7), 2)
        },
        '%V': function (h) {
          var q = Math.floor((h.Aa + 7 - ((h.xa + 6) % 7)) / 7)
          2 >= (h.xa + 371 - h.Aa - 2) % 7 && q++
          if (q)
            53 == q && ((u = (h.xa + 371 - h.Aa) % 7), 4 == u || (3 == u && Tb(h.Ba)) || (q = 1))
          else {
            q = 52
            var u = (h.xa + 7 - h.Aa - 1) % 7
            ;(4 == u || (5 == u && Tb((h.Ba % 400) - 1))) && q++
          }
          return f(q, 2)
        },
        '%w': function (h) {
          return h.xa
        },
        '%W': function (h) {
          return f(Math.floor((h.Aa + 7 - ((h.xa + 6) % 7)) / 7), 2)
        },
        '%y': function (h) {
          return (h.Ba + 1900).toString().substring(2)
        },
        '%Y': function (h) {
          return h.Ba + 1900
        },
        '%z': function (h) {
          h = h.vb
          var q = 0 <= h
          h = Math.abs(h) / 60
          return (q ? '+' : '-') + String('0000' + ((h / 60) * 100 + (h % 60))).slice(-4)
        },
        '%Z': function (h) {
          return h.yb
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
      var b = this.na.qa.oa,
        c = this.na.pa,
        d = a.na.qa.oa
      for (a = a.na.pa; b.wa; ) (c = b.Ha(c)), (b = b.wa)
      for (; d.wa; ) (a = d.Ha(a)), (d = d.wa)
      return b === d && c === a
    }
    R.prototype.clone = function () {
      this.na.pa || Qa(this)
      if (this.na.Fa) return (this.na.count.value += 1), this
      var a = bb,
        b = Object,
        c = b.create,
        d = Object.getPrototypeOf(this),
        e = this.na
      a = a(
        c.call(b, d, {
          na: {
            value: { count: e.count, Da: e.Da, Fa: e.Fa, pa: e.pa, qa: e.qa, sa: e.sa, va: e.va }
          }
        })
      )
      a.na.count.value += 1
      a.na.Da = !1
      return a
    }
    R.prototype['delete'] = function () {
      this.na.pa || Qa(this)
      this.na.Da && !this.na.Fa && Q('Object already scheduled for deletion')
      Sa(this)
      Ta(this.na)
      this.na.Fa || ((this.na.sa = void 0), (this.na.pa = void 0))
    }
    R.prototype.isDeleted = function () {
      return !this.na.pa
    }
    R.prototype.deleteLater = function () {
      this.na.pa || Qa(this)
      this.na.Da && !this.na.Fa && Q('Object already scheduled for deletion')
      Wa.push(this)
      1 === Wa.length && Ya && Ya(Xa)
      this.na.Da = !0
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
    T.prototype.kb = function (a) {
      this.eb && (a = this.eb(a))
      return a
    }
    T.prototype.Za = function (a) {
      this.ua && this.ua(a)
    }
    T.prototype.argPackAdvance = 8
    T.prototype.readValueFromPointer = I
    T.prototype.deleteObject = function (a) {
      if (null !== a) a['delete']()
    }
    T.prototype.fromWireType = function (a) {
      function b() {
        return this.Ka
          ? ab(this.oa.Ea, { qa: this.ob, pa: c, va: this, sa: a })
          : ab(this.oa.Ea, { qa: this, pa: a })
      }
      var c = this.kb(a)
      if (!c) return this.Za(a), null
      var d = $a(this.oa, c)
      if (void 0 !== d) {
        if (0 === d.na.count.value) return (d.na.pa = c), (d.na.sa = a), d.clone()
        d = d.clone()
        this.Za(a)
        return d
      }
      d = this.oa.jb(c)
      d = Va[d]
      if (!d) return b.call(this)
      d = this.Ja ? d.gb : d.pointerType
      var e = Ua(c, this.oa, d.oa)
      return null === e
        ? b.call(this)
        : this.Ka
          ? ab(d.oa.Ea, { qa: d, pa: e, va: this, sa: a })
          : ab(d.oa.Ea, { qa: d, pa: e })
    }
    ob = g.UnboundTypeError = Ka('UnboundTypeError')
    W.ya.push({ value: void 0 }, { value: null }, { value: !0 }, { value: !1 })
    W.cb = W.ya.length
    g.count_emval_handles = function () {
      for (var a = 0, b = W.cb; b < W.ya.length; ++b) void 0 !== W.ya[b] && ++a
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
      window.getUserMedia ||
        (window.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia)
      window.getUserMedia(void 0)
    }
    g.createContext = function (a, b, c, d) {
      return Fc(a, b, c, d)
    }
    var ad = {
      v: function (a) {
        var b = Fa[a]
        delete Fa[a]
        var c = b.elements,
          d = c.length,
          e = c
            .map(function (k) {
              return k.Ra
            })
            .concat(
              c.map(function (k) {
                return k.Ua
              })
            ),
          f = b.Ga,
          l = b.ua
        M([a], e, function (k) {
          c.forEach((m, n) => {
            var p = k[n],
              r = m.Pa,
              v = m.Qa,
              h = k[n + d],
              q = m.Ta,
              u = m.Va
            m.read = (z) => p.fromWireType(r(v, z))
            m.write = (z, J) => {
              var E = []
              q(u, z, h.toWireType(E, J))
              Ga(E)
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
              ta: l
            }
          ]
        })
      },
      C: function (a) {
        var b = Na[a]
        delete Na[a]
        var c = b.Ga,
          d = b.ua,
          e = b.$a,
          f = e.map((l) => l.Ra).concat(e.map((l) => l.Ua))
        M([a], f, (l) => {
          var k = {}
          e.forEach((m, n) => {
            var p = l[n],
              r = m.Pa,
              v = m.Qa,
              h = l[n + e.length],
              q = m.Ta,
              u = m.Va
            k[m.ib] = {
              read: (z) => p.fromWireType(r(v, z)),
              write: (z, J) => {
                var E = []
                q(u, z, h.toWireType(E, J))
                Ga(E)
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
              ta: d
            }
          ]
        })
      },
      J: function () {},
      W: function (a, b, c, d, e) {
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
          ta: null
        })
      },
      z: function (a, b, c, d, e, f, l, k, m, n, p, r, v) {
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
            var u = q.oa
            var z = u.Ea
          } else z = R.prototype
          q = Ja(h, function () {
            if (Object.getPrototypeOf(this) !== J) throw new P("Use 'new' to construct " + p)
            if (void 0 === E.za) throw new P(p + ' has no accessible constructor')
            var nc = E.za[arguments.length]
            if (void 0 === nc)
              throw new P(
                'Tried to invoke ctor of ' +
                  p +
                  ' with invalid number of parameters (' +
                  arguments.length +
                  ') - expected (' +
                  Object.keys(E.za).toString() +
                  ') parameters instead!'
              )
            return nc.apply(this, arguments)
          })
          var J = Object.create(z, { constructor: { value: q } })
          q.prototype = J
          var E = new eb(p, q, J, v, u, f, k, n)
          u = new T(p, E, !0, !1)
          z = new T(p + '*', E, !1, !1)
          var oc = new T(p + ' const*', E, !1, !0)
          Va[a] = { pointerType: z, gb: oc }
          kb(h, q)
          return [u, z, oc]
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
          var v = n.oa.constructor
          void 0 === v[b] ? ((p.Ca = c - 1), (v[b] = p)) : (cb(v, b, r), (v[b].ra[c - 1] = p))
          M([], m, function (h) {
            h = tb(r, [h[0], null].concat(h.slice(1)), null, f, l, k)
            void 0 === v[b].ra ? ((h.Ca = c - 1), (v[b] = h)) : (v[b].ra[c - 1] = h)
            return []
          })
          return []
        })
      },
      B: function (a, b, c, d, e, f) {
        0 < b || x()
        var l = ub(b, c)
        e = U(d, e)
        M([], [a], function (k) {
          k = k[0]
          var m = 'constructor ' + k.name
          void 0 === k.oa.za && (k.oa.za = [])
          if (void 0 !== k.oa.za[b - 1])
            throw new P(
              'Cannot register multiple constructors with identical number of parameters (' +
                (b - 1) +
                ") for class '" +
                k.name +
                "'! Overload resolution is currently only performed using the parameter count, not actual type info!"
            )
          k.oa.za[b - 1] = () => {
            rb('Cannot construct ' + k.name + ' due to unbound types', l)
          }
          M([], l, function (n) {
            n.splice(1, 0, null)
            k.oa.za[b - 1] = tb(m, n, null, e, f)
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
          k && p.oa.pb.push(b)
          var h = p.oa.Ea,
            q = h[b]
          void 0 === q || (void 0 === q.ra && q.className !== p.name && q.Ca === c - 2)
            ? ((r.Ca = c - 2), (r.className = p.name), (h[b] = r))
            : (cb(h, b, v), (h[b].ra[c - 2] = r))
          M([], n, function (u) {
            u = tb(v, u, p, f, l, m)
            void 0 === h[b].ra ? ((u.Ca = c - 2), (h[b] = u)) : (h[b].ra[c - 2] = u)
            return []
          })
          return []
        })
      },
      V: function (a, b) {
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
          ta: null
        })
      },
      H: function (a, b, c, d) {
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
          ta: null
        })
        db(b, e)
      },
      y: function (a, b, c) {
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
      F: function (a, b, c) {
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
          ta: null
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
          ta: null
        })
      },
      k: function (a, b, c) {
        function d(f) {
          f >>= 2
          var l = F
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
        N(a, { name: c, fromWireType: d, argPackAdvance: 8, readValueFromPointer: d }, { mb: !0 })
      },
      G: function (a, b) {
        b = O(b)
        var c = 'std::string' === b
        N(a, {
          name: b,
          fromWireType: function (d) {
            var e = F[d >> 2],
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
            F[k >> 2] = l
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
          ta: function (d) {
            V(d)
          }
        })
      },
      A: function (a, b, c) {
        c = O(c)
        if (2 === b) {
          var d = Eb
          var e = Fb
          var f = Gb
          var l = () => la
          var k = 1
        } else 4 === b && ((d = Hb), (e = Ib), (f = Jb), (l = () => F), (k = 2))
        N(a, {
          name: c,
          fromWireType: function (m) {
            for (var n = F[m >> 2], p = l(), r, v = m + 4, h = 0; h <= n; ++h) {
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
            F[r >> 2] = p >> k
            e(n, r + 4, p + b)
            null !== m && m.push(V, r)
            return r
          },
          argPackAdvance: 8,
          readValueFromPointer: I,
          ta: function (m) {
            V(m)
          }
        })
      },
      w: function (a, b, c, d, e, f) {
        Fa[a] = { name: O(b), Ga: U(c, d), ua: U(e, f), elements: [] }
      },
      f: function (a, b, c, d, e, f, l, k, m) {
        Fa[a].elements.push({ Ra: b, Pa: U(c, d), Qa: e, Ua: f, Ta: U(l, k), Va: m })
      },
      D: function (a, b, c, d, e, f) {
        Na[a] = { name: O(b), Ga: U(c, d), ua: U(e, f), $a: [] }
      },
      u: function (a, b, c, d, e, f, l, k, m, n) {
        Na[a].$a.push({ ib: O(b), Ra: c, Pa: U(d, e), Qa: f, Ua: l, Ta: U(k, m), Va: n })
      },
      X: function (a, b) {
        b = O(b)
        N(a, {
          nb: !0,
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
        F[c >> 2] = e
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
      x: function (a, b, c, d, e) {
        a = Nb[a]
        b = X(b)
        c = Mb(c)
        var f = []
        F[d >> 2] = S(f)
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
        var m =
            'return function ' + Ia('methodCaller_' + b) + '(handle, name, destructors, args) {\n',
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
        d.nb || (m += '    return retType.toWireType(destructors, rv);\n')
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
        4 < a && (W.get(a).fb += 1)
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
      S: function (a, b) {
        a = new Date(1e3 * (F[a >> 2] + 4294967296 * D[(a + 4) >> 2]))
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
      T: function (a) {
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
      P: function (a, b, c) {
        function d(m) {
          return (m = m.toTimeString().match(/\(([A-Za-z ]+)\)$/)) ? m[1] : 'GMT'
        }
        var e = new Date().getFullYear(),
          f = new Date(e, 0, 1),
          l = new Date(e, 6, 1)
        e = f.getTimezoneOffset()
        var k = l.getTimezoneOffset()
        F[a >> 2] = 60 * Math.max(e, k)
        D[b >> 2] = Number(e != k)
        a = d(f)
        b = d(l)
        a = Xb(a)
        b = Xb(b)
        k < e ? ((F[c >> 2] = a), (F[(c + 4) >> 2] = b)) : ((F[c >> 2] = b), (F[(c + 4) >> 2] = a))
      },
      b: function () {
        x('')
      },
      Y: function (a, b, c, d, e, f) {
        b = b ? Y(B, b) : ''
        a = yc[a]
        var l = -1
        e && ((l = a.Ia.length), a.Ia.push({ Oa: mb(e), Na: f }), a.Xa++)
        b = { funcName: b, callbackId: l, data: c ? new Uint8Array(B.subarray(c, c + d)) : 0 }
        c ? a.worker.postMessage(b, [b.data.buffer]) : a.worker.postMessage(b)
      },
      _: function (a) {
        a = a ? Y(B, a) : ''
        var b = yc.length
        a = { worker: new Worker(a), Ia: [], Xa: 0, buffer: 0, bufferSize: 0 }
        a.worker.onmessage = function (c) {
          if (!y) {
            var d = yc[b]
            if (d) {
              var e = c.data.callbackId,
                f = d.Ia[e]
              if (f)
                if ((c.data.finalResponse && (d.Xa--, (d.Ia[e] = null)), (c = c.data.data))) {
                  c.byteLength || (c = new Uint8Array(c))
                  if (!d.buffer || d.bufferSize < c.length)
                    d.buffer && V(d.buffer), (d.bufferSize = c.length), (d.buffer = Yb(c.length))
                  B.set(c, d.buffer)
                  f.Oa(d.buffer, c.length, f.Na)
                } else f.Oa(0, 0, f.Na)
            }
          }
        }
        yc.push(a)
        return b
      },
      E: function () {
        return Date.now()
      },
      Z: function (a) {
        var b = yc[a]
        b.worker.terminate()
        b.buffer && V(b.buffer)
        yc[a] = null
      },
      U: function (a, b, c) {
        B.copyWithin(a, b, b + c)
      },
      O: function (a) {
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
            var l = ja.buffer
            try {
              ja.grow((f.call(e, 2147483648, d) - l.byteLength + 65535) >>> 16)
              oa()
              var k = 1
              break a
            } catch (m) {}
            k = void 0
          }
          if (k) return !0
        }
        return !1
      },
      M: function (a, b) {
        var c = 0
        Qc().forEach(function (d, e) {
          var f = b + c
          e = F[(a + 4 * e) >> 2] = f
          for (f = 0; f < d.length; ++f) A[e++ >> 0] = d.charCodeAt(f)
          A[e >> 0] = 0
          c += d.length + 1
        })
        return 0
      },
      N: function (a, b) {
        var c = Qc()
        F[a >> 2] = c.length
        var d = 0
        c.forEach(function (e) {
          d += e.length + 1
        })
        F[b >> 2] = d
        return 0
      },
      R: function () {
        return 52
      },
      I: function () {
        return 70
      },
      Q: function (a, b, c, d) {
        for (var e = 0, f = 0; f < c; f++) {
          var l = F[b >> 2],
            k = F[(b + 4) >> 2]
          b += 8
          for (var m = 0; m < k; m++) {
            var n = B[l + m],
              p = Sc[a]
            0 === n || 10 === n ? ((1 === a ? ha : w)(Y(p, 0)), (p.length = 0)) : p.push(n)
          }
          e += k
        }
        F[d >> 2] = e
        return 0
      },
      K: function (a, b) {
        Uc(B.subarray(a, a + b))
        return 0
      },
      L: function (a, b, c, d) {
        return Yc(a, b, c, d)
      }
    }
    ;(function () {
      function a(c) {
        c = c.exports
        g.asm = c
        ja = g.asm.$
        oa()
        pa = g.asm.ga
        ra.unshift(g.asm.aa)
        G--
        g.monitorRunDependencies && g.monitorRunDependencies(G)
        if (0 == G && (null !== va && (clearInterval(va), (va = null)), wa)) {
          var d = wa
          wa = null
          d()
        }
        return c
      }
      var b = { a: ad }
      G++
      g.monitorRunDependencies && g.monitorRunDependencies(G)
      if (g.instantiateWasm)
        try {
          return g.instantiateWasm(b, a)
        } catch (c) {
          w('Module.instantiateWasm callback failed with error: ' + c), ba(c)
        }
      Ca(b, function (c) {
        a(c.instance)
      }).catch(ba)
      return {}
    })()
    var Yb = (g._malloc = function () {
        return (Yb = g._malloc = g.asm.ba).apply(null, arguments)
      }),
      V = (g._free = function () {
        return (V = g._free = g.asm.ca).apply(null, arguments)
      }),
      bd = (g._main = function () {
        return (bd = g._main = g.asm.da).apply(null, arguments)
      }),
      qb = (g.___getTypeName = function () {
        return (qb = g.___getTypeName = g.asm.ea).apply(null, arguments)
      })
    g.__embind_initialize_bindings = function () {
      return (g.__embind_initialize_bindings = g.asm.fa).apply(null, arguments)
    }
    function cd() {
      return (cd = g.asm.ha).apply(null, arguments)
    }
    g.dynCall_viijj = function () {
      return (g.dynCall_viijj = g.asm.ia).apply(null, arguments)
    }
    g.dynCall_jiji = function () {
      return (g.dynCall_jiji = g.asm.ja).apply(null, arguments)
    }
    g.dynCall_iiiiij = function () {
      return (g.dynCall_iiiiij = g.asm.ka).apply(null, arguments)
    }
    g.dynCall_iiiiijj = function () {
      return (g.dynCall_iiiiijj = g.asm.la).apply(null, arguments)
    }
    g.dynCall_iiiiiijj = function () {
      return (g.dynCall_iiiiiijj = g.asm.ma).apply(null, arguments)
    }
    g.out = ha
    var dd
    wa = function ed() {
      dd || fd()
      dd || (wa = ed)
    }
    function gd(a = []) {
      var b = bd
      a.unshift(ea)
      var c = a.length,
        d = cd(4 * (c + 1)),
        e = d >> 2
      a.forEach((l) => {
        var k = D,
          m = e++,
          n = Bb(l) + 1,
          p = cd(n)
        Ab(l, B, p, n)
        k[m] = p
      })
      D[e] = 0
      try {
        var f = b(c, d)
        rc(f)
      } catch (l) {
        qc(l)
      }
    }
    function fd() {
      var a = da
      function b() {
        if (!dd && ((dd = !0), (g.calledRun = !0), !y)) {
          Ea(ra)
          Ea(sa)
          aa(g)
          if (g.onRuntimeInitialized) g.onRuntimeInitialized()
          hd && gd(a)
          if (g.postRun)
            for ('function' == typeof g.postRun && (g.postRun = [g.postRun]); g.postRun.length; ) {
              var c = g.postRun.shift()
              ta.unshift(c)
            }
          Ea(ta)
        }
      }
      if (!(0 < G)) {
        if (g.preRun)
          for ('function' == typeof g.preRun && (g.preRun = [g.preRun]); g.preRun.length; ) ua()
        Ea(qa)
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
    var hd = !0
    g.noInitialRun && (hd = !1)
    fd()

    return TWASMModule.ready
  }
})()
if (typeof exports === 'object' && typeof module === 'object') module.exports = TWASMModule
else if (typeof define === 'function' && define['amd'])
  define([], function () {
    return TWASMModule
  })
else if (typeof exports === 'object') exports['TWASMModule'] = TWASMModule
