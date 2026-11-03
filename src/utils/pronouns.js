// Vietnamese pronouns picked from the first word of the guest's name.
// you  = how the card addresses the guest ("Sự hiện diện của chị...")
// me   = how the graduate refers to himself ("em rất vui...")
// self = how the guest refers to themselves on the RSVP button ("Chị sẽ đến")
const BY_TITLE = {
  anh: { you: 'anh', me: 'em', self: 'anh' },
  chị: { you: 'chị', me: 'em', self: 'chị' },
  em: { you: 'em', me: 'anh', self: 'em' },
  thầy: { you: 'thầy', me: 'em', self: 'thầy' },
  cô: { you: 'cô', me: 'em', self: 'cô' },
  chú: { you: 'chú', me: 'cháu', self: 'chú' },
  bác: { you: 'bác', me: 'cháu', self: 'bác' },
}

const DEFAULT = { you: 'bạn', me: 'mình', self: 'mình' }

export function pronounsFor(guest) {
  const first = String(guest ?? '').trim().split(/\s+/)[0].toLowerCase().normalize('NFC')
  return BY_TITLE[first] ?? DEFAULT
}

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1)

// "{You} sẽ đến chứ?" -> "Chị sẽ đến chứ?"; lowercase key keeps lowercase, capitalized key capitalizes
export function fillPronouns(text, pronouns) {
  return text.replace(/\{(you|me|self)\}/gi, (_, key) => {
    const word = pronouns[key.toLowerCase()]
    return key[0] === key[0].toUpperCase() ? capitalize(word) : word
  })
}
