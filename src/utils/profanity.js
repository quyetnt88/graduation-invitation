// Simple profanity check for the guest name (Vietnamese + a few English words).
// Matching is done on whole words so normal names like "Long", "Đức", "Cúc" don't get flagged.

// Words with diacritics, matched exactly as a whole word (lowercased).
// Family words like "mẹ", "má" are left out on purpose — guests may legitimately be "Ba Mẹ".
const BAD_WORDS_ACCENTED = [
  'lồn', 'lìn', 'buồi', 'cặc', 'cạc', 'đụ', 'địt', 'đĩ', 'đéo', 'điếm', 'cứt', 'đái', 'ỉa',
  'ngu', 'đần', 'khùng', 'chó', 'lòn', 'lọn', 'kặc', 'cặk', 'cạk',
]

// Accent-free spellings and teen-code abbreviations, matched as a whole word
const BAD_WORDS_PLAIN = [
  'dm', 'dmm', 'dcm', 'dcmm', 'dkm', 'dmcs', 'dit', 'cac', 'cak', 'kak', 'kac', 'cax', 'kax',
  'loz', 'lol', 'lon', 'lonz', 'kc', 'cmn',
  'buoi', 'vcl', 'vkl', 'vl', 'cl', 'clm', 'cmm', 'cmnr', 'occho',
  'fuck', 'fck', 'fuk', 'shit', 'bitch', 'cunt', 'pussy', 'asshole', 'bastard', 'damn',
]

// Multi-word phrases (accent-free), matched on word boundaries
const BAD_PHRASES = [
  'du ma', 'du me', 'dit me', 'dit con', 'con me may', 'me may', 'cha may', 'bo may',
  'oc cho', 'suc vat', 'khon nan', 'mat day', 'do ngu', 'thang ngu', 'con cho',
  'cho chet', 'deo biet', 'vai lon', 'vai l',
]

// Distinctive chunks that are still caught when people glue letters together ("ditme", "fuckkk")
const BAD_CHUNKS = ['ditme', 'ditcon', 'dcm', 'dkm', 'vcl', 'vkl', 'fuck', 'shit', 'bitch', 'cunt', 'pussy', 'concac']

const LEET = { 0: 'o', 1: 'i', 3: 'e', 4: 'a', 5: 's', 7: 't', '@': 'a', $: 's', '!': 'i' }

function stripAccents(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
}

// "đ.m.m", "F U C K", "đmmmm" -> comparable plain words
function toPlainWords(text) {
  const plain = stripAccents(text)
    .replace(/[013457@$!]/g, (c) => LEET[c])
    .replace(/[^a-z\s]/g, '')
    .replace(/(.)\1{2,}/g, '$1$1')
  return plain.split(/\s+/).filter(Boolean)
}

export function containsProfanity(input) {
  const lower = input.toLowerCase().normalize('NFC')

  const accentedWords = lower.split(/[^\p{L}]+/u).filter(Boolean)
  if (accentedWords.some((w) => BAD_WORDS_ACCENTED.includes(w))) return true

  const words = toPlainWords(lower)
  // Also try with doubled letters collapsed so "dmm" style spam still matches
  const collapsed = words.map((w) => w.replace(/(.)\1+/g, '$1'))
  if ([...words, ...collapsed].some((w) => BAD_WORDS_PLAIN.includes(w))) return true

  const sentence = ` ${words.join(' ')} `
  if (BAD_PHRASES.some((p) => sentence.includes(` ${p} `))) return true

  // Catches "d i t m e" / "đ-ị-t" style spacing
  const glued = words.join('')
  return BAD_CHUNKS.some((chunk) => glued.includes(chunk))
}
