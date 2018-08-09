import {transformSync} from '@babel/core'

import proposalsPreset from '../src'

describe('transforms', () => {
  test('class properties, decorators and export extensions', () => {
    let code = `
export thing from './module2'
export * as ns from './module1'

@Test
class TestClass {
  testProperty = true
} `
    let config = {
      presets: [
        [proposalsPreset, {
          classProperties: true,
          decorators: true,
          exportDefaultFrom: true,
          exportNamespaceFrom: true,
        }]
      ]
    }
    expect(transformSync(code, config).code).toMatchSnapshot()
  })
})
