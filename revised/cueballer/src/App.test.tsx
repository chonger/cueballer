// import React from 'react';
// import { render, screen } from '@testing-library/react';
// import App from './App';
import { createCueScript, parseScript } from './munging';
import { CueballerTestCase, getTestCases } from './test_utils';

describe('check cue IO', () => {
  let testCases = getTestCases("./test_cases/")

  testCases.forEach(t => {
    const parsed = parseScript(t.input)
    console.log(parsed)
    parsed.allActors.forEach(a => {
      test(`${t.name} -- ${a}`, () => {
        const cues = createCueScript(parsed, new Set([a]), 3, 45)
        expect(cues).toMatchSnapshot()
      })
    })
  })
})
