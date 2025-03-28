import moment from "moment"

import mdx from "./onEventResize.mdx"
import { Calendar, momentLocalizer } from "../../../../src"
import Basic from "../../../demos/exampleCode/resizable"

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

export function OnEventResize() {
  return <Basic localizer={ localizer } />
}
OnEventResize.storyName = "onEventResize"
