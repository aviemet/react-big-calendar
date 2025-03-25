import React from "react"

const ResourcesLayout = () => {
  return (
    <>
      {
        resources && resources.length > 1 && resourceGroupingLayout
          ? <TimeGridHeaderResources { ...headerProps } />
          : <TimeGridHeader { ...headerProps } />
      }

      { popup && <PopOverlay
        ref={ containerRef }
        overlay={ overlay }
        selected={ selected }
        popupOffset={ popupOffset }
        handleKeyPressEvent={ (e) => onKeyPressEvent?.(e) }
        handleSelectEvent={ handleSelectEvent }
        handleDoubleClickEvent={ (event, e) => onDoubleClickEvent?.(event, e) }
        handleDragStart={ handleDragStart }
        show={ !!overlay?.position }
        overlayDisplay={ overlayDisplay }
        onHide={ () => setOverlay(null) }
      /> }

      <div
        ref={ contentRef }
        className="rbc-time-content"
        onScroll={ handleScroll }
      >
        <TimeGutter
          ref={ gutterRef }
          min={ localizer.merge(range[0], min) }
          max={ localizer.merge(range[0], max) }
          step={ step }
          timeslots={ timeslots }
        />

        { !resourceGroupingLayout
          ? resourceManager.map(([id, resource]) => {

            return range.map((date) => (
              <DayColumnWrapper
                key={ date.toISOString() }
                date={ date }
                id={ id }
                resource={ resource }
                groupedEvents={ groupedEvents }
                groupedBackgroundEvents={ groupedBackgroundEvents }
                min={ min }
                max={ max }
              />
            ))
          })
          : range.map((date) => {
            return (
              <div style={ { display: "flex", minHeight: "100%", flex: 1 } } key={ date.toISOString() }>
                { resourceManager.map(([id, resource]) => (
                  <div style={ { flex: 1 } } key={ accessors.resourceId(resource) }>
                    <DayColumnWrapper
                      date={ date }
                      id={ id }
                      resource={ resource }
                      groupedEvents={ groupedEvents }
                      groupedBackgroundEvents={ groupedBackgroundEvents }
                      min={ min }
                      max={ max }
                    />
                  </div>
                )) }
              </div>
            )
          }) }
      </div>
    </>
  )
}

export { ResourcesLayout }
