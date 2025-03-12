import { Accessors } from "./accessors"
import { CalendarEvent } from "./components"

export const NONE = {}

export type Resource = {
  id: string | number
  title: string
  [key: string | number]: unknown
}

function ResourceManager<TEvent extends CalendarEvent = CalendarEvent, TResource extends Resource = Resource>(resources: TResource[] | undefined, accessors: Accessors) {
  return {
    map: <TReturn>(fn: (resource: [string | number, TResource | null], index: number) => TReturn) => {
      if(!resources || resources.length < 1) return [fn([NONE, null], 0)]

      return resources.map((resource, index) =>
        fn([accessors.resourceId(resource), resource], index)
      )
    },

    groupEvents: (events: TEvent[]) => {
      const eventsByResource = new Map()

      if(!resources || resources.length < 1) {
        // Return all events if resources are not provided
        eventsByResource.set(NONE, events)
        return eventsByResource
      }

      events.forEach((event) => {
        const id = accessors.resource(event) || NONE

        if(Array.isArray(id)) {
          id.forEach((item) => {
            let resourceEvents = eventsByResource.get(item) || []
            resourceEvents.push(event)
            eventsByResource.set(item, resourceEvents)
          })
        } else {
          let resourceEvents = eventsByResource.get(id) || []
          resourceEvents.push(event)
          eventsByResource.set(id, resourceEvents)
        }
      })
      return eventsByResource
    },
  }
}

export { ResourceManager }
