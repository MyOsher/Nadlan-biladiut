# ניהול נכסים — Nadlan Biladiut

מערכת לניהול נכסים עבור סוכן/מתווך נדל״ן. לכל נכס יש "דף" המבוסס על **הזמנת שירותי
תיווך בבלעדיות** החתומה על ידי הבעלים, מעקב אחר **תאריך סיום הבלעדיות** (עד מתי הנכס
שלך למכירה/השכרה), כל פרטי הנכס בשדות הניתנים לעריכה, וכן **תמונות וסרטונים** הנשמרים
בענן.

A Hebrew (RTL) real-estate property manager for a single agent. Each property is
backed by an Israeli **exclusive brokerage agreement**; the app tracks the
**exclusivity expiry date**, all editable property fields, owner/client details,
photos & videos, digital or scanned signatures, and sends **expiry reminder
emails**.

---

## תכונות / Features

- **לוח בקרה (Dashboard)** — כל הנכסים, חיפוש וסינון, סטטיסטיקות, והתראות צבע על נכסים
  שהבלעדיות שלהם מסתיימת בקרוב (ירוק / כתום / אדום לפי הימים שנותרו).
- **דף נכס (Property page)** — טופס דיגיטלי המשחזר את הסכם הבלעדיות, כל השדות ניתנים
  לעריכה: סוג נכס, חדרים, כתובת, גוש/חלקה/תת-חלקה, מחיר מבוקש, בעלים, עמלות, תקופת
  בלעדיות ועוד.
- **טופס חתום** — גם חתימה דיגיטלית על המסך (לקוח + מתווך) **וגם** העלאת סריקה/צילום של
  הטופס החתום.
- **מדיה** — העלאת תמונות וסרטונים, גלריה, בחירת תמונה ראשית, מחיקה.
- **הדפסת הסכם** — תצוגת הסכם מודפסת/PDF הממולאת מנתוני הנכס.
- **תזכורות בלעדיות** — תצוגה בלוח הבקרה + שליחת **אימייל אוטומטי** לפני סיום הבלעדיות.
- **הגדרות** — פרטי המתווך, עמלות ברירת מחדל, וימי התזכורת.

## ארכיטקטורה / Stack

- **Next.js 14** (App Router, TypeScript) + **Tailwind CSS**, RTL בעברית.
- **Supabase** — Postgres (נתונים) + Storage (תמונות/סרטונים/סריקות) + Edge Function
  לתזכורות + pg_cron לתזמון יומי.
- פריסה מומלצת ל-**Vercel**.

```
src/
  app/
    page.tsx                       לוח הבקרה
    properties/new/page.tsx        יצירת נכס חדש (טופס הבלעדיות)
    properties/[id]/page.tsx       דף נכס — עריכה, מדיה, חתימות
    properties/[id]/print/page.tsx תצוגת הסכם להדפסה
    settings/page.tsx              הגדרות
  components/  SignaturePad, MediaManager, OwnersEditor
  lib/         supabase client, types, utils
supabase/
  migrations/  סכמה, מדיניות גישה, תזמון cron
  functions/expiry-reminders/  Edge Function לשליחת תזכורות
```

---

## הרצה מקומית / Local development

```bash
npm install
cp .env.example .env.local   # ערכו עם פרטי פרויקט ה-Supabase שלכם
npm run dev                  # http://localhost:3000
```

`.env.local` (כבר מוגדר לפרויקט "Haneches db"):

```
NEXT_PUBLIC_SUPABASE_URL=https://kovjbfdgllnprryqvgon.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

> מפתח ה-`anon`/publishable מיועד לצד-לקוח והוא בטוח לחשיפה; ההגנה היא דרך RLS.

## פריסה ל-Vercel / Deploy

1. ייבאו את ה-repo ב-Vercel (framework: Next.js).
2. הגדירו את שני משתני הסביבה `NEXT_PUBLIC_SUPABASE_URL` ו-`NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Deploy.

---

## תזכורות אימייל / Email reminders

הלוגיקה כבר פרוסה: Edge Function בשם `expiry-reminders` רץ **כל יום ב-06:00 UTC**
(דרך `pg_cron`), מוצא נכסים פעילים שהבלעדיות שלהם מסתיימת בעוד 14/7/3/1 ימים (ניתן
לשינוי בהגדרות), ושולח אימייל מרוכז.

