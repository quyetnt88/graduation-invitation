import { toPng } from 'html-to-image'

// Turns a guest name into a safe file name: "Chị Lan" -> "thiep-moi-chi-lan.png"
function fileNameFor(guest) {
  const slug = guest
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `thiep-moi-${slug || 'tot-nghiep'}.png`
}

const CARD_FONTS = [
  '700 1em "Dancing Script"',
  '600 1em "Dancing Script"',
  '500 1em "Playfair Display"',
  '700 1em "Playfair Display"',
  '400 1em "Be Vietnam Pro"',
  'italic 400 1em "Be Vietnam Pro"',
  '500 1em "Be Vietnam Pro"',
  '600 1em "Be Vietnam Pro"',
]

// Renders the card inside `node` to a PNG and saves it. Throws if the picture can't be made.
export async function downloadCard(node, guest) {
  // Hide live-only bits (RSVP, countdown, map link); CSS rebalances the columns for the picture
  node.classList.add('is-capturing')
  try {
    // Short timer instead of requestAnimationFrame, which never fires in background/hidden tabs
    await new Promise((resolve) => setTimeout(resolve, 50))
    // Make sure every font the card uses is loaded first, otherwise the picture falls back to system fonts
    await Promise.all(CARD_FONTS.map((font) => document.fonts.load(font, 'Nguyễn Đạt')))
    await document.fonts.ready
    const dataUrl = await toPng(node, { pixelRatio: 2, cacheBust: true })
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = fileNameFor(guest)
    a.click()
  } finally {
    node.classList.remove('is-capturing')
  }
}
