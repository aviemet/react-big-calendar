import moment from "moment"

import mdx from "./onDragOver.mdx"
import { Calendar, momentLocalizer } from "../../../../src"
import Basic from "../../../demos/exampleCode/dndOutsideSource"

export default {
  title: "Addons/Drag and Drop/props",
  component: Calendar,
  parameters: {
    docs: {
      page: mdx,
    },
  },
}

const localizer = momentLocalizer(moment)

export function OnDragOver() {
  return <Basic localizer={ localizer } />
}

OnDragOver.storyName = "onDragOver"
