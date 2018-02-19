const { expect } = require('chai')
const Bean = require('../src/bean')
require('../src/wrap-bean')

describe("Wrapping Bean", () => {
  it('Prime Numbers', () => {
    // index of known primes
    const Prime = Bean.wrap(() => {
      // wrapping this implementation, not exposing it
      // this implementation takes care of optimising caching...
      const PrimeIndex = Bean.roast(
        function PrimeIndex() {
          // initialise with first prime number
          this.set(2, true)
        }, Bean.protected({
          set(prime, seq) {
            this.index[prime] = true
            if (seq) {
              this.sequence.push(prime)
              this.largestSeq = prime
            }
          },
          test(candidate) {
            if (this.index[candidate]) {
              // is a know prime
              return true
            } else if (this.sequence.some(prime => candidate % prime === 0)) {
              // can be divided by a know prime
              return false
            } else {
              // find new prime limited to square root of the candidate
              const treshold = Math.sqrt(candidate)
              while (this.next(treshold)) {
                if (candidate % this.largestSeq === 0) {
                  // can be divided by newly found prime
                  return false
                }
              }
              // no prime can divide this candidate, therefore it is a prime
              this.set(candidate)
              return true
            }
          },
          next(treshold) {
            for (let next = this.largestSeq + 1; next <= treshold; next++) {
              if (this.index[next] ||  this.sequence.every(prime => next % prime !== 0)) {
                this.set(next, true)
                return true // found one
              }
            }
            return false
          },
        }),
        {
          largestSeq: null,
          index: {},
          sequence: [],
        }
      )
      // Private constant
      const primeIndex = PrimeIndex()
      // Exposing this bean
      return Bean.roast(
        // cosmetic construcor - looks nice this the console
        function Prime() {},
        Bean.protected({
          /**
           * test whether a candidate integer is a prime number
           * @param {Integer} candidate 
           */
          test(candidate) {
            return primeIndex.test(candidate)
          },
          /**
           * Retreive a given number of prime numbers
           * @param {Integer} length number of prime number to return
           */
          getList(length) {
            while (primeIndex.sequence.length < length) {
              primeIndex.next(+Infinity)
            }
            return primeIndex.sequence.slice(0, length)
          }
        })
      )
    })
    // protected componenent
    const prime = Prime()
    const primeList = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59,
      61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127,
      131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191,
      193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257,
      263, 269, 271]
    for (let candidate = 2; candidate <= 272; candidate++) {
      const isPrime = primeList.indexOf(candidate) > -1
      expect(prime.test(candidate), `${candidate} is ${isPrime ? '' : 'not'} prime`).to.eq(isPrime)
    }
    expect(prime.getList(1000).slice(-2)).to.deep.eq([7907, 7919])
  })
})