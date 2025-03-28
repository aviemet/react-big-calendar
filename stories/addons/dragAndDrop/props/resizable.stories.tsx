import moment from "moment"

import mdx from "./resizable.mdx"
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

export function Resizable() {
  return <Basic localizer={ localizer } />
}
Resizable.storyName = "resizable"
