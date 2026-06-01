// Availability — status strip under the nav.

interface AvailabilityProps {
  available?: boolean
  onGetInTouch: () => void
}

export function Availability({ available = true, onGetInTouch }: AvailabilityProps) {
  return (
    <div className={`availability ${available ? '' : 'is-busy'}`}>
      <span className="avail-dot" />
      <span>New York metropolitan area.</span>
      <span className="avail-sep">·</span>
      <span>{available ? 'Open to conversations' : 'Currently at Citi · Open to chat'}</span>
      <button
        type="button"
        className="avail-cta"
        onClick={onGetInTouch}
      >
        Get in touch →
      </button>
    </div>
  )
}
