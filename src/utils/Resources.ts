import { Accessors } from "./accessors"
import { CalendarEvent } from "./components"

export type Resource = {
  id: string | number
  title: string
  [key: string | number]: unknown
}

export type GroupedResourceManager<TEvent extends CalendarEvent = CalendarEvent, TResource extends Resource = Resource> = {
  map: <TReturn>(fn: (resource: [string | number, TResource], index: number) => TReturn) => TReturn[]
  groupEvents: (events: CalendarEvent[]) => Map<string | number | null, TEvent[]>
}

function ResourceManager<TEvent extends CalendarEvent = CalendarEvent, TResource extends Resource = Resource>(resources: TResource[] | undefined, accessors: Accessors): GroupedResourceManager<TEvent, TResource> {
  return {
    map: <TReturn>(fn: (resource: [string | number, TResource | null], index: number) => TReturn) => {
      if(!resources || resources.length < 1) return [fn([null, null], 0)]

      return resources.map((resource, index) =>
        fn([accessors.resourceId(resource), resource], index)
      )
    },

    groupEvents: (events: TEvent[]): Map<string | number | null, TEvent[]> => {
      const eventsByResource = new Map<string | number | null, TEvent[]>()

      if(!resources || resources.length < 1) {
        // Return all events if resources are not provided
        eventsByResource.set(null, events)
        return eventsByResource
      }

      events.forEach((event) => {
        const id = accessors.resource(event)?.id || null

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
