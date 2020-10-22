import * as babel from '@babel/core'
// import * as babelPlugin from '../../src/babel'

// eslint-disable-next-line
const babelPlugin = require('../../src/babel')


test('no extra import', () => {
  const source = `
  import { observable, reaction, autorun, when } from "mobx";
  `
  const result = `
  import { observable, reaction, autorun, when } from "@firefox-pro-coding/react-composition-api";
  `
  const output = babel.transform(
    source.replace(/\n\s+/g, '\n'),
    { plugins: [babelPlugin] },
  )!

  expect(output).toBeTruthy()
  expect(output.code).toBeTruthy()
  expect(output.code!.trim()).toBe(result.replace(/\n\s+/g, '\n').trim())
})


test('extra import', () => {
  const source = `
  import { observable, reaction, autorun, when, isObservable } from "mobx";
  `
  const result = `
  import { isObservable } from "mobx";
  import { observable, reaction, autorun, when } from "@firefox-pro-coding/react-composition-api";
  `
  const output = babel.transform(
    source.replace(/\n\s+/g, '\n'),
    { plugins: [babelPlugin] },
  )!

  expect(output).toBeTruthy()
  expect(output.code).toBeTruthy()
  expect(output.code!.trim()).toBe(result.replace(/\n\s+/g, '\n').trim())
})


test('no extra import multi lines', () => {
  const source = `
  import { observable, reaction } from "mobx";
  import { autorun, when } from "mobx";
  `
  const result = `
  import { observable, reaction, autorun, when } from "@firefox-pro-coding/react-composition-api";
  `
  const output = babel.transform(
    source.replace(/\n\s+/g, '\n'),
    { plugins: [babelPlugin] },
  )!

  expect(output).toBeTruthy()
  expect(output.code).toBeTruthy()
  expect(output.code!.trim()).toBe(result.replace(/\n\s+/g, '\n').trim())
})


test('extra import multi lines', () => {
  const source = `
  import { observable, reaction } from "mobx";
  import { autorun, when, isObservable } from "mobx";
  `
  const result = `
  import { isObservable } from "mobx";
  import { observable, reaction, autorun, when } from "@firefox-pro-coding/react-composition-api";
  `
  const output = babel.transform(
    source.replace(/\n\s+/g, '\n'),
    { plugins: [babelPlugin] },
  )!

  expect(output).toBeTruthy()
  expect(output.code).toBeTruthy()
  expect(output.code!.trim()).toBe(result.replace(/\n\s+/g, '\n').trim())
})


test('namespace import', () => {
  const source = `
  import * as mobx from "mobx";
  `
  const result = `
  import * as mobx from "mobx";
  `

  const output = babel.transform(
    source.replace(/\n\s+/g, '\n'),
    { plugins: [babelPlugin] },
  )!

  expect(output).toBeTruthy()
  expect(output.code).toBeTruthy()
  expect(output.code!.trim()).toBe(result.replace(/\n\s+/g, '\n').trim())
})


test('mixed default import', () => {
  const source = `
  import mobx, { observable } from "mobx";
  `
  const result = `
  import mobx from "mobx";
  import { observable } from "@firefox-pro-coding/react-composition-api";
  `
  const output = babel.transform(
    source.replace(/\n\s+/g, '\n'),
    { plugins: [babelPlugin] },
  )!

  expect(output).toBeTruthy()
  expect(output.code).toBeTruthy()
  expect(output.code!.trim()).toBe(result.replace(/\n\s+/g, '\n').trim())
})


test('no mobx import', () => {
  const noMobxImportSource = `
  import { observable, reaction, autorun, when } from "@firefox-pro-coding/react-composition-api";
  `
  const noMobxImportResult = `
  import { observable, reaction, autorun, when } from "@firefox-pro-coding/react-composition-api";
  `
  const output = babel.transform(
    noMobxImportSource.replace(/\n\s+/g, '\n'),
    { plugins: [babelPlugin] },
  )!

  expect(output).toBeTruthy()
  expect(output.code).toBeTruthy()
  expect(output.code!.trim()).toBe(noMobxImportResult.replace(/\n\s+/g, '\n').trim())
})


test('empty import', () => {
  const source = 'console.log();'
  const result = 'console.log();'
  const output = babel.transform(
    source.replace(/\n\s+/g, '\n'),
    { plugins: [babelPlugin] },
  )!

  expect(output).toBeTruthy()
  expect(output.code).toBeTruthy()
  expect(output.code!.trim()).toBe(result.replace(/\n\s+/g, '\n').trim())
})


test('renamed import', () => {
  const source = `
  import { observable as a, reaction as b, autorun as c, when as d } from "mobx";
  `
  const result = `
  import { observable as a, reaction as b, autorun as c, when as d } from "@firefox-pro-coding/react-composition-api";
  `
  const output = babel.transform(
    source.replace(/\n\s+/g, '\n'),
    { plugins: [babelPlugin] },
  )!

  expect(output).toBeTruthy()
  expect(output.code).toBeTruthy()
  expect(output.code!.trim()).toBe(result.replace(/\n\s+/g, '\n').trim())
})
