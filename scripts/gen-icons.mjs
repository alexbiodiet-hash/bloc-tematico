// Genera public/icon-192.png y public/icon-512.png
// Círculo índigo (#4F46E5) con fondo blanco, sin dependencias pesadas.

import { PNG } from 'pngjs'
import { writeFileSync } from 'fs'

function crearIcono(size) {
  const png = new PNG({ width: size, height: size, filterType: -1 })
  const cx = size / 2
  const cy = size / 2
  const r  = size / 2 - size * 0.05   // margen del 5%
  const r2 = r * 0.55                  // radio del "agujero" interior (donut)

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx  = (y * size + x) * 4
      const dist = Math.hypot(x - cx, y - cy)

      if (dist <= r) {
        // Fondo redondeado blanco
        png.data[idx]     = 255
        png.data[idx + 1] = 255
        png.data[idx + 2] = 255
        png.data[idx + 3] = 255

        if (dist <= r && dist >= r2) {
          // Anillo índigo exterior
          png.data[idx]     = 79
          png.data[idx + 1] = 70
          png.data[idx + 2] = 229
          png.data[idx + 3] = 255
        } else if (dist < r2) {
          // Interior: color más claro (#e0e7ff indigo-100)
          png.data[idx]     = 224
          png.data[idx + 1] = 231
          png.data[idx + 2] = 255
          png.data[idx + 3] = 255

          // Letra "B" simplificada: rectángulo central
          const mx = size * 0.38, my = size * 0.30
          const mw = size * 0.24, mh = size * 0.40
          if (x >= mx && x <= mx + mw && y >= my && y <= my + mh) {
            png.data[idx]     = 79
            png.data[idx + 1] = 70
            png.data[idx + 2] = 229
            png.data[idx + 3] = 255
          }
        }
      } else {
        // Fuera del círculo: transparente
        png.data[idx + 3] = 0
      }
    }
  }

  return PNG.sync.write(png)
}

writeFileSync('public/icon-192.png', crearIcono(192))
writeFileSync('public/icon-512.png', crearIcono(512))

console.log('✓ public/icon-192.png y public/icon-512.png generados')
