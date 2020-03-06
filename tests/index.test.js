import expect, {createSpy} from 'expect'

import preset from '../src'

describe('babel-preset-proposals', () => {
  let api

  beforeEach(() => {
    api = {
      assertVersion: jest.fn()
    }
  })

  afterEach(() => {
    expect(api.assertVersion).toHaveBeenCalledWith(7)
  })

  test('does nothing by default', () => {
    expect(preset(api)).toEqual({plugins: []})
  })

  test('rejects unsupported options', () => {
    expect(() => preset(api, {unknown: true})).toThrowErrorMatchingSnapshot()
    expect(() => preset(api, {unknown1: true, unknown2: true})).toThrowErrorMatchingSnapshot()
  })

  test('multiple bad options', () => {
    expect(() => preset(api, {
      all: true,
      unknown: true,
      loose: false,
      decorators: true,
      functionBind: /invalid/
    })).toThrowErrorMatchingSnapshot()
  })

  describe("'all' option", () => {
    test('must be boolean', () => {
      expect(() => preset(api, {all: /invalid/})).toThrowErrorMatchingSnapshot()
    })
    test('enables all plugins', () => {
      expect(preset(api, {all: true})).toMatchSnapshot()
    })
    test('can be cancelled out by false plugin options', () => {
      expect(preset(api, {
        all: true,
        functionBind: false,
        exportDefaultFrom: false,
        logicalAssignmentOperators: false,
        pipelineOperator: false,
        doExpressions: false,
        decorators: false,
        functionSent: false,
        exportNamespaceFrom: false,
        numericSeparator: false,
        throwExpressions: false,
        dynamicImport: false,
        importMeta: false,
        classProperties: false,
      })).toMatchSnapshot()
    })
  })

  describe("'absolutePaths' option", () => {
    test('must be boolean', () => {
      expect(() => preset(api, {absolutePaths: /invalid/})).toThrowErrorMatchingSnapshot()
    })
    test('enables the use of absolute paths for plugins', () => {
      expect(preset(api, {all: true, absolutePaths: true})).toMatchSnapshot()
    })
  })

  describe("'loose' option", () => {
    test('must be boolean', () => {
      expect(() => preset(api, {loose: /invalid/})).toThrowErrorMatchingSnapshot()
    })
    test('configures loose mode for all plugins which take it', () => {
      expect(preset(api, {
        loose: true,
        // Should configure loose for enabled plugins
        classProperties: true,
      })).toMatchSnapshot()
    })
    test('ignores disabled or alrady-configured plugins', () => {
      expect(preset(api, {
        loose: true,
        classProperties: true,
      })).toMatchSnapshot()
    })
    test('can create invalid config which will be caught by validation', () => {
      expect(() => preset(api, {
        loose: false,
        decorators: true,
        classProperties: true,
      })).toThrowErrorMatchingSnapshot()
    })
  })

  describe("'functionBind' option", () => {
    test('must be boolean', () => {
      expect(() => preset(api, {functionBind: /invalid/})).toThrowErrorMatchingSnapshot()
    })
    test('enables its plugin when true', () => {
      expect(preset(api, {functionBind: true})).toMatchSnapshot()
    })
  })

  describe("'exportDefaultFrom' option", () => {
    test('must be boolean', () => {
      expect(() => preset(api, {exportDefaultFrom: /invalid/})).toThrowErrorMatchingSnapshot()
    })
    test('enables its plugin when true', () => {
      expect(preset(api, {exportDefaultFrom: true})).toMatchSnapshot()
    })
  })

  describe("'logicalAssignmentOperators' option", () => {
    test('must be boolean', () => {
      expect(() => preset(api, {logicalAssignmentOperators: /invalid/})).toThrowErrorMatchingSnapshot()
    })
    test('enables its plugin when true', () => {
      expect(preset(api, {logicalAssignmentOperators: true})).toMatchSnapshot()
    })
  })

  describe("'pipelineOperator' option", () => {
    test('must be boolean', () => {
      expect(() => preset(api, {pipelineOperator: /invalid/})).toThrowErrorMatchingSnapshot()
    })
    test('enables its plugin when true', () => {
      expect(preset(api, {pipelineOperator: true})).toMatchSnapshot()
    })
  })

  describe("'doExpressions' option", () => {
    test('must be boolean', () => {
      expect(() => preset(api, {doExpressions: /invalid/})).toThrowErrorMatchingSnapshot()
    })
    test('enables its plugin when true', () => {
      expect(preset(api, {doExpressions: true})).toMatchSnapshot()
    })
  })

  describe("'decorators' option", () => {
    test('must be boolean', () => {
      expect(() => preset(api, {decorators: /invalid/})).toThrowErrorMatchingSnapshot()
    })
    test('enables its plugin with legacy option when true', () => {
      expect(preset(api, {decorators: true})).toMatchSnapshot()
    })
  })

  describe("'functionSent' option", () => {
    test('must be boolean', () => {
      expect(() => preset(api, {functionSent: /invalid/})).toThrowErrorMatchingSnapshot()
    })
    test('enables its plugin when true', () => {
      expect(preset(api, {functionSent: true})).toMatchSnapshot()
    })
  })

  describe("'exportNamespaceFrom' option", () => {
    test('must be boolean', () => {
      expect(() => preset(api, {exportNamespaceFrom: /invalid/})).toThrowErrorMatchingSnapshot()
    })
    test('enables its plugin when true', () => {
      expect(preset(api, {exportNamespaceFrom: true})).toMatchSnapshot()
    })
  })

  describe("'numericSeparator' option", () => {
    test('must be boolean', () => {
      expect(() => preset(api, {numericSeparator: /invalid/})).toThrowErrorMatchingSnapshot()
    })
    test('enables its plugin when true', () => {
      expect(preset(api, {numericSeparator: true})).toMatchSnapshot()
    })
  })

  describe("'throwExpressions' option", () => {
    test('must be boolean', () => {
      expect(() => preset(api, {throwExpressions: /invalid/})).toThrowErrorMatchingSnapshot()
    })
    test('enables its plugin when true', () => {
      expect(preset(api, {throwExpressions: true})).toMatchSnapshot()
    })
  })

  describe("'dynamicImport' option", () => {
    test('must be boolean', () => {
      expect(() => preset(api, {dynamicImport: /invalid/})).toThrowErrorMatchingSnapshot()
    })
    test('enables its plugin when true', () => {
      expect(preset(api, {dynamicImport: true})).toMatchSnapshot()
    })
  })

  describe("'importMeta' option", () => {
    test('must be boolean', () => {
      expect(() => preset(api, {importMeta: /invalid/})).toThrowErrorMatchingSnapshot()
    })
    test('enables its plugin when true', () => {
      expect(preset(api, {importMeta: true})).toMatchSnapshot()
    })
  })

  describe("'classProperties' option", () => {
    test('must be boolean or an Object', () => {
      expect(() => preset(api, {classProperties: /invalid/})).toThrowErrorMatchingSnapshot()
    })
    test('enables its plugin when true', () => {
      expect(preset(api, {classProperties: true})).toMatchSnapshot()
    })
    test('rejects unsupported options', () => {
      expect(() => preset(api, {classProperties: {unknown: true}})).toThrowErrorMatchingSnapshot()
      expect(() => preset(api, {classProperties: {unknown1: true, unknown2: true}})).toThrowErrorMatchingSnapshot()
    })
    test('can be enabled by an empty config object', () => {
      expect(preset(api, {classProperties: {}})).toMatchSnapshot()
    })
    test('can have its loose option configured', () => {
      expect(preset(api, {classProperties: {loose: true}})).toMatchSnapshot()
      expect(preset(api, {classProperties: {loose: false}})).toMatchSnapshot()
    })
    test('loose option must be boolean', () => {
      expect(() => preset(api, {classProperties: {loose: /invalid/}})).toThrowErrorMatchingSnapshot()
    })
    test('must be loose when legacy decorators are also enabled', () => {
      expect(() => preset(api, {classProperties: {loose: false}, decorators: true})).toThrowErrorMatchingSnapshot()
      expect(() => preset(api, {classProperties: {}, decorators: true})).toThrowErrorMatchingSnapshot()
    })
  })
})
