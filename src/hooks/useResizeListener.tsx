import { useEffect, useState } from "react"

const observerCache = new Map<Element, {
  observer: ResizeObserver
  referenceCount: Set<React.RefObject<T>>
}>()

export function useResizeObserver<T extends Element>(targetRef: React.RefObject<T>) {
  const [size, setSize] = useState<{ width: number, height: number }>({
    width: 0,
    height: 0,
  })

  useEffect(() => {
    const element = targetRef.current
    if(!element) return

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
        referenceCount: new Set([targetRef]),
      }
      observerCache.set(element, cached)
      observer.observe(element)
    } else {
      // Reuse existing observer
      cached.referenceCount.add(targetRef)
    }

    return () => {

      if(!element || !cached) return

      cached.referenceCount.delete(targetRef)

      // Clean up observer if no more references
      if(cached.referenceCount.size === 0) {
        cached.observer.disconnect()
        observerCache.delete(element)
      }
    }
  }, [targetRef])

  return size
}
