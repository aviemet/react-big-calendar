const NODE_ENV = process.env.NODE_ENV

/**
 * Use invariant() to assert conditions that your program assumes to be true.
 *
 * Development: Provides detailed error messages with sprintf-style formatting.
 * Production: Build tools can strip the message handling code entirely.
 */
function invariant(condition: boolean, format?: string, ...args: unknown[]): asserts condition {
  // Development version
  if(NODE_ENV !== "production") {
    if(format === undefined) {
      throw new Error("invariant requires an error message argument")
    }

    if(!condition) {
      const error = new Error(format.replace(/%s/g, () => String(args.shift())))
      error.name = "Invariant Violation"
      if(Error.captureStackTrace) {
        Error.captureStackTrace(error, invariant)
      }
      throw error
    }

    return
  }

  // Production version - everything else can be stripped
  if(!condition) {
    throw new Error("An error occurred. Check a development environment for detailed error messages.")
  }
}

export { invariant }
