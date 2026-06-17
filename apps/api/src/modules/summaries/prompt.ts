const MAX_TEXT_CHARS = 8000;

export function buildSummarizationPrompt(texteOriginal: string): string {
  const text = texteOriginal.slice(0, MAX_TEXT_CHARS);
  return `Voici un texte législatif officiel français :

---
${text}
---

Génère une analyse structurée en JSON avec exactement ces 3 clés :
{
  "resume": "Résumé en 2-3 phrases claires pour un citoyen non-expert.",
  "pour": "Les principaux arguments en faveur (liste à puces, 3 points max).",
  "contre": "Les principaux arguments contre (liste à puces, 3 points max)."
}

Réponds uniquement avec le JSON valide. Pas d'explications supplémentaires.`;
}

export function buildChunkSummaryPrompt(chunkSummaries: string[]): string {
  const combined = chunkSummaries.map((s, i) => `Partie ${i + 1}: ${s}`).join('\n\n');
  return `Voici les résumés de différentes parties d'un texte législatif :

${combined}

Génère une synthèse finale en JSON avec exactement ces 3 clés :
{
  "resume": "Résumé global en 2-3 phrases claires pour un citoyen non-expert.",
  "pour": "Les principaux arguments en faveur (liste à puces, 3 points max).",
  "contre": "Les principaux arguments contre (liste à puces, 3 points max)."
}

Réponds uniquement avec le JSON valide.`;
}
