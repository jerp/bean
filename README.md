# Bean
[![Build Status][travis-image]][travis-url]
[![NPM version][npm-image]][npm-url]
[![Coverage Status][coveralls-image]][coveralls-url]

Javascript Object composition, inheritance and private state

Inspired by [Composing Software: An Introduction](https://medium.com/javascript-scene/composing-software-an-introduction-27b72500d6ea) an article on Medium by Eric Elliott

## Basic Usage

`Bean.roast` returns a function that is used as a factory of Javascript objects.
It takes as first parameter an optinal constructor and a series of object that will be composed into the final prototype and descriptors.

    const Bean = require('bean')
    
    const Character = Object.create({
      whoami() {
        return `a bat called ${this.name || '...'}`
      },
    })

    const FlyingThing = Object.create({
      canFly: true,
      fly() {
        return 'flap, flap ...'
      }
    })

    const Duck = Bean.roast(
      function Duck(name) {
        this.name = name
        this.specie = 'bird'
      },
      Character,
      FlyingThing
    )

    const Bat = Bean.roast(
      function Bat(name) {
        this.name = name
        this.specie = 'mammal'
      },
      Character,
      FlyingThing
    )

    const Dog = Bean.roast(
      function Dog(name) {
        this.name = name
        this.specie = 'mammal'
      },
      Character
    )

    const daffyDuck = Duck('Daffy Duck')

In a console:

    daffyDuck
    > Duck { name: 'Daffy Duck', specie: 'bird' }
    daffyDuck.fly()
    > 'flap, flap ...'

## Private State

`Bean.wrap` is a function, enabled by module `wrap-bean`, that wraps a context arround bean creation.

    require('bean/wrap-bean') // enable Bean.wrap function

Check `test/wrap-bean.js` for basice examples

[travis-url]: https://travis-ci.org/jerp/bean
[travis-image]: https://travis-ci.org/jerp/bean.svg?branch=master
[npm-image]: https://img.shields.io/npm/v/jsbean.svg
[npm-url]: https://www.npmjs.com/package/jsbean
[coveralls-url]: https://coveralls.io/github/jerp/bean?branch=master
[coveralls-image]: https://coveralls.io/repos/github/jerp/bean/badge.svg?branch=master