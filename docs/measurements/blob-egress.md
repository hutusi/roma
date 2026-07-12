# Vercel Blob egress log

Monthly record of Vercel Blob storage + data-transfer usage, to evaluate
the ADR 0009 egress trigger (swap to R2 behind `src/lib/storage.ts` when
egress cost clears the R2-equivalent by a clear margin for two months).

## How to capture

- **Dashboard:** Vercel → project `roma` → Usage → Blob. Read
  data-transfer (GB) and the associated cost, plus stored volume (GB).
- **CLI (optional):** `vercel` usage commands, if available for the plan.
- Record on the 1st of each month for the prior month.

## R2 break-even model

R2 pricing: **$0 egress** + **~$0.015/GB-month storage** + minor Class A/B
operation fees. So the swap pays off roughly when:

```text
monthly Blob egress cost  >  ~$0.015 × (stored GB)  +  R2 operation fees
```

Since R2 egress is free, egress-dominated months tip the balance fastest.
Review target: sustained **> $20/mo** Blob egress over two consecutive
months (refine against the numbers below).

## Monthly log

| Month | Stored (GB) | Egress (GB) | Egress cost ($) | Storage cost ($) | Notes |
|---|---|---|---|---|---|
| 2026-07 | _pending_ | _pending_ | _pending_ | _pending_ | first post-launch month (prod live 2026-07-11); capture from the Vercel dashboard on 2026-08-01 |
