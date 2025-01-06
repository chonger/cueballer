// import React from 'react';
// import { render, screen } from '@testing-library/react';
// import App from './App';
import { createCueScript, parseScript } from './munging';
import { getTestCases } from './test_utils';
import { wrap } from './text_formatting';

describe('check cue IO', () => {
  let testCases = getTestCases("./test_cases/")

  testCases.forEach(t => {
    const parsed = parseScript(t.input)
    parsed.allActors.forEach(a => {
      test(`${t.name} -- ${a}`, () => {
        const cues = createCueScript(parsed, new Set([a]), 3, 45)
        expect(cues).toMatchSnapshot()
      })
    })
  })
})

test('Check Formatting', () => {

  expect(wrap('I like pie', true, 7)).toEqual(
    `
I like
   pie
    `.trim()
  )

  expect(wrap('I like to eat the pizza pie', true, 10)).toEqual(
    `
I like to
   eat the
   pizza
   pie
    `.trim()
  )

  expect(wrap('I like to eat the pizza pie', true, 9)).toEqual(
    `
I like to
   eat
   the
   pizza
   pie
    `.trim()
  )

  expect(wrap('I like pie', true, 4)).toEqual(
    `
I
   like pie
    `.trim()
  )

})
