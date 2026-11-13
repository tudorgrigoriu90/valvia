# Copyright assessment

> **Purpose:** assess what Valvia may take from ESC/EACVI and ASE documents without permission, and where permission is needed (TS-07.2.1).
> **Audience:** product owner, engineer, SME. **Last updated:** 2026-11-13
> **Status:** engineering assessment, **not legal advice**. Have it reviewed by someone qualified before go-live (TS-08.8).

## What Valvia takes from the documents

| Material | How Valvia uses it | Assessment |
|---|---|---|
| Individual cut-off values, ranges and grade boundaries | Stored value by value, rendered in Valvia's own tables with a citation | Low risk: numbers and facts are generally not protected as such; selection is limited and always attributed |
| Table layout, wording, footnotes, colour coding | Not copied (content policy rule 3) | Avoids reproducing the expressive arrangement of a table |
| Figures, algorithms, images | Not copied or redrawn; linked by DOI and figure number (rule 4) | Avoids the clearest form of reproduction |
| Notes and caveats | Short paraphrases in Valvia's words, pointing to the page (rule 5) | Low risk |
| **Near-complete reference tables** (e.g. prosthetic valve values by model and size in the ASE 2024 appendix, Tables A1–A9) | **Not entered yet** | Reproducing a whole table's data set may be seen as taking a substantial part of the compilation (database right in the EU, copyright in the selection and arrangement). **Ask for permission first.** |
| Paediatric z-score datasets cited by a society document | Planned as published equations or tables | Same as above when reproduced in full: check the dataset's licence or ask the publisher |

## Who to ask

- **ASE documents** (Journal of the American Society of Echocardiography, published by Elsevier): Elsevier permissions
  (via the article's "Get rights and content" link on the journal site) and/or ASE.
- **ESC/EACVI documents** (European Heart Journal and EHJ Cardiovascular Imaging, Oxford University Press): OUP
  permissions (via the article's "Permissions" link) and/or ESC.

## Recommended actions

1. Keep the current approach for cut-offs: own format, value-level transcription, full citation, figures linked.
2. Before entering the prosthetic valve catalogue (CH-51, TS-02.2.8), the engineer sends a permission request to
   Elsevier/ASE describing the use: non-commercial reference app, values re-keyed in our own format, each value cited
   with DOI, no figures, free public access. Record the answer in the [decision log](../decisions/README.md).
3. Review this assessment with a qualified adviser before go-live, together with the MDR memo (TS-07.1.1).
4. If a publisher objects to any use, remove the affected values (revert, as in the emergency rollback runbook) and mark
   the topic as a gap.

## Draft permission request

> Subject: Permission request — use of reference values from [article, DOI]
>
> We are developing Valvia, a free, non-commercial web reference for echocardiographers that lists cut-off and reference
> values from ESC/EACVI and ASE documents. Each value is re-keyed in our own format, shown with the full citation and a
> DOI link to your article, and no figures, tables or text are reproduced. We would like to include the reference values
> from [Table(s) X] of [article] in this way. Please let us know whether this use is permitted and under which conditions.
