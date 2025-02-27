import CalendarEvent from './CalendarEvent'
import overlap from './overlap'
import { DayLayoutFunction } from './types'

function getMaxIndexDFS(node, maxIndex, visited) {
  for(let i = 0; i < node.friends.length; ++i) {
    if(visited.indexOf(node.friends[i]) > -1) continue
    maxIndex = maxIndex > node.friends[i].Index ? maxIndex : node.friends[i].Index
    // TODO : trace it by not object but kinda index or something for performance
    visited.push(node.friends[i])
    const newIndex = getMaxIndexDFS(node.friends[i], maxIndex, visited)
    maxIndex = maxIndex > newIndex ? maxIndex : newIndex
  }
  return maxIndex
}

const noOverlap: DayLayoutFunction = ({
  events,
  minimumStartDifference,
  slotMetrics,
  accessors,
}) => {
  const styledEvents = overlap({
    events,
    minimumStartDifference,
    slotMetrics,
    accessors,
  })

  styledEvents.sort((a, b) => {
    if(a.style.top !== b.style.top) {
      return a.style.top > b.style.top ? 1 : -1
    } else if(a.style.height !== b.style.height){
      return a.style.top + a.style.height < b.style.top + b.style.height ? 1 : -1
    } else {
      return 0
    }
  })

  for(let i = 0; i < styledEvents.length; ++i) {
    styledEvents[i].friends = []
    delete styledEvents[i].style.left
    delete styledEvents[i].style.left
    delete styledEvents[i].Index
    delete styledEvents[i].size
  }

  for(let i = 0; i < styledEvents.length - 1; ++i) {
    const se1 = styledEvents[i]
    const y1 = se1.style.top
    const y2 = se1.style.top + se1.style.height

    for(let j = i + 1; j < styledEvents.length; ++j) {
      const se2 = styledEvents[j]
      const y3 = se2.style.top
      const y4 = se2.style.top + se2.style.height

      if(
        (y3 >= y1 && y4 <= y2) ||
        (y4 > y1 && y4 <= y2) ||
        (y3 >= y1 && y3 < y2)
      ) {
        // TODO : hashmap would be effective for performance
        se1.friends.push(se2)
        se2.friends.push(se1)
      }
    }
  }

  for(let i = 0; i < styledEvents.length; ++i) {
    const se = styledEvents[i]
    const bitmap = []
    for(let j = 0; j < 100; ++j) bitmap.push(1) // 1 means available

    for(let j = 0; j < se.friends.length; ++j)
      if(se.friends[j].Index !== undefined) bitmap[se.friends[j].Index] = 0 // 0 means reserved

    se.Index = bitmap.indexOf(1)
  }

  for(let i = 0; i < styledEvents.length; ++i) {
    let size = 0

    if(styledEvents[i].size) continue

    const allFriends = []
    const maxIndex = getMaxIndexDFS(styledEvents[i], 0, allFriends)
    size = 100 / (maxIndex + 1)
    styledEvents[i].size = size

    for(let j = 0; j < allFriends.length; ++j) allFriends[j].size = size
  }

  for(let i = 0; i < styledEvents.length; ++i) {
    const e = styledEvents[i]
    e.style.left = e.Index * e.size

    // stretch to maximum
    let maxIndex = 0
    for(let j = 0; j < e.friends.length; ++j) {
      const Index = e.friends[j].Index
      maxIndex = maxIndex > Index ? maxIndex : Index
    }
    if(maxIndex <= e.Index) e.size = 100 - e.Index * e.size

    // padding between events
    // for this feature, `width` is not percentage based unit anymore
    // it will be used with calc()
    const padding = e.Index === 0 ? 0 : 3
    e.style.width = `calc(${e.size}% - ${padding}px)`
    e.style.height = `calc(${e.style.height}% - 2px)`
    e.style.xOffset = `calc(${e.style.left}% + ${padding}px)`
  }

  return styledEvents
}

export default noOverlap
