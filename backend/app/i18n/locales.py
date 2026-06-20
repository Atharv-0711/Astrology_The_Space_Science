from dataclasses import asdict, dataclass

from app.astrology.constants import NAKSHATRAS, PLANETS, SIGNS


@dataclass(frozen=True)
class LocaleDefinition:
    code: str
    name: str
    native_name: str
    region: str
    direction: str = "ltr"


SUPPORTED_LOCALES: tuple[LocaleDefinition, ...] = (
    LocaleDefinition("en", "English", "English", "india"),
    LocaleDefinition("hi", "Hindi", "हिन्दी", "india"),
    LocaleDefinition("bn", "Bengali", "বাংলা", "india"),
    LocaleDefinition("te", "Telugu", "తెలుగు", "india"),
    LocaleDefinition("mr", "Marathi", "मराठी", "india"),
    LocaleDefinition("ta", "Tamil", "தமிழ்", "india"),
    LocaleDefinition("ur", "Urdu", "اردو", "india", "rtl"),
    LocaleDefinition("gu", "Gujarati", "ગુજરાતી", "india"),
    LocaleDefinition("kn", "Kannada", "ಕನ್ನಡ", "india"),
    LocaleDefinition("ml", "Malayalam", "മലയാളം", "india"),
    LocaleDefinition("or", "Odia", "ଓଡ଼ିଆ", "india"),
    LocaleDefinition("pa", "Punjabi", "ਪੰਜਾਬੀ", "india"),
    LocaleDefinition("as", "Assamese", "অসমীয়া", "india"),
    LocaleDefinition("sa", "Sanskrit", "संस्कृतम्", "india"),
    LocaleDefinition("kok", "Konkani", "कोंकणी", "india"),
    LocaleDefinition("mni", "Manipuri", "মৈতৈলোন্", "india"),
    LocaleDefinition("brx", "Bodo", "बड़ो", "india"),
    LocaleDefinition("doi", "Dogri", "डोगरी", "india"),
    LocaleDefinition("mai", "Maithili", "मैथिली", "india"),
    LocaleDefinition("sat", "Santali", "ᱥᱟᱱᱛᱟᱲᱤ", "india"),
    LocaleDefinition("ks", "Kashmiri", "کٲشُر", "india", "rtl"),
    LocaleDefinition("sd", "Sindhi", "سنڌي", "india", "rtl"),
    LocaleDefinition("ne", "Nepali", "नेपाली", "india"),
    LocaleDefinition("fr", "French", "Français", "global"),
    LocaleDefinition("es", "Spanish", "Español", "global"),
    LocaleDefinition("de", "German", "Deutsch", "global"),
    LocaleDefinition("pt", "Portuguese", "Português", "global"),
    LocaleDefinition("ru", "Russian", "Русский", "global"),
    LocaleDefinition("ar", "Arabic", "العربية", "global", "rtl"),
    LocaleDefinition("ja", "Japanese", "日本語", "global"),
    LocaleDefinition("ko", "Korean", "한국어", "global"),
    LocaleDefinition("zh-Hans", "Chinese Simplified", "简体中文", "global"),
    LocaleDefinition("zh-Hant", "Chinese Traditional", "繁體中文", "global"),
    LocaleDefinition("th", "Thai", "ไทย", "global"),
    LocaleDefinition("vi", "Vietnamese", "Tiếng Việt", "global"),
    LocaleDefinition("id", "Indonesian", "Bahasa Indonesia", "global"),
    LocaleDefinition("tr", "Turkish", "Türkçe", "global"),
    LocaleDefinition("it", "Italian", "Italiano", "global"),
    LocaleDefinition("nl", "Dutch", "Nederlands", "global"),
)

SUPPORTED_LOCALE_CODES = {locale.code for locale in SUPPORTED_LOCALES}
RTL_LOCALE_CODES = {locale.code for locale in SUPPORTED_LOCALES if locale.direction == "rtl"}


def serialize_supported_locales() -> list[dict[str, str]]:
    return [asdict(locale) for locale in SUPPORTED_LOCALES]


def canonical_term_layers() -> dict[str, list[str]]:
    return {
        "planets": [planet.name for planet in PLANETS],
        "signs": [sign.name for sign in SIGNS],
        "nakshatras": [nakshatra.name for nakshatra in NAKSHATRAS],
        "chart_labels": ["planet", "sign", "degree", "house", "nakshatra", "pada", "motion"],
        "panchanga_terms": ["tithi", "vara", "nakshatra", "yoga", "karana", "sunrise", "sunset"],
        "dasha_terms": ["mahadasha", "antardasha", "pratyantar", "sookshma", "prana", "vimshottari", "mudda"],
        "yoga_names": ["Ithasala", "Isharafa", "Kamboola", "Nakta", "Yamaya", "Manahoo", "Radda"],
        "varshphal_terms": ["Varshphal", "Tajika", "Muntha", "Munthesh", "Saham", "Varsh Pravesh"],
        "interpretation_terms": ["career", "relationships", "wealth", "spiritual", "caution", "health", "education", "travel"],
    }
