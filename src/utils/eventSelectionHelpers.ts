import { isEqual } from "lodash-es"

import { CalendarEvent } from "./components"

export type Point = {
  x: number
  y: number
}

export type Box = {
  top?: number
  bottom?: number
  right?: number
  left?: number
  x?: number
  y?: number
}

// Checks if an event box matches the currently selected calendar event
export function isSelected<TEvent extends CalendarEvent = CalendarEvent>(event: TEvent, selected: TEvent | null) {
  if(!event || selected === null) return false
  return isEqual(event, selected)
}

// Calculates the width of a single slot given a row's dimensions and number of slots
export function slotWidth(rowBox: Box, slots: number) {
  let rowWidth = rowBox.right - rowBox.left
  let cellWidth = rowWidth / slots

  return cellWidth
}

// Determines which slot contains the given x coordinate
export function getSlotAtX(rowBox: Box, x: number, rtl: boolean, slots: number) {
  const cellWidth = slotWidth(rowBox, slots)
  return rtl
    ? slots - 1 - Math.floor((x - rowBox.left) / cellWidth)
    : Math.floor((x - rowBox.left) / cellWidth)
}

// Checks if a point (x,y) falls within a given box
export function pointInBox(box: Box, { x, y }: Point) {
  return y >= box.top && y <= box.bottom && x >= box.left && x <= box.right
}

// Calculates selection range indices for date cells based on start point and current position
export function dateCellSelection(
  start: Box,
  rowBox: Box,
  box: Box,
  slots: number,
  rtl: boolean
) {
  let startIndex = -1
  let endIndex = -1
  let lastSlotIndex = slots - 1

  let cellWidth = slotWidth(rowBox, slots)

  // cell under the mouse
  let currentSlot = getSlotAtX(rowBox, box.x, rtl, slots)

  // Identify row as either the initial row
  // or the row under the current mouse point
  let isCurrentRow = rowBox.top < box.y && rowBox.bottom > box.y
  let isStartRow = rowBox.top < start.y && rowBox.bottom > start.y

  // this row's position relative to the start point
  let isAboveStart = start.y > rowBox.bottom
  let isBelowStart = rowBox.top > start.y
  let isBetween = box.top < rowBox.top && box.bottom > rowBox.bottom

  // this row is between the current and start rows, so entirely selected
  if(isBetween) {
    startIndex = 0
    endIndex = lastSlotIndex
  }

  if(isCurrentRow) {
    if(isBelowStart) {
      startIndex = 0
      endIndex = currentSlot
    } else if(isAboveStart) {
      startIndex = currentSlot
      endIndex = lastSlotIndex
    }
  }

  if(isStartRow) {
    // select the cell under the initial point
    startIndex = endIndex = rtl
      ? lastSlotIndex - Math.floor((start.x - rowBox.left) / cellWidth)
      : Math.floor((start.x - rowBox.left) / cellWidth)

    if(isCurrentRow) {
      if(currentSlot < startIndex) startIndex = currentSlot
      else endIndex = currentSlot // select current range
    } else if(start.y < box.y) {
      // the current row is below start row
      // select cells to the right of the start cell
      endIndex = lastSlotIndex
    } else {
      // select cells to the left of the start cell
      startIndex = 0
    }
  }

  return { startIndex, endIndex }
}
