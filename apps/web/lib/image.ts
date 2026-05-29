'use client'

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = (e) => {
      URL.revokeObjectURL(url)
      reject(e)
    }
    img.src = url
  })
}

/**
 * Reduce una foto a un JPEG compacto (data URL) para guardarla inline en el
 * feature sin necesidad de un bucket de Storage. Se mantiene chico para no
 * pasar el límite de 1MB por documento de Firestore.
 */
export async function fileToCompressedDataUrl(file: File, maxSize = 1024, quality = 0.6): Promise<string> {
  const img = await loadImage(file)
  const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
  const w = Math.max(1, Math.round(img.width * scale))
  const h = Math.max(1, Math.round(img.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No se pudo procesar la imagen')
  ctx.drawImage(img, 0, 0, w, h)
  return canvas.toDataURL('image/jpeg', quality)
}
