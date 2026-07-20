import { describe, it, expect } from 'vitest'
import { extractQuickReplies, stripInlineMarkdown } from './quickReplies'

describe('extractQuickReplies', () => {
  it('pulls a standard [quick] line off the end', () => {
    const { reply, suggestions } = extractQuickReplies(
      '卧室遮光的话，全遮光衬里最合适。\n[quick] 帮我算价格 | 免费布样怎么拿 | 再比较下罗马帘'
    )
    expect(reply).toBe('卧室遮光的话，全遮光衬里最合适。')
    expect(suggestions).toEqual(['帮我算价格', '免费布样怎么拿', '再比较下罗马帘'])
  })

  it('tolerates trailing blank lines, fullwidth brackets, colon, and fullwidth pipes', () => {
    const { reply, suggestions } = extractQuickReplies(
      'Which room is this for?\n\n【quick】: Bedroom ｜ Living room ｜ Whole home\n \n'
    )
    expect(reply).toBe('Which room is this for?')
    expect(suggestions).toEqual(['Bedroom', 'Living room', 'Whole home'])
  })

  it('returns empty suggestions when the model forgot the line', () => {
    const { reply, suggestions } = extractQuickReplies('Just a plain answer.')
    expect(reply).toBe('Just a plain answer.')
    expect(suggestions).toEqual([])
  })

  it('does NOT treat a [quick] line in the middle of the text as suggestions', () => {
    const text = '[quick] not really\nActual answer continues here.'
    const { reply, suggestions } = extractQuickReplies(text)
    expect(reply).toBe(text)
    expect(suggestions).toEqual([])
  })

  it('caps at 4 options, dedupes, trims, and drops empties', () => {
    const { suggestions } = extractQuickReplies(
      'ok\n[quick] a | a |  b  | | c | d | e'
    )
    expect(suggestions).toEqual(['a', 'b', 'c', 'd'])
  })

  it('truncates absurdly long options to 40 chars', () => {
    const long = 'x'.repeat(80)
    const { suggestions } = extractQuickReplies(`ok\n[quick] ${long}`)
    expect(suggestions).toEqual(['x'.repeat(40)])
  })

  it('yields an empty reply when the model sent ONLY a quick line (route treats as error)', () => {
    const { reply, suggestions } = extractQuickReplies('[quick] a | b')
    expect(reply).toBe('')
    expect(suggestions).toEqual(['a', 'b'])
  })
})

describe('stripInlineMarkdown', () => {
  it('strips **bold** and *italic* markers, keeping the words', () => {
    expect(stripInlineMarkdown('Here is what I **can** tell you: *Sundance* is mid-range.'))
      .toBe('Here is what I can tell you: Sundance is mid-range.')
  })
  it('strips __bold__, `code`, headings and blockquotes', () => {
    expect(stripInlineMarkdown('# Title\n> quoted\nUse __this__ and `that`.'))
      .toBe('Title\nquoted\nUse this and that.')
  })
  it('leaves a lone asterisk / bullet-style line and phone numbers untouched', () => {
    expect(stripInlineMarkdown('Call 626-451-9841 for a 5* service.'))
      .toBe('Call 626-451-9841 for a 5* service.')
  })
  it('does not mangle a URL or plain text', () => {
    expect(stripInlineMarkdown('See /store/whole-home for details.'))
      .toBe('See /store/whole-home for details.')
  })
})
