# SME quick guide: reviewing a content PR

> **Purpose:** one page for the clinical expert (SME) who approves content changes, written for the GitHub mobile app
> (TS-06.3.5). **Audience:** SME. **Last updated:** 2026-11-13
> Menu names follow the GitHub app and website at the time of writing; they may move slightly in later app versions.

You are the **only approver** of clinical content. Nothing reaches the site as reviewed content without your approval;
Claude and the engineer prepare changes but cannot approve them.

## 1. You get a notification

A content pull request (PR) is named after a topic, e.g. *Content: primary MR grading*. Its branch starts with
`content/` or `source/`. Open it from the notification (GitHub app → *Notifications*, or the e-mail link).

## 2. Read the summary first

- The **description** says what changed and why, and names the source document.
- The **"Clinical change summary" comment** (posted automatically) lists every value that changed, was added or was
  removed: topic, parameter, population, society, **old → new**, and where it is in the document (table, figure, page).
- Checks at the bottom must be green. A red check means the change is not ready; you can still comment.

## 3. Check each row against the source

Open the source document (link or PDF in the PR) and, for each row of the summary:

- the **number and the operator** (≥, >, <, ≤, ranges) match;
- the **unit** is exactly as printed in the document;
- the **population** is right (adults or children, sex, age or BSA band, rhythm) and the **technique** (TTE, TEE, stress);
- the **locator** points to the place the number comes from;
- a disagreement between societies is shown side by side, not resolved;
- an older value replaced by a newer document is kept as history, not deleted.

To see the raw change, open *Files changed* (in the app: the PR's *Files changed* / *Changes* entry).

## 4. Decide

| You find | Do |
|---|---|
| Everything correct | *Review changes* → **Approve** (add a short note if useful), then **Merge** |
| Something wrong or unclear | *Review changes* → **Request changes**, and say which row and what the source says. Claude fixes it and you review again |
| A value is right but you disagree clinically | Comment; Valvia only reproduces society documents, so disagreement goes to a note or the decision log, not a different number |

After merging, the site updates within about 5 minutes: the topic's page, the footer's content version and the
*What's new* page. Your approval and the merge are recorded automatically in the audit log
([`CHANGELOG.md`](../CHANGELOG.md)).

## 5. Good to know

- A PR left for 7 days gets a reminder, and after 14 days the engineer is alerted (label `review-overdue`). If you need
  more time, just comment.
- Marking a topic as **reviewed** (so the "Not yet clinically reviewed" label disappears) is its own small PR, with
  `status: published` and the review date.
- Wrong value already live? Tell the engineer: they remove it at once ([emergency rollback](runbooks/emergency-rollback.md)),
  then the correction comes as a normal PR for you to approve.
- Never approve a PR you have not checked against the document; never include patient data in comments.
