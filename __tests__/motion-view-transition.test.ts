import { describe, it, expect, vi } from 'vitest'
import { withViewTransition } from '../lib/motion/view-transition'

type TransitionDoc = Document & {
  startViewTransition?: (callback: () => void) => unknown
}

const supporting = () => {
  const calls: Array<() => void> = []
  const doc = {
    startViewTransition: (callback: () => void) => {
      calls.push(callback)
      return {}
    },
  } as unknown as TransitionDoc
  return { doc, calls }
}

describe('withViewTransition', () => {
  it('runs the update inside the transition where one is available', () => {
    const { doc, calls } = supporting()
    const update = vi.fn()
    withViewTransition(update, { doc, reduced: false })
    expect(calls).toHaveLength(1)
    expect(update).not.toHaveBeenCalled()
    calls[0]()
    expect(update).toHaveBeenCalledTimes(1)
  })

  it('flushes the update synchronously, or the browser would snapshot nothing', () => {
    const { doc, calls } = supporting()
    const order: string[] = []
    withViewTransition(() => order.push('update'), {
      doc,
      reduced: false,
      flush: (run) => {
        order.push('flush')
        run()
      },
    })
    calls[0]()
    expect(order).toEqual(['flush', 'update'])
  })

  it('applies the change instantly when the browser has no view transitions', () => {
    const update = vi.fn()
    withViewTransition(update, { doc: {} as TransitionDoc, reduced: false })
    expect(update).toHaveBeenCalledTimes(1)
  })

  it('applies the change instantly for reduced motion even where supported', () => {
    const { doc, calls } = supporting()
    const update = vi.fn()
    withViewTransition(update, { doc, reduced: true })
    expect(update).toHaveBeenCalledTimes(1)
    expect(calls).toHaveLength(0)
  })

  it('applies the change instantly when there is no document at all', () => {
    const update = vi.fn()
    withViewTransition(update, { doc: undefined, reduced: false })
    expect(update).toHaveBeenCalledTimes(1)
  })

  it('reads reduced motion from the browser when the caller does not say', () => {
    const { doc, calls } = supporting()
    const matchMedia = vi
      .spyOn(window, 'matchMedia')
      .mockReturnValue({ matches: true } as MediaQueryList)
    const update = vi.fn()
    withViewTransition(update, { doc })
    expect(update).toHaveBeenCalledTimes(1)
    expect(calls).toHaveLength(0)
    matchMedia.mockRestore()
  })
})
