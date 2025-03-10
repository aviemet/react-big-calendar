import { useState } from "react"
import clsx from "clsx"
import { EventWrapper } from "./EventWrapper"
import { EventContainerWrapper } from "./EventContainerWrapper"
import { WeekWrapper } from "./WeekWrapper"
import { mergeComponents } from "./common"
import { Calendar as CalendarComponent, CalendarProps } from "@/components/Calendar"
import { CalendarEvent } from "@/utils/components"
import { Resource } from "@/utils/Resources"
import { createContext } from "@/hooks/createContext"

const [useDndContext, DndContextProvider] = createContext()
export { useDndContext }

export type DragAndDropCalendarProps<TEvent extends CalendarEvent = CalendarEvent, TResource extends Resource = Resource> = CalendarProps<TEvent, TResource> & {
  onEventDrop: (event: any) => void
  onEventResize: (event: any) => void
  onDragStart: (event: any) => void
  onDragOver: (event: any) => void
  onDropFromOutside: (event: any) => void
  dragFromOutsideItem: (event: any) => void
  draggableAccessor: (event: any) => void
  resizableAccessor: (event: any) => void
  selectable: boolean | "ignoreEvents"
  resizable: boolean
}

function withDragAndDrop(Calendar: typeof CalendarComponent) {
  const DragAndDropCalendar = ({
    components,
    elementProps,
    onEventDrop,
    onEventResize,
    onDragStart,
    onDragOver,
    onDropFromOutside,
    dragFromOutsideItem,
    draggableAccessor = null,
    resizableAccessor = null,
    selectable = false,
    resizable = true,
    ...props
  }: DragAndDropCalendarProps) => {
    const [interacting, setInteracting] = useState(false)

    const defaultOnDragOver = (event) => {
      event.preventDefault()
    }

    const handleBeginAction = (event, action, direction) => {
      this.setState({ event, action, direction })
      const { onDragStart } = this.props
      if(onDragStart) onDragStart({ event, action, direction })
    }

    const handleInteractionStart = () => {
      if(this.state.interacting === false) this.setState({ interacting: true })
    }

    const handleInteractionEnd = (interactionInfo) => {
      const { action, event } = this.state
      if(!action) return

      this.setState({
        action: null,
        event: null,
        interacting: false,
        direction: null,
      })

      if(interactionInfo === null) return

      interactionInfo.event = event
      const { onEventDrop, onEventResize } = this.props
      if(action === "move" && onEventDrop) onEventDrop(interactionInfo)
      if(action === "resize" && onEventResize) onEventResize(interactionInfo)
    }

    const dndComponents = mergeComponents(components, {
      eventWrapper: EventWrapper,
      eventContainerWrapper: EventContainerWrapper,
      weekWrapper: WeekWrapper,
    })

    const elementPropsWithDropFromOutside = onDropFromOutside
      ? {
        ...elementProps,
        onDragOver: onDragOver || defaultOnDragOver,
      }
      : elementProps

    props.className = clsx(
      props.className,
      "rbc-addons-dnd",
      !!interacting && "rbc-addons-dnd-is-dragging"
    )

    return (
      <DndContextProvider value={ {
        draggable: {
          onStart: handleInteractionStart,
          onEnd: handleInteractionEnd,
          onBeginAction: handleBeginAction,
          onDropFromOutside: onDropFromOutside,
          dragFromOutsideItem: dragFromOutsideItem,
          draggableAccessor: draggableAccessor,
          resizableAccessor: resizableAccessor,
          dragAndDropAction: setInteracting,
        },
      } }>
        <Calendar
          { ...props }
          elementProps={ elementPropsWithDropFromOutside }
          components={ dndComponents }
        />
      </DndContextProvider>
    )
  }


  return DragAndDropCalendar
}

export { withDragAndDrop }
