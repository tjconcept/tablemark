'use strict'

const os = require('os')
const sentence = require('sentence-case')

const ALIGN = [ 'LEFT', 'CENTER', 'RIGHT' ]

const columnWidthMin = 5

module.exports = (input, options) => {
  if (!Array.isArray(input)) {
    throw new TypeError(
      `Expected an Array, got ${typeof input}`
    )
  }

  options = Object.assign({}, options)

  const keys = Object.keys(input[0])

  const titles = keys.map((key, i) => {
    if (Array.isArray(options.columns) && options.columns[i]) {
        if (typeof options.columns[i] === 'string') {
          return options.columns[i]
        } else if (options.columns[i].name) {
          return options.columns[i].name
        }
    }

    if (options.caseHeader === false) return key

    return sentence(key)
  })

  const widths = input.reduce(
    (sizes, item) => keys.map(
      (key, i) => Math.max(
        columnWidthMin,
        typeof item[key] === 'undefined' ? 0 : String(item[key]).length,
        sizes[i]
      )
    ),
    titles.map(t => t.length)
  )

  const alignments = keys.map((key, i) => {
    if (Array.isArray(options.columns)
      && options.columns[i]
      && options.columns[i].align
    ) {
      const align = String(options.columns[i].align).toUpperCase()

      if (ALIGN.indexOf(align) === -1) {
        throw new TypeError(`Unknown alignment, got ${options.columns[i].align}`)
      }

      return align
    }
  })

  let table = ''

  // header line
  table += row(titles.map(
    (title, i) => pad(alignments[i], widths[i], title)
  ))

  // header separator
  table += row(alignments.map(
    (align, i) => (align === 'LEFT' || align === 'CENTER' ? ':' : '-')
      + repeat('-', widths[i] - 2)
      + (align === 'RIGHT' || align === 'CENTER' ? ':' : '-')
  ))

  // table body
  table += input.map(
    item => row(keys.map(
      (key, i) => pad(alignments[i], widths[i], toString(item[key]))
    ))
  ).join('')

  return table
}

function pad(alignment, width, what){
  if (!alignment || alignment === 'LEFT') {
    return padEnd(what, width)
  }

  if (alignment === 'RIGHT') {
    return padStart(what, width)
  }

  // CENTER
  const remainder = (width - what.length) % 2
  const sides = (width - what.length - remainder) / 2

  return repeat(' ', sides) + what + repeat(' ', sides + remainder)
}

function row(cells){
  return '| ' + cells.join(' | ') + ' |' + os.EOL
}

function repeat(what, times){
  return new Array(times).fill(what).join('')
}

function padStart(what, target, start){
  return repeat(' ', target - what.length) + what
}

function padEnd(what, target, start){
  return what + repeat(' ', target - what.length)
}

function toString(v){
  if (typeof v === 'undefined') return ''
  return String(v)
}
