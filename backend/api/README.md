Stats endpoints
================

New endpoints added to provide aggregated KPIs for the backoffice dashboard and donations graph.

Endpoints
---------

1) GET /api/stats/dashboard

- Description: Returns aggregated KPIs used by the backoffice dashboard.
- Query params: Optional `year` (integer) — currently not used for all KPIs but kept for future.
- Response JSON shape:
  {
  "activeMembers": <number>,
  "membershipAmount": <number>,
  "donorsCount": <number>,
  "donationsAmount": <number>
  }

2) GET /api/stats/donations?year=YYYY

- Description: Returns donations aggregated per month for the requested year.
- Query params: `year` (integer), default = current year.
- Response JSON shape:
  {
  "year": 2025,
  "monthlyTotals": [double, ..., double], // array length 12
  "total": <number>
  }

Implementation notes
--------------------

- Backend implements repository-level aggregations in `PaymentRepository` and `MembershipRepository` to avoid loading
  entire tables into memory for common KPIs:
    - `sumAmountByType(PaymentType)` — sum of amounts for a given payment type
    - `countDistinctUsersByType(PaymentType)` — distinct donors count for a given type
    - `sumMonthlyByTypeAndYear(PaymentType, year)` — monthly sums (returns rows of [month, sum])
    - `countActiveForYear(year)` — number of active memberships for a year
- `StatsController` uses the repository methods and falls back to in-memory computation if the repository query fails
  for any reason.

Testing
-------

- Integration tests were added under `src/test/java/.../controller`:
    - `StatsControllerIntegrationTest`
    - `PaymentControllerIntegrationTest`
    - `ContactControllerIntegrationTest`
    - `NewsPublicationControllerIntegrationTest`

- Tests are annotated with `@TestPropertySource(locations = "classpath:application-test.properties")` so the H2
  in-memory database and `spring.jpa.hibernate.ddl-auto=create-drop` are used during test runs.

Run tests
---------
From the project root run (or inside backend/api):

```bash
# From backend/api
./mvnw test
```

If you are on Windows PowerShell use:

```powershell
cd path\to\backend\api
.\mvnw.cmd test
```

Troubleshooting
---------------

- If tests fail with `Table "..." not found` ensure `application-test.properties` (already present
  in `src/test/resources`) contains `spring.jpa.hibernate.ddl-auto=create-drop` and tests use it
  via `@TestPropertySource`.
- For database function usage in JPQL (function('year', ...), function('month', ...)) H2 supports these in the test
  profile using MODE=PostgreSQL. If your production DB is different, adjust queries or implement native SQL if
  necessary.

Next steps / improvements
------------------------

- Add repository-level native queries for monthly grouping if portability becomes an issue.
- Add unit tests (MockMvc + @MockBean) for controller-level unit tests to run faster.
- Add similar endpoints for other KPIs if needed.