כדי שהאימיילים יישלחו בפועל יש להוסיף מפתח של ספק דוא״ל ([Resend](https://resend.com),
חינמי):

1. ב-Supabase: **Edge Functions → expiry-reminders → Secrets** הוסיפו:
   - `RESEND_API_KEY` = המפתח מ-Resend.
   - `REMINDER_FROM` (אופציונלי) = כתובת שולח מאומתת. ברירת מחדל `onboarding@resend.dev`
     (מתאים לבדיקות; שולח רק לכתובת שאיתה נרשמתם ל-Resend).
2. הזינו את כתובת הדוא״ל שלכם במסך **הגדרות** באפליקציה (`agent_email`).

בדיקה ידנית של הפונקציה:

```bash
curl -X POST https://kovjbfdgllnprryqvgon.supabase.co/functions/v1/expiry-reminders
```

ללא `RESEND_API_KEY` או ללא דוא״ל מוגדר — הפונקציה לא תקרוס, אלא תחזיר הסבר בלבד.

---

## בוט טלגרם / Telegram bot

הבוט (**@Haneches_bot**) עושה שני דברים:

1. **התראות** — שולח כל בוקר **סיכום יומי** של הנכסים הפעילים עם הימים שנותרו לבלעדיות,
   ומדגיש נכסים שמסתיימים בקרוב (אותו `pg_cron` יומי שמפעיל את `expiry-reminders`).
2. **העלאת טפסים** — שולחים לבוט **צילום או PDF של טופס בלעדיות חתום**, והוא:
   שומר את הקובץ ב-Storage, **קורא את השדות באמצעות AI** (אם הוגדר מפתח Anthropic),
   ויוצר **נכס חדש כטיוטה** עם הפרטים שמולאו — מוכן לבדיקה והשלמה באפליקציה.

**חיבור:** פותחים את [t.me/Haneches_bot](https://t.me/Haneches_bot), שולחים `/start`,
ו-`telegram_chat_id` נשמר אוטומטית. אפשר לבדוק את הסטטוס במסך **הגדרות**.

**ארכיטקטורה:**
- `supabase/functions/telegram-webhook` — מקבל עדכוני Telegram (פקודות + טפסים).
  פרוס עם `verify_jwt=false` ומאומת באמצעות `secret_token` של Telegram.
- ה-webhook נרשם פעם אחת דרך `GET .../telegram-webhook?setup=1`.
- סודות (`telegram_bot_token`, `telegram_webhook_secret`, ובאופן אופציונלי
  `anthropic_api_key`, `app_base_url`) נשמרים בטבלה הפרטית `app_secrets`
  (RLS ללא policies → לא נגיש מהדפדפן; רק service-role של פונקציות הקצה).

**הפעלת קריאת AI לטפסים:** הוסיפו מפתח Anthropic לטבלת הסודות:

```sql
insert into public.app_secrets(key,value) values ('anthropic_api_key','sk-ant-...')
on conflict (key) do update set value = excluded.value;
```

ללא המפתח — הבוט עדיין שומר את הטופס ויוצר טיוטה, פשוט בלי מילוי אוטומטי.

## הערות אבטחה / Security notes

- כרגע האפליקציה **ללא התחברות (no login)** לפי הבחירה. מדיניות ה-RLS פתוחה
  (`using (true)`) כך שכל מי שמחזיק במפתח ה-publishable יכול לקרוא/לכתוב. זה מתאים
  לשימוש אישי, אך **לא** לחשיפה ציבורית עם נתונים רגישים.
- כשנרצה להוסיף התחברות: להוסיף Supabase Auth, עמודת `owner_id` לטבלאות, ולהחליף את
  מדיניות ה-"open access" במדיניות מבוססת `auth.uid()`. גם דלי ה-`signed-forms`
  (מכיל ת"ז וחתימות) כדאי להפוך לפרטי עם Signed URLs.

## בסיס הנתונים / Database

הסכמה כוללת: `properties`, `property_owners`, `property_media`, `app_settings`,
ושני דליי אחסון `property-media` ו-`signed-forms`. ראו `supabase/migrations/`.
