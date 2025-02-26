import { useEffect, useRef } from 'react'

export default function useTimeout(callback: () => void, delay: number | null): void {
  const savedCallback = useRef(callback)

  useEffect(() => {
    if(!delay && delay !== 0) {
      return
    }

    const id = setTimeout(() => {
      savedCallback.current()
    }, delay)

    return () => {
      clearTimeout(id)
    }
  }, [delay])
}
