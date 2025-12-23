import unicodedata

def detect_language_by_script(text: str) -> str:
    for ch in text or "":
        if 0x0980 <= ord(ch) <= 0x09FF:
            return 'bn'
    return 'en'

def has_disallowed_letters(text: str) -> bool:
    for ch in text or "":
        cat = unicodedata.category(ch)
        if not cat.startswith('L'):
            continue

        o = ord(ch)
        if 0x0980 <= o <= 0x09FF:
            continue
        if 0x0041 <= o <= 0x005A or 0x0061 <= o <= 0x007A:
            continue

        return True
    return False