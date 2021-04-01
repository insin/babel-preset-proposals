const PROPOSAL_PLUGINS = {
  // Stage 0
  functionBind: '@babel/plugin-proposal-function-bind',
  // Stage 1
  exportDefaultFrom: '@babel/plugin-proposal-export-default-from',
  pipelineOperator: '@babel/plugin-proposal-pipeline-operator',
  doExpressions: '@babel/plugin-proposal-do-expressions',
  // Stage 2
  decorators: '@babel/plugin-proposal-decorators',
  functionSent: '@babel/plugin-proposal-function-sent',
  logicalAssignmentOperators: '@babel/plugin-proposal-logical-assignment-operators',
  throwExpressions: '@babel/plugin-proposal-throw-expressions',
  // Stage 3
  dynamicImport: '@babel/plugin-syntax-dynamic-import',
  importMeta: '@babel/plugin-syntax-import-meta',
  classStaticBlock: '@babel/plugin-proposal-class-static-block',
  classProperties: '@babel/plugin-proposal-class-properties',
  numericSeparator: '@babel/plugin-proposal-numeric-separator',
  // Stage 4
  exportNamespaceFrom: '@babel/plugin-proposal-export-namespace-from',
}

const PROPOSALS_WITH_OPTIONS = new Set([
  'classProperties',
  'decorators',
  'pipelineOperator',
])

// Plugins which take a 'loose' option
const PROPOSALS_WITH_LOOSE_OPTION = new Set([
  'classProperties',
])

const DEFAULT_PLUGIN_OPTIONS = {
  decorators: {decoratorsBeforeExport: false},
  pipelineOperator: {proposal: 'minimal'},
}

let getType = (arg) => {
  return Object.prototype.toString.call(arg).slice(8, -1).toLowerCase()
}

function getPlugin(proposal, {absolutePaths}) {
  if (absolutePaths) {
    return require.resolve(PROPOSAL_PLUGINS[proposal])
  }
  return PROPOSAL_PLUGINS[proposal]
}

function classPropertiesExplicitlyInSpecMode(proposalOptions) {
  return (
    proposalOptions.hasOwnProperty('classProperties') &&
    getType(proposalOptions.classProperties) === 'object' &&
    proposalOptions.classProperties.loose !== true
  )
}

function decoratorsInLegacyMode(proposalOptions) {
  return (
    proposalOptions.hasOwnProperty('decorators') &&
    getType(proposalOptions.decorators) === 'object' &&
    proposalOptions.decorators.legacy === true
  )
}

export function validateOptions(options) {
  let errors = []

  if (options.hasOwnProperty('all') && getType(options.all) !== 'boolean') {
    errors.push("'all' option must be boolean.")
  }

  if (options.hasOwnProperty('absolutePaths') && getType(options.absolutePaths) !== 'boolean') {
    errors.push("'absolutePaths' option must be boolean.")
  }

  if (options.hasOwnProperty('loose') && getType(options.loose) !== 'boolean') {
    errors.push("'loose' option must be boolean.")
  }

  let proposalOptions = getProposalOptions(options)

  let unexpectedOptions = Object.keys(proposalOptions).filter(proposal => !PROPOSAL_PLUGINS.hasOwnProperty(proposal))
  if (unexpectedOptions.length !== 0) {
    errors.push(`unknown option${unexpectedOptions.length === 1 ? '' : 's'}: ${unexpectedOptions.map(o => `'${o}'`).join(', ')}`)
  }

  Object.keys(PROPOSAL_PLUGINS).forEach((proposal) => {
    if (!proposalOptions.hasOwnProperty(proposal)) return
    let error = validateProposalOptions(proposal, proposalOptions[proposal])
    if (error) {
      errors.push(error)
    }
  })

  // Special case - class properties must be in loose mode if decorators are in legacy mode
  if (proposalOptions.decorators &&
      proposalOptions.classProperties &&
      decoratorsInLegacyMode(proposalOptions) &&
      classPropertiesExplicitlyInSpecMode(proposalOptions)) {
    errors.push(`'classProperties.loose' option must be true, as legacy decorators are being used.`)
  }

  return errors
}

