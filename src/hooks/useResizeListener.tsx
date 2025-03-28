import { useEffect, useState } from "react"

const observerCache = new Map<Element, {
  observer: ResizeObserver
  referenceCount: Set<React.RefObject<HTMLElement>>
}>()

/**
 * Creates a ResizeObserver for the target element.
 * All observers are cached preventing multiple observers from being created on the same element.
 */
export function useResizeObserver<T extends HTMLElement>(target: React.RefObject<T>) {
  const [size, setSize] = useState<{ width: number, height: number }>({
    width: 0,
    height: 0,
  })

  useEffect(() => {
    const element = ("current" in target) ? target.current : target
    if(!element) return () => {}

    // Check if there's an existing observer for this element
    let cached = observerCache.get(element)

    if(!cached) {
      // Create new observer if none exists
      const observer = new ResizeObserver((entries) => {
        for(const entry of entries) {
          setSize({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          })
        }
      })

      cached = {
        observer,
        referenceCount: new Set([target]),
      }
      observerCache.set(element, cached)
      observer.observe(element)
    } else {
      // Reuse existing observer
      cached.referenceCount.add(target)
    }

    return () => {
      if(!element || !cached) return

      cached.referenceCount.delete(target)

      // Clean up observer if no more references
      if(cached.referenceCount.size === 0) {
        cached.observer.disconnect()
        observerCache.delete(element)
      }
    }
  }, [target])

  return size
}
