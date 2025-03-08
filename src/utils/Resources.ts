import { Accessors } from "./accessors"
import { CalendarEvent } from "./components"

export type Resource = {
  id: string | number
  title: string
  [key: string | number]: any
}

type MapCallback = (resource: [string | number, Resource], index: number) => Resource[]

export default function Resources(resources: Resource[], accessors: Accessors) {
  return {
    map: (fn: MapCallback) => {
      if(!resources) return [fn([{}, null], 0)]

      return resources.map((resource, Index) =>
        fn([accessors.resourceId(resource), resource], index)
      )
    },

    groupEvents: (events: CalendarEvent[]) => {
      const eventsByResource = new Map()

      if(!resources) {
        // Return all events if resources are not provided
        eventsByResource.set({}, events)
        return eventsByResource
      }

      events.forEach((event) => {
        const id = accessors.resource(event) || {}

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
