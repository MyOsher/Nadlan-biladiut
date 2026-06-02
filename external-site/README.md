# עמוד נכס ציבורי לאתר החיצוני

תיקייה זו מכילה **דף פתיחה עצמאי** לעמוד נכס באתר שלך, וכן brief מוכן לעיצוב ב-Claude.
הנתונים מגיעים מ-Edge Function `public-listings` (ראו `../supabase/functions/public-listings`).

## `property.html` — דף הפתיחה

קובץ HTML עצמאי (Tailwind דרך CDN, בלי build). מה הוא עושה:

- פותחים אותו ישירות בדפדפן → נטען עם **נתוני דמה** (כדי לראות עיצוב מיד).
- מוסיפים `?slug=<slug>` ל-URL → מושך **נתונים אמיתיים** מה-API ומציג אותם.
- כולל: גלריה עם תמונה ראשית + תמונות ממוזערות, מחיר, ספציפיקציות (חדרים/מ"ר/קומה),
  תיאור, וכרטיס יצירת קשר דביק עם כפתורי **וואטסאפ** ו**טלפון**.

לפני שימוש אמיתי ערכו שתי שורות בראש הקובץ:

```js
const API_BASE    = "https://kovjbfdgllnprryqvgon.supabase.co/functions/v1/public-listings";
const AGENT_PHONE = "972500000000"; // מספר וואטסאפ/טלפון בפורמט בינלאומי, בלי +
```

---

## Brief לעיצוב ב-Claude (להעתיק כפי שהוא)

> עצב לי עמוד נכס למתווך נדל"ן (RTL, עברית, רספונסיבי). מבנה הנתונים שמגיע מ-API:
>
> ```json
> {
>   "property_address": "הרצל 25", "city": "תל אביב",
>   "deal_type": "sale",            // "sale"=למכירה, "rent"=להשכרה
>   "property_type": "דירה",
>   "rooms": 4, "size_sqm": 105, "floor": "3",
>   "asking_price": 2450000,        // להציג עם toLocaleString("he-IL") + " ₪"
>   "public_description": "טקסט תיאור שיווקי...",
>   "cover_image_url": "https://.../cover.jpg",
>   "media": [ { "type": "image", "url": "https://.../1.jpg", "caption": "סלון" } ]
> }
> ```
>
> דרישות עיצוב:
> - גלריית תמונות מרשימה: תמונה ראשית גדולה (`cover_image_url` או הראשונה ב-`media`)
>   + רצועת תמונות ממוזערות נגללת מתוך `media` (לחיצה מחליפה את התמונה הראשית).
>   תמיכה גם ב-`type:"video"`.
> - כותרת: `property_address, city`. תגית "למכירה/להשכרה" לפי `deal_type`.
> - מחיר בולט (`asking_price`).
> - שורת ספציפיקציות עם אייקונים: חדרים, מ"ר, קומה, סוג נכס.
> - אזור תיאור (`public_description`, לשמור על שורות חדשות).
> - כרטיס יצירת קשר דביק (sticky) עם כפתור וואטסאפ ירוק וכפתור התקשרות.
> - פלטת צבעים: כחול מותג ‎#2152d8‎, רקע ‎slate-50‎, פונט Heebo.
> - הוצא קוד כקובץ HTML יחיד עם Tailwind, או כקומפוננטת React — לבחירתך.
>
> אל תמציא שדות שלא ברשימה (אין שם בעלים/ת"ז/עמלות — אלה לא נחשפים).

---

## חיבור הנתונים בסוף (אחרי שהעיצוב מוכן)

מחליפים נתוני דמה ב-fetch אחד לפי ה-slug שמופיע ב-URL:

```js
const slug = new URLSearchParams(location.search).get("slug");
const data = await fetch(`${API_BASE}?slug=${slug}`).then(r => r.json());
// data.property_address, data.asking_price, data.media[] ...
```

לעמוד קטלוג של כל הנכסים: `fetch(API_BASE)` → `{ listings: [...] }`.

## דרוש פעם אחת בצד Supabase

1. הרצת מיגרציה `0006_public_listing_fields.sql`.
2. `supabase functions deploy public-listings --no-verify-jwt`.
3. בעמוד הנכס באדמין → "פרסום באתר" → הפעלה והעתקת ה-slug.
