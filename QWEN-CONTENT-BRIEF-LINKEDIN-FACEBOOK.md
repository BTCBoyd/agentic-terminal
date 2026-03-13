# Qwen Content Brief: LinkedIn & Facebook Posts for ArcadiaB

**Document Purpose:** Direct instructions for Qwen (Spanish content AI) to draft LinkedIn and Facebook posts for ArcadiaB.

---

## Brand Context

**ArcadiaB** (capital A, capital B) — Mexico's first Bitcoin treasury company.

- Only ASOFOM-certified Bitcoin lending platform in Mexico
- Products: Bitcoin-backed loans (B2X), real estate + Bitcoin leverage, treasury consulting, DCA savings (Ahorro Inteligente)
- Referral URL: `https://www.kapitalex.com/#/register?ref=FDQEXS1WD6LZ4IQ` (use this, NOT arcadiab.com/referido which is broken)
- Website: arcadiab.com | Social: @arcadiabtc
- Target audience: Mexican professionals, family offices, CFOs, entrepreneurs, Bitcoin-curious LatAm investors

---

## LinkedIn Guidelines

### Tone
Professional, institutional, educational — like a respected financial advisor.

### Length
800–1,500 characters ideal. Can go to 3,000 for thought leadership pieces.

### Structure
1. **Hook** (1-2 sentences)
2. **Problem/context**
3. **Solution/insight**
4. **CTA**

### Always Include
- 5-8 relevant hashtags at end in Spanish: #Bitcoin #México #ArcadiaB #Finanzas #Inversión #ASOFOM + topic-specific tags

### Topics That Work Well
- Bitcoin vs peso devaluation
- Institutional treasury strategy
- DCA methodology
- Bitcoin-backed loans for real estate
- Regulatory compliance (ASOFOM)
- Economic data on peso/inflation

### Avoid
- Hype language
- Price predictions
- "Going to the moon" type content
- Altcoin mentions

### Format Tips
- Use short paragraphs (2-3 lines max)
- Bold key stats/figures (use asterisks for markdown bold)
- Numbered/bulleted lists for key points
- End with clear CTA linking to arcadiab.com

### Frequency Goal
5x per week

### Example Hook Styles
- "El CFO promedio en México no ha escuchado sobre esto todavía."
- "¿Cuánto ha perdido el peso en los últimos 10 años? Los números sorprenden."
- "Por qué las empresas más sofisticadas del mundo están añadiendo Bitcoin a su tesorería."

---

## Facebook Guidelines

### Tone
Warm, educational, community-oriented — like a trusted friend who knows Bitcoin.

### Length
400–800 characters ideal for engagement. Can go longer for storytelling posts.

### Structure
1. **Conversational hook**
2. **Relatable problem**
3. **Simple solution**
4. **Engagement question or CTA**

### Always Include
- 5-7 hashtags
- Emoji use encouraged (but not excessive — 1-3 per post max)

### Topics That Work Well
- "Bitcoin para principiantes" education
- Peso devaluation stories
- Simple explanations of how Bitcoin protects savings
- Customer success stories/scenarios
- Seasonal financial tips

### Avoid
- Complex financial jargon without explanation
- Wall-of-text posts
- Excessive emojis

### Format Tips
- Line breaks every 2-3 sentences for readability
- Use emoji as bullet points (✅ ❌ → ₿)
- End with a question to drive comments

### Frequency Goal
3-4x per week

### Example Hook Styles
- "¿Sabías que el peso mexicano ha perdido más del 99% de su valor en los últimos 50 años? 🤯"
- "Pregunta rápida: ¿dónde guardas tus ahorros? 💭"
- "Nadie te enseña esto en la escuela sobre el dinero. Pero deberían."

---

## Content Calendar Framework

Weekly themes Qwen should rotate through:

1. **Lunes — Educación:** Bitcoin basics, cómo funciona, por qué importa
2. **Martes — Problema/Solución:** Devaluación del peso, inflación, por qué el sistema falla
3. **Miércoles — Producto ArcadiaB:** B2X loans, Ahorro Inteligente DCA, tesorería corporativa
4. **Jueves — Datos/Investigación:** Charts, números, datos del mercado
5. **Viernes — Comunidad/CTA:** Casos de uso, testimonios, invitación a registrarse

---

## Output Format

When Qwen generates posts, format them exactly like this:

```
## LINKEDIN POST — [TEMA] — [FECHA]
[post text here]

---

## FACEBOOK POST — [TEMA] — [FECHA]
[post text here]

---

PROFILE IDs:
- LinkedIn ArcadiaB: 140303673
- Facebook ArcadiaB: 140277707

POST COMMAND:
node hootsuite-post.mjs --post-linkedin "[text]" --schedule "YYYY-MM-DDTHH:MM:SSZ"
node hootsuite-post.mjs --post-facebook "[text]" --schedule "YYYY-MM-DDTHH:MM:SSZ"
```

**Important:**
- Replace `[text]` with the actual post content (escape quotes properly)
- Use UTC timestamps ending in Z
- Best posting times: LinkedIn 8-10am CST, Facebook 12-2pm CST
- Escape double quotes in post text with backslash: \\"

---

## Character Limits

- **LinkedIn:** 3,000 characters (warn if exceeded)
- **Facebook:** 63,206 characters (practical limit ~500 for engagement)

---

## Quick Reference: Profile IDs

```
LinkedIn ArcadiaB: 140303673
Facebook ArcadiaB: 140277707
Facebook KapitaLex: 140264094
Instagram @arcadiabtc: 140264079
Twitter @arcadiabtc: 140262249
YouTube ArcadiaB: 140264047
```

---

## Command Examples for Reference

```bash
# Post to LinkedIn immediately
node hootsuite-post.mjs --post-linkedin "Your post text here"

# Post to Facebook immediately  
node hootsuite-post.mjs --post-facebook "Your post text here"

# Post to both platforms
node hootsuite-post.mjs --post-both "Your post text here"

# Schedule a post
node hootsuite-post.mjs --post-linkedin "Your post" --schedule "2026-03-16T14:00:00Z"

# Dry run (preview without posting)
node hootsuite-post.mjs --post-both "Test post" --dry-run
```

---

*Document version: 1.0*
*Created for: Qwen Spanish Content AI*
*Brand: ArcadiaB*
