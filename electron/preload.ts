// Preload intencionalmente mínimo.
// La app solo usa Supabase (red) y APIs de navegador estándar.
// No es necesario exponer ninguna API de Node al renderer.

// contextBridge se importa pero no se usa: sirve como placeholder
// si en el futuro necesitas exponer algo de forma segura.
import { contextBridge } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // Nada por ahora — espacio reservado para futuras extensiones
})
