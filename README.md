# Bean
[![Build Status](https://travis-ci.org/jerp/bean.svg?branch=master)](https://travis-ci.org/jerp/bean)

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
