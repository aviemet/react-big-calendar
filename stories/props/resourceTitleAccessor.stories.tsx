import mdx from "./resourceTitleAccessor.mdx"
import { resourceAccessorStoryArgs } from "./storyDefaults"
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
    defaultView: {
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

export const ResourceTitleAccessor = Template.bind({})
ResourceTitleAccessor.storyName = "resourceTitleAccessor"
ResourceTitleAccessor.args = resourceAccessorStoryArgs
