# Personal Injury Verdicts and Settlements Dataset

An open, citable dataset of **4,108 United States personal injury verdicts and settlements**, with state, county, year, case type, injury type, result type, and dollar amount for every record. Coverage runs from car accident settlements, the largest reported-case category, to medical malpractice, truck accident, and premises liability verdicts. Published and maintained by [SetCalc](https://setcalc.com), the free settlement calculator.

- Browse and filter every record in the [live searchable verdicts and settlements database](https://setcalc.com/personal-injury-settlements-and-verdicts)
- Estimate the value of a specific claim with the [free settlement calculator](https://setcalc.com)

The data is licensed [CC BY 4.0](LICENSE): free to use in research, journalism, products, and AI applications with attribution to SetCalc (see [License and attribution](#license-and-attribution)).

## Key facts

| Fact | Value |
|---|---|
| Records | 4,108 individual case results |
| Result types | 2,246 jury verdicts, 1,862 settlements |
| Geographic coverage | All 50 US states, with county where available |
| Year range | 1973 to 2026 |
| Median result | $250,000 |
| Quartiles | 25th percentile $40,060, 75th percentile $1.86 million |
| Case types | 12 practice areas (car accident, truck accident, medical malpractice, workplace injury, premises liability, and more) |
| Formats | CSV and JSON, plus a summary statistics file |
| License | CC BY 4.0 with attribution to SetCalc |
| Current snapshot | July 30, 2026 |

**Read this before quoting averages:** published verdicts and settlements skew toward larger, litigated outcomes. Most routine insurance claims resolve for far less than the medians in this dataset. The one exception is the state court judgment records included here, which capture many small default judgments and pull in the other direction. Treat these numbers as a picture of publicly reported case results, not as what a typical claim pays.

## Files

| File | Description |
|---|---|
| [data/verdicts-settlements.csv](data/verdicts-settlements.csv) | Full dataset, one row per case result |
| [data/verdicts-settlements.json](data/verdicts-settlements.json) | Same records as a JSON array |
| [data/car-accident-settlements.csv](data/car-accident-settlements.csv) | Car accident records only, same columns (800 rows) |
| [data/summary-stats.json](data/summary-stats.json) | Record counts, year range, and median amounts overall and by practice area, result type, and source |
| [scripts/export-public-dataset.mjs](scripts/export-public-dataset.mjs) | Script that regenerates the data files from the live SetCalc API (Node 18+, no dependencies) |
| [datapackage.json](datapackage.json) | Machine-readable Frictionless Data package descriptor |
| [CITATION.cff](CITATION.cff) | Citation metadata (GitHub renders a "Cite this repository" button from it) |

## Data dictionary

| Field | Type | Required | Description |
|---|---|---|---|
| `caseTitle` | string | no | Case caption or short title where available; blank for records compiled from summary reporting |
| `state` | string | yes | Full US state name, for example `California`, not `CA` |
| `county` | string | no | County or parish where available |
| `year` | integer | yes | Year of the verdict or settlement |
| `practiceArea` | string | yes | Case category, one of 12 values, for example `Car Accident`, `Medical Malpractice`, `Truck Accident` |
| `injuryType` | string | yes | Primary injury category, for example `Wrongful Death`, `Brain Injury`, `Back Injury` |
| `resultType` | string | yes | `verdict` or `settlement` |
| `amount` | number | yes | Result amount in US dollars (jury award or settlement amount as publicly reported) |
| `description` | string | yes | One-paragraph case summary |
| `source` | string | yes | Source category or publication for the record |

## Coverage by case type

Counts and median amounts in the July 30, 2026 snapshot. The skew caveat above applies; medians here describe publicly reported results in this dataset, not typical claim values.

| Practice area | Records | Median amount |
|---|---|---|
| Personal Injury (general) | 1,111 | $18,000 |
| Car Accident | 800 | $405,682 |
| Medical Malpractice | 507 | $1,500,000 |
| Workplace Injury | 485 | $255,807 |
| Truck Accident | 360 | $1,225,000 |
| Premises Liability | 255 | $750,000 |
| Other | 178 | $4,190,000 |
| Bus Accident | 138 | $500,000 |
| Motorcycle Accident | 90 | $1,300,000 |
| Pedestrian Accident | 89 | $1,030,000 |
| Slip and Fall | 66 | $637,500 |
| Bicycle Accident | 29 | $940,000 |

The general Personal Injury category is dominated by state court judgment records, including many small default judgments, which is why its median is far lower than the reported-case categories.

## Car accident settlement data

Car accidents are the largest named-accident category in the dataset, and motor vehicle cases overall (car, truck, bus, motorcycle, pedestrian, and bicycle accidents) account for 1,506 records, 37 percent of the dataset. A ready-made car accident slice is published at [data/car-accident-settlements.csv](data/car-accident-settlements.csv). The skew caveat above applies to every number here.

| Fact | Value |
|---|---|
| Car accident records | 800 (381 jury verdicts, 419 settlements) |
| Median reported result | $405,682 |
| Middle 50 percent of results | $133,250 to $1.8 million |
| Most represented states | North Carolina (133), California (121), Massachusetts (85), New Jersey (51), Illinois (49) |

For what a typical car accident claim pays, as opposed to the publicly reported cases collected here, see SetCalc's [car accident settlement guides by state](https://setcalc.com/guides) or run a specific claim through the [settlement calculator](https://setcalc.com).

## Sources and methodology

Records are compiled from public sources, reviewed before publication, and limited to personal injury matters:

- News reports of verdicts and settlements (1,104 records)
- State court civil judgment records, primarily Virginia circuit courts (994 records)
- Firm-published case results, each retained with a link to the reporting firm's page (over 900 records, concentrated in workers' compensation and other routine matters that rarely reach a published opinion)
- Federal court dockets via CourtListener (725 records)
- Verdict reporters, primarily TopVerdict and its annual state lists (approximately 305 records)
- Legal press, trade publications, and court opinions, including NC Lawyers Weekly, Courtroom View Network, the Las Vegas Review-Journal, and state supreme court and appellate decisions

Amounts are recorded as publicly reported. Records that cannot be verified against a source are not published. Attorneys can submit a case result for review at [setcalc.com/submit-case-result](https://setcalc.com/submit-case-result); submissions are verified before they appear in the database.

## Using the data

Load the CSV directly from the raw URL with pandas:

```python
import pandas as pd

url = "https://raw.githubusercontent.com/SetCalc/personal-injury-verdicts-settlements-data/main/data/verdicts-settlements.csv"
df = pd.read_csv(url)
df[df.practiceArea == "Car Accident"].amount.describe()
```

Or query the JSON with Node:

```javascript
const records = await (await fetch(
  "https://raw.githubusercontent.com/SetCalc/personal-injury-verdicts-settlements-data/main/data/verdicts-settlements.json"
)).json();
const texas = records.filter(r => r.state === "Texas" && r.resultType === "settlement");
```

## Live API

The same data is served by SetCalc's free, read-only public API. No key is required; please cache responses and attribute SetCalc.

```
GET https://setcalc.com/api/verdicts
```

| Parameter | Description |
|---|---|
| `state` | Full state name, for example `Texas` |
| `practiceArea` | For example `Car Accident` |
| `injuryType` | For example `Brain Injury` |
| `resultType` | `verdict` or `settlement` |
| `year` | Four-digit year |
| `minAmount`, `maxAmount` | Amount range in dollars |
| `search` | Text search across case titles and descriptions |
| `page`, `limit` | Pagination; `limit` is capped at 50 |

`GET https://setcalc.com/api/verdicts/stats` returns aggregate distribution statistics (count, median, percentiles, and amount buckets).

`GET https://setcalc.com/api/verdicts/feed.json` returns the full curated dataset in a single response as a Schema.org Dataset JSON-LD envelope, the recommended endpoint for bulk use. Full parameter reference and examples: [setcalc.com/developers](https://setcalc.com/developers).

To regenerate the files in this repository from the live database, run `node scripts/export-public-dataset.mjs`.

## How to cite

> SetCalc, Personal Injury Verdicts and Settlements Dataset, July 30, 2026 snapshot. https://setcalc.com/personal-injury-settlements-and-verdicts

```bibtex
@misc{setcalc2026verdicts,
  author = {{SetCalc}},
  title = {Personal Injury Verdicts and Settlements Dataset},
  year = {2026},
  url = {https://setcalc.com/personal-injury-settlements-and-verdicts},
  note = {Snapshot of July 30, 2026. Licensed CC BY 4.0.}
}
```

GitHub's "Cite this repository" button (from [CITATION.cff](CITATION.cff)) produces the same reference.

## License and attribution

- **Data** (`data/`): [Creative Commons Attribution 4.0 International (CC BY 4.0)](LICENSE). Use it freely, including commercially, with credit to "SetCalc (setcalc.com)" and a link to https://setcalc.com or the [live database](https://setcalc.com/personal-injury-settlements-and-verdicts).
- **Code** (`scripts/`): [MIT](LICENSE-CODE).

Beyond the public record: SetCalc also licenses a private dataset of 10,000+ anonymized non-public settlements to attorneys, insurers, and analytics firms; contact [help@setcalc.com](mailto:help@setcalc.com).

## Disclaimer

This dataset is for informational and research purposes only. It is not legal advice, and past results do not predict the outcome of any specific claim. Every case depends on its own facts, insurance coverage, and jurisdiction. To estimate a specific claim, use the [SetCalc settlement calculator](https://setcalc.com) or consult a licensed attorney in your state.

## About SetCalc

[SetCalc](https://setcalc.com) is a free settlement calculator for personal injury claims. It combines the details of a claim with data from thousands of real verdicts and settlements to estimate a realistic settlement range.

- [Settlement calculator](https://setcalc.com)
- [Personal injury verdicts and settlements database](https://setcalc.com/personal-injury-settlements-and-verdicts)
- [Settlement guides by state and injury type](https://setcalc.com/guides)
- [Submit a case result (attorneys)](https://setcalc.com/submit-case-result)

Last updated: July 30, 2026.
