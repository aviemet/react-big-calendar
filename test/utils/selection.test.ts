import { isSelected } from "@/utils/eventSelectionHelpers"

describe("isSelected", () => {
  test("it returns true if it is the same object by reference", () => {
    const value = {
      x: { sample: "value" },
      y: 1,
    }
    expect(isSelected(value, value)).toBeTruthy()
  })

  test("it returns true if it is the same object by equality", () => {
    const value = {
      x: { sample: "value" },
      y: 1,
    }

    const equivalentValue = {
      x: { sample: "value" },
      y: 1,
    }
    expect(isSelected(value, equivalentValue)).toBeTruthy()
  })

  test("it returns false if the object is not equal", () => {
    const value = {
      x: { sample: "value" },
      y: 1,
    }

    const nonEquivalentValue = {
      x: { sample: "value" },
      y: 2,
    }

    expect(isSelected(value, nonEquivalentValue)).toBeFalsy()
  })
})
