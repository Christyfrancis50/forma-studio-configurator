import { useStore } from '../store'
import { PRODUCTS } from '../products'
import { MATERIALS } from '../materials'

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
export const fmt = (n) => money.format(n)

export function Panel() {
  const product = useStore((s) => s.product)
  const cfg = useStore((s) => s.config[product])
  const activeId = useStore((s) => s.activePart[product])
  const setActivePart = useStore((s) => s.setActivePart)
  const update = useStore((s) => s.update)

  const P = PRODUCTS[product]
  const idx = P.parts.findIndex((p) => p.id === activeId)
  const part = P.parts[idx]
  const sel = cfg[part.id]
  const colorName = part.colors.find((c) => c.hex.toLowerCase() === sel.color.toLowerCase())?.name ?? 'Custom'
  const go = (d) => setActivePart(P.parts[(idx + d + P.parts.length) % P.parts.length].id)

  return (
    <aside className="panel" key={product}>
      <div className="panel-head">
        <span className="eyebrow">Customise</span>
        <span className="step">
          {String(idx + 1).padStart(2, '0')} / {String(P.parts.length).padStart(2, '0')}
        </span>
      </div>

      <div className="parts" role="tablist" aria-label="Parts">
        {P.parts.map((p) => (
          <button key={p.id} role="tab" aria-selected={p.id === activeId} className={`part ${p.id === activeId ? 'active' : ''}`} onClick={() => setActivePart(p.id)}>
            <span className="dot" style={{ background: cfg[p.id].color }} />
            {p.label}
          </button>
        ))}
      </div>

      <div className="section" key={part.id}>
        <div className="section-head">
          <h3>Material</h3>
          <span className="muted">{MATERIALS[sel.material].label}</span>
        </div>
        <div className="materials">
          {part.materials.map((m) => {
            const price = MATERIALS[m].price * P.priceScale
            return (
              <button key={m} className={`mat ${sel.material === m ? 'active' : ''}`} onClick={() => update({ material: m })}>
                <span className={`mat-chip chip-${m}`} style={{ '--c': sel.color }} />
                <span className="mat-label">{MATERIALS[m].label}</span>
                <span className="mat-price">{price ? `+${fmt(price)}` : 'Included'}</span>
              </button>
            )
          })}
        </div>

        <div className="section-head">
          <h3>Colour</h3>
          <span className="muted">
            {colorName} <code>{sel.color.toUpperCase()}</code>
          </span>
        </div>
        <div className="swatches">
          {part.colors.map((c) => (
            <button
              key={c.hex}
              title={c.name}
              aria-label={c.name}
              className={`swatch ${sel.color.toLowerCase() === c.hex.toLowerCase() ? 'active' : ''}`}
              style={{ '--c': c.hex }}
              onClick={() => update({ color: c.hex })}
            />
          ))}
          <label className={`swatch custom ${colorName === 'Custom' ? 'active' : ''}`} title="Custom colour">
            <input type="color" value={sel.color} onChange={(e) => update({ color: e.target.value })} />
          </label>
        </div>
      </div>

      <div className="panel-nav">
        <button className="ghost" onClick={() => go(-1)}>
          ← {P.parts[(idx - 1 + P.parts.length) % P.parts.length].label}
        </button>
        <button className="ghost" onClick={() => go(1)}>
          {P.parts[(idx + 1) % P.parts.length].label} →
        </button>
      </div>
    </aside>
  )
}
