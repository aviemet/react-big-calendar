import mdx from "./eventIdAccessor.mdx"
import { accessorStoryArgs } from "./storyDefaults"
import { Calendar } from "../../src"

export default {
  title: "props",
  component: Calendar,
  argTypes: {
    localizer: { control: { type: null } },
    events: { control: { type: null } },
    defaultDate: {
      control: {
        type: null,
      },
    },
  },
  parameters: {
    docs: {
      page: mdx,
    },
  },
}

const Template = (args) => (
  <div className="height600">
    <Calendar { ...args } />
  </div>
)

export const EventIdAccessor = Template.bind({})
EventIdAccessor.storyName = "eventIdAccessor"
EventIdAccessor.args = accessorStoryArgs
