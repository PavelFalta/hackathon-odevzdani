type MapTimeWheelClockProps = {
  readout: string
}

export function MapTimeWheelClock({ readout }: MapTimeWheelClockProps) {
  return (
    <div className="map-time-wheel__clock">
      <span className="map-time-wheel__clock-caption">Aktuální čas</span>
      <span className="map-time-wheel__clock-value" aria-live="polite">
        {readout}
      </span>
    </div>
  )
}
