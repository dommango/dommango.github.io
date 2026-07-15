// Writing — posts from the Substack (Context//Collapse).
//
// Populated at build time by scripts/fetch-substack.js, which overwrites
// SUBSTACK_POSTS below. Typed TS rather than JSON: an empty JSON array
// infers never[] under strict, and this list is empty until Dom publishes.
//
// The Writing section and its nav link both render only when this is
// non-empty, so the section stays invisible rather than shipping a stub.

export interface WritingPost {
  title: string
  url: string
  /** ISO date string. */
  date: string
  subtitle?: string
}

export const SUBSTACK_URL = 'https://dommangonon.substack.com'

// GENERATED — do not edit by hand. See scripts/fetch-substack.js.
export const POSTS: WritingPost[] = []
// END GENERATED

export const hasPosts = (): boolean => POSTS.length > 0
