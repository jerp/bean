const { expect } = require('chai')
const Bean = require('../src/bean')
require('../src/wrap-bean')

describe("Wrapping Bean", () => {
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