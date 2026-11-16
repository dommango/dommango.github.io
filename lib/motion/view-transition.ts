// Same-document View Transitions, used for the theme wipe. Unsupported browsers
// and reduced-motion users get the instant state change instead.

type TransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => unknown
}

interface TransitionDeps {
  doc?: TransitionDocument
  reduced?: boolean
  /** Applies `update` in a synchronous commit — React's flushSync in the app. */
  flush?: (update: () => void) => void
}

/**
 * Runs `update` inside a view transition where one is available. The update must
 * be flushed synchronously: the browser snapshots the DOM when the callback
 * returns, so an update still sitting in React's queue would animate nothing.
 */
export function withViewTransition(update: () => void, deps: TransitionDeps = {}): void {
  const doc = deps.doc ?? (typeof document === 'undefined' ? undefined : (document as TransitionDocument))
  const reduced =
    deps.reduced ??
    (typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const flush = deps.flush ?? ((run: () => void) => run())

  if (reduced || typeof doc?.startViewTransition !== 'function') {
    update()
    return
  }
  doc.startViewTransition(() => flush(update))
}
