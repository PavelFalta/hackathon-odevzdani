export function createBrowserFrameBlobUrl(html: string): string {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  return URL.createObjectURL(blob)
}

export function revokeBrowserFrameBlob(url: string | null) {
  if (url?.startsWith('blob:')) URL.revokeObjectURL(url)
}
