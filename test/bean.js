const { expect } = require('chai')
const Bean = require('../src/bean')

describe("Bean", () => {
  it('has the apropriate interface', () => {
    expect(typeof Bean.roast).to.eq('function')
    expect(typeof Bean.protected).to.eq('function')
    expect(typeof Bean.public).to.eq('function')
    expect(typeof Bean.wrap).to.eq('function')
  })
  it('creates public protype and properties', () => {
    const A = Bean.roast(
      // constructor
      function A(u) {
        if (u) { this.u = u }
      },
      Bean.public({
        add(n) {
          this.u += n
        }
      }, {
        // properties
        u: 0,
      })
    )
    const a = A(10)
    // initial value
    expect(a.u).to.eq(10, 'a.u init')
    // calling a method (proto)
    a.add(100)
    expect(a.u, 'a.u modified').to.eq(110)
    const aPrototype = Object.getPrototypeOf(a)
    expect(Object.getOwnPropertyNames(aPrototype), 'prototype keys').to.deep.eq(['constructor', 'add'])
    expect(Object.getOwnPropertyDescriptor(aPrototype, 'constructor').writable, 'constructor protected').to.be.false
    expect(Object.getOwnPropertyDescriptor(aPrototype, 'constructor').enumerable, 'constructor not enumerable').to.be.false
    expect(Object.getOwnPropertyDescriptor(aPrototype, 'add').writable, 'method protected').to.be.false
    expect(Object.getOwnPropertyDescriptor(aPrototype, 'add').enumerable, 'method enumerable').to.be.true
    expect(Object.getOwnPropertyNames(a), 'property keys').to.deep.eq(['u'])
    expect(Object.getOwnPropertyDescriptor(a, 'u').writable, 'u public').to.be.true
    expect(Object.getOwnPropertyDescriptor(a, 'u').enumerable, 'u enumerable').to.be.true
  })
  it('creates protected protype and properties', () => {
    const A = Bean.roast(
      // constructor
      function A(u) {
        if (u) { this.u = u }
      },
      Bean.protected({
        add(n) {
          this.u += n
        }
      }, {
        // protected properties
        p: 0,
      }),
      {
        u: 0,
      }
    )
    const a = A(10)
    // initial value
    expect(a.u, 'a.u init').to.eq(10)
    expect(a.p, 'a.p init').to.eq(0)
    a.p = 10
    expect(a.p, 'a.p protected').to.eq(0)
    // calling a method (proto)
    a.add(100)
    expect(a.u, 'a.u modified').to.eq(110)
    const aPrototype = Object.getPrototypeOf(a)
    expect(Object.getOwnPropertyNames(aPrototype), 'prototype keys').to.deep.eq(['constructor', 'add'])
    expect(Object.getOwnPropertyDescriptor(aPrototype, 'constructor', 'constructor protected').writable).to.be.false
    expect(Object.getOwnPropertyDescriptor(aPrototype, 'constructor', 'constructor not enumerable').enumerable).to.be.false
    expect(Object.getOwnPropertyDescriptor(aPrototype, 'add', 'method protected').writable).to.be.false
    expect(Object.getOwnPropertyDescriptor(aPrototype, 'add', 'method enumerable').enumerable).to.be.true
    expect(Object.getOwnPropertyNames(a), 'property keys').to.deep.eq(['u', 'p'])
    expect(Object.getOwnPropertyDescriptor(a, 'u', 'u public').writable).to.be.true
    expect(Object.getOwnPropertyDescriptor(a, 'u', 'u enumerable').enumerable).to.be.true
    expect(Object.getOwnPropertyDescriptor(a, 'p', 'p protected').writable).to.be.false
    expect(Object.getOwnPropertyDescriptor(a, 'p', 'p enumerable').enumerable).to.be.true
  })
  it('overwrites public attributes when mixin', () => {
    const A = Bean.roast(
      // constructor
      function A(u) {
        if (u) { this.u = u }
      },
      Bean.protected({
        add(n) {
          this.u += n
        }
      }, {
        // protected properties
        p: 0,
      }),
      Bean.public({
        mult(n) {
          this.u *= n * 1000
        }
      },{
        u: 0,
      })
    )
    const B = Bean.roast(
      // constructor
      function B() {},
      A,
      Bean.protected({
        add(n) {
          this.u += n + 2000
        }
      }),
      Bean.public({
        mult(n) {
          this.u *= n
        }
      },{
        u: 1,
        p: 10,
      })
    )
    // additional tests on A
    const a = A(10)
    // calling a method (proto)
    a.mult(2)
    expect(a.u, 'a.u modified').to.eq(10 * 2 * 1000)
    const aPrototype = Object.getPrototypeOf(a)
    expect(Object.getOwnPropertyNames(aPrototype), 'prototype keys').to.deep.eq(['constructor', 'mult', 'add'])
    expect(Object.getOwnPropertyDescriptor(aPrototype, 'mult', 'method protected').writable).to.be.false
    expect(Object.getOwnPropertyDescriptor(aPrototype, 'mult', 'method enumerable').enumerable).to.be.true
    // tests on B
    const b = B()
    expect(b.u, 'b.u init by B').to.eq(1)
    // value of p was presevered
    expect(b.p, 'b.p init by A').to.eq(0)
    // descriptor of p was presevered
    expect(Object.getOwnPropertyDescriptor(a, 'p', 'p protected').writable).to.be.false
    // calling a protected method
    b.add(100)
    expect(b.u, 'b.u modified by A.add()').to.eq(100+1)
    // calling a public method
    b.mult(2)
    expect(b.u, 'b.u modified by B.mult()').to.eq((100+1)*2)
    
  })
  it('roasts bean without constructor', () => {
    const D = Bean.roast({
      u: 1,
    })
    const d = D()
    expect(d.u, 'd.u init').to.eq(1)
  })
  it('wraps a private context', () => {
    const { A, C } = Bean.wrap(function(ctx) {
      // components of A
      // constructor
      function A(a0) {
        ctx(this).a0 = a0
      }
      // protected componenent
      const protectedA1 = Bean.protected({
        addA2(a) {
          this.a2 += ctx(this).a0 + a + 80000
        },
      }, {
        a1: 11,
      })
      // protected componenent
      const publicA1 = Bean.public({
        addA3(a) {
          this.a2 += ctx(this).a0 + a + 80000
        },
      }, {
        a3: 13,
      })
      const publicA2 = {
        a2: 12,
      }
      // protected componenent
      const protectedA2 = Bean.protected({
        addA5() {},
      })
      // components of C
      function C(c0) {
        ctx(this).c0 = c0
      }
      const protectedC = Object.create({
        addA2(a) {
          this.a2 += ctx(this).a0 + a + 90000
        },
        addA3(a) {
          this.a2 += ctx(this).a0 + a + 900000
        },
      }, {
        c0: {
          get() {
            return ctx(this).a0 + Math.random()
          },
          enumerable: true,
        }
      })
      return {
        A: Bean.roast(A, protectedA1, publicA1, publicA2, protectedA2),
        C: Bean.roast(C, protectedC)
      }
    })
    const B = Bean.roast(
      function B(adding) {
        // calling mixin constructors
        A.call(this, 1000)
        C.call(this, 2000)
        this.addA2(adding) // calling A.addA2
        this.addA3(1) // calling C.addA2
      },
      // mixing-in A and C
      A, C, {
      a1: 20,
      b1: 20,
      a2: 21,
      a3: 23,
    })

    const b = B(5)
    expect(b.b1).to.not.be.null
  })
  it('wraps context with a seeder', () => {
    const D = Bean.wrap(function(ctx) {
        return Bean.roast(Bean.public({
          getA() {
            return ctx(this).a
          }
        }, {
          u: 1,
        }
      ))
    }, () => {
      return { a: 1 }
    })
    const d = D()
    expect(d.getA(), 'd.getA()').to.eq(1)
  })
})