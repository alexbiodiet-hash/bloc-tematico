import { app, BrowserWindow, shell, Tray, Menu, nativeImage } from 'electron'
import path from 'path'
import fs from 'fs'

const isDev = !app.isPackaged
let isQuitting = false

// ── Estado de la ventana ──────────────────────────────────────

interface WindowBounds { x?: number; y?: number; width: number; height: number }

function rutaEstado(): string {
  return path.join(app.getPath('userData'), 'window-state.json')
}

function cargarEstado(): WindowBounds {
  try {
    return JSON.parse(fs.readFileSync(rutaEstado(), 'utf8')) as WindowBounds
  } catch {
    return { width: 1280, height: 820 }
  }
}

function guardarEstado(win: BrowserWindow) {
  if (win.isMaximized() || win.isMinimized()) return
  try {
    fs.writeFileSync(rutaEstado(), JSON.stringify(win.getBounds()))
  } catch { /* sin acceso a disco → ignorar */ }
}

// ── Icono programático para la bandeja ───────────────────────
// Círculo indigo 32×32 generado con pixels RGBA sin dependencias externas

function crearIcono(): Electron.NativeImage {
  const size = 32
  const buf = Buffer.alloc(size * size * 4)
  const cx = size / 2, cy = size / 2, r = size / 2 - 2
  for (let i = 0; i < size * size; i++) {
    const x = i % size
    const y = Math.floor(i / size)
    if (Math.hypot(x - cx, y - cy) <= r) {
      buf[i * 4 + 0] = 79   // R  (#4F46E5 indigo)
      buf[i * 4 + 1] = 70   // G
      buf[i * 4 + 2] = 229  // B
      buf[i * 4 + 3] = 255  // A
    } else {
      buf[i * 4 + 3] = 0    // transparente
    }
  }
  return nativeImage.createFromBitmap(buf, { width: size, height: size })
}

// ── Ventana principal ─────────────────────────────────────────

let tray: Tray | null = null

function crearVentana() {
  const bounds = cargarEstado()

  const win = new BrowserWindow({
    ...bounds,
    minWidth: 640,
    minHeight: 500,
    title: 'Bloc Temático',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (isDev) {
    win.loadURL('http://localhost:5273')
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // Guardar posición y tamaño cada vez que cambian
  win.on('resize', () => guardarEstado(win))
  win.on('move',   () => guardarEstado(win))

  // Pulsar X → ocultar a la bandeja (no salir)
  win.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault()
      win.hide()
    }
  })

  // Links externos → navegador del sistema, no en Electron
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url)
    }
    return { action: 'deny' }
  })

  // ── Bandeja del sistema ───────────────────────────────────

  const icono = crearIcono()
  tray = new Tray(icono)
  tray.setToolTip('Bloc Temático')

  // Click en el icono: alternar visibilidad
  tray.on('click', () => {
    if (win.isVisible()) {
      win.hide()
    } else {
      win.show()
      win.focus()
    }
  })

  // Menú contextual (botón derecho sobre el icono)
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: 'Mostrar / Ocultar',
        click: () => {
          if (win.isVisible()) {
            win.hide()
          } else {
            win.show()
            win.focus()
          }
        },
      },
      { type: 'separator' },
      {
        label: 'Salir',
        click: () => {
          isQuitting = true
          app.quit()
        },
      },
    ])
  )
}

// ── Ciclo de vida de la app ───────────────────────────────────

app.whenReady().then(() => {
  crearVentana()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) crearVentana()
  })
})

// Marcar isQuitting antes de que Electron empiece a cerrar ventanas
app.on('before-quit', () => { isQuitting = true })

// La app vive en la bandeja → no cerramos al quedar sin ventanas visibles
app.on('window-all-closed', () => {
  if (process.platform === 'darwin') app.quit()
})