/**
 * Validate the provided options for a proposal plugin.
 */
function validateProposalOptions(proposal, options) {
  let type = getType(options)
  if (type === 'object' && PROPOSALS_WITH_OPTIONS.has(proposal)) {
    if (PROPOSALS_WITH_LOOSE_OPTION.has(proposal) &&
        options.hasOwnProperty('loose') &&
        getType(options.loose) !== 'boolean') {
      return `'${proposal}.loose' option must be a boolean.`
    }

    // XXX @babel/plugin-proposal-pipeline-operator isn't currently validating
    //     the presence or value of its required proposal option, so we'll do it
    //     in the meantime.
    if (proposal === 'pipelineOperator') {
      let pipelineProposals = ['minimal', 'smart', 'fsharp']
      if (!pipelineProposals.includes(options.proposal)) {
        return `'${proposal}.proposal' option must be one of: ${pipelineProposals.join(', ')}.`
      }
    }
  }
  else if (type !== 'boolean') {
    return `'${proposal}' option must be a boolean${PROPOSALS_WITH_OPTIONS.has(proposal) ? ' or an Object' : ''}.`
  }
}

/**
 * Create final proposal options using other options which enable or configure
 * them.
 */
function getProposalOptions(options) {
  let {absolutePaths, all = false, loose, ...proposalOptions} = options

  // Enable all plugins which we didn't get an option for
  if (all) {
    Object.keys(PROPOSAL_PLUGINS).forEach((proposal) => {
      if (!proposalOptions.hasOwnProperty(proposal)) {
        proposalOptions[proposal] = true
      }
    })
  }

  // Set the provided 'loose' option for plugins which it hasn't been provided for
  if (getType(loose) === 'boolean') {
    PROPOSALS_WITH_LOOSE_OPTION.forEach((proposal) => {
      if (!proposalOptions.hasOwnProperty(proposal) ||
          proposalOptions[proposal] === false) {
        return
      }

      if (proposalOptions[proposal] === true) {
        proposalOptions[proposal] = {loose}
      }
      else if (!proposalOptions[proposal].hasOwnProperty('loose')) {
        proposalOptions[proposal].loose = loose
      }
    })
  }

  return proposalOptions
}

export default function(api, options = {}) {
  api.assertVersion(7)

  let validationErrors = validateOptions(options)
  if (validationErrors.length !== 0) {
    if (validationErrors.length === 1) {
      throw new Error(`babel-preset-proposals: ${validationErrors[0]}`)
    }
    throw new Error(`babel-preset-proposals:\n${validationErrors.join('\n')}`)
  }

  let {absolutePaths = false, loose} = options
  let proposalOptions = getProposalOptions(options)
  let plugins = []

  // Add plugins in a known order to ensure decorators comes before class properties when both are used.
  // See https://babeljs.io/docs/en/next/babel-plugin-proposal-decorators#note-compatibility-with-babel-plugin-proposal-class-properties
  Object.keys(PROPOSAL_PLUGINS).forEach((proposal) => {
    // false explicitly disables a proposal plugin (for use with the 'all' option)
    if (!proposalOptions.hasOwnProperty(proposal) ||
        proposalOptions[proposal] === false) {
      return
    }

    let plugin = getPlugin(proposal, {absolutePaths})

    if (proposalOptions[proposal] === true) {
      // Default class properties to loose mode when using decorators in legacy mode
      if (proposal === 'classProperties' && decoratorsInLegacyMode(proposalOptions)) {
        plugins.push([plugin, {loose: true}])
      }
      // Provide default options for plugins which require them
      else if (DEFAULT_PLUGIN_OPTIONS.hasOwnProperty(proposal)) {
        plugins.push([plugin, DEFAULT_PLUGIN_OPTIONS[proposal]])
      }
      else {
        plugins.push(plugin)
      }
    }
    else {
      plugins.push([plugin, proposalOptions[proposal]])
    }
  })

  return {plugins}
}
