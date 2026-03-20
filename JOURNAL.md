# Evolution Journal

This file is append-only. Each run of the evolver agent adds a dated entry below.

---

## 2026-03-09
**Did**: Added XPeng as a new brand with 7 confirmed markets (CHN, NOR, NLD, SWE, DEU, DNK, FRA) verified from official xpeng.com localized pages.
**Result**: pass
**TODO**: Verify XPeng presence in additional markets (Belgium, Spain, UK) and check if France entry has dealership listings — /fr page was thin on details.

## 2026-03-09
**Did**: Re-verified XPENG France and upgraded the data schema to store multiple official source URLs for confirmed entries.
**Result**: pass
**TODO**: Verify XPENG Belgium from official XPENG market and dealer pages.
## 2026-03-09
**Did**: Verified XPENG official presence in Belgium and added BEL using official market, dealer, and service pages.
**Result**: pass
## 2026-03-10
**Did**: Strengthened XPENG France source attribution by adding official French market and contact pages alongside the existing dealer-network and service sources.
**Result**: pass
**TODO**: Re-check XPENG Spain and UK if official localized pages launch on xpeng.com.
## 2026-03-10
**Did**: Re-checked XPENG Spain and UK against XPENG's official dealer page, site sitemap, and country-list API, and found conflicting official signals.
**Result**: pass
**TODO**: Resolve whether XPENG Spain and UK should count as official presence — `/find-us` lists dealers, but `/nextApi/store/listCountry` and the sitemap do not expose ES or UK markets.

## 2026-03-11
**Did**: Confirmed XPENG official presence in Spain and the United Kingdom using XPENG region pages, local official market sites, and XPENG's own dealer finder, then added both markets to the dataset.
**Result**: pass
**TODO**: Re-check why XPENG's `/nextApi/store/listCountry` response still omits Spain and the United Kingdom even though the region selector and dealer finder now expose both markets.

## 2026-03-12
**Did**: Re-checked XPENG's live dealer-country API and confirmed it still omits Spain and the United Kingdom even though XPENG's public region selector and `find-us` page expose both markets.
**Result**: pass
**TODO**: Monitor whether XPENG aligns `/nextApi/store/listCountry` with the live region selector and dealer listings for Spain and the United Kingdom.
## 2026-03-12
**Did**: Re-verified that XPENG's live `find-us` market selector and official Spain/UK market sites still expose both markets, while the current `POST /nextApi/store/listCountry` response continues to omit them.
**Result**: pass
**TODO**: Monitor whether XPENG adds Spain and the United Kingdom to `POST /nextApi/store/listCountry` so its dealer-country API matches the live selector and official local sites.

## 2026-03-13
**Did**: Re-checked XPENG's official Spain and UK market pages plus the live `find-us` dealer page, and confirmed the public signals still expose those markets while `POST /nextApi/store/listCountry` still omits them.
**Result**: pass
**TODO**: Monitor whether XPENG adds Spain and the United Kingdom to `POST /nextApi/store/listCountry` so its dealer-country API matches the live selector and official local sites.
## 2026-03-13
**Did**: Closed the stale XPENG API-monitoring TODO because XPENG's public region selector, official Spain and UK market sites, and live dealer finder already establish the user-facing ground truth while the hidden dealer-country API has stayed inconsistent across repeated checks.
**Result**: pass

## 2026-03-13
**Did**: Added a dataset summary overlay to the map so users can immediately see the number of tracked brands, countries with confirmed presence, and the last update date.
**Result**: pass

## 2026-03-13
**Did**: Added Zeekr as a tracked brand with 4 verified official markets (China, Australia, Sweden, and the Netherlands) and recorded Zeekr expansion as a continuing backlog theme.
**Result**: pass
**TODO**: Verify additional Zeekr sovereign markets beyond the initial China, Australia, Sweden, and Netherlands slice using official localized pages or dealer/service flows.

## 2026-03-14
**Did**: Expanded Zeekr coverage by adding Belgium, France, and Germany from official localized market pages plus Zeekr test-drive and care/service pages, and narrowed the remaining backlog to markets beyond that confirmed footprint.
**Result**: pass
## 2026-03-15
**Did**: Expanded Zeekr coverage by adding Denmark, Norway, and Switzerland from official localized market, test-drive, and service pages, and narrowed the remaining Zeekr expansion backlog accordingly.
**Result**: pass
**TODO**: Verify additional Zeekr sovereign markets beyond the current China, Australia, Sweden, Netherlands, Belgium, France, Germany, Denmark, Norway, and Switzerland footprint using official local sites or dealer/service flows.
## 2026-03-16
**Did**: Expanded Zeekr coverage by adding the United Arab Emirates, Thailand, Singapore, Mexico, and Malaysia from official localized market pages plus Zeekr test-drive booking flows.
**Result**: pass
**TODO**: Verify additional sovereign Zeekr markets beyond the current footprint, prioritizing official locales that also expose clear test-drive or service flows.
## 2026-03-17
**Did**: Expanded Zeekr coverage by adding Brazil, Israel, Jordan, and the Philippines from official localized market pages plus official test-drive or service flows.
**Result**: pass
**TODO**: Verify the next highest-impact Zeekr sitemap locales, prioritizing sovereign markets with clear consumer flows such as Saudi Arabia, Indonesia, Kazakhstan, and New Zealand.
## 2026-03-18
**Did**: Expanded Zeekr coverage by adding Saudi Arabia and New Zealand from official localized market pages plus official test-drive or launch pages, while leaving Indonesia and Kazakhstan for later because the current official signals were weak or non-localized.
**Result**: pass
**TODO**: Verify additional sovereign Zeekr markets beyond the current footprint, prioritizing locales that expose clear localized consumer flows rather than global fallback pages.
## 2026-03-18
**Did**: Expanded Zeekr coverage by adding Kazakhstan, Armenia, Georgia, and Qatar from official localized market pages plus official service, test-drive, or localized content pages.
**Result**: pass
**TODO**: Verify the next strongest Zeekr sovereign locales from the newer locale set, prioritizing markets with direct localized consumer flows such as Indonesia, Cambodia, Uzbekistan, Bahrain, Kuwait, and Morocco.
## 2026-03-19
**Did**: Expanded Zeekr coverage by adding Kuwait, Bahrain, and Morocco from official localized market pages plus official test-drive flows, while narrowing the remaining backlog to the next unresolved locales.
**Result**: pass
**TODO**: Verify the next strongest Zeekr sovereign locales, prioritizing Indonesia and Cambodia; the current Indonesia signals remain inconclusive because `/en-id` does not yet expose a clear localized consumer flow in plain fetches.

## 2026-03-20
**Did**: Added Zeekr Indonesia after confirming the official Indonesia locale through Zeekr's market sitemap plus its official contact and book-test-drive pages, and narrowed the remaining Zeekr backlog accordingly.
**Result**: pass
**TODO**: Verify the next strongest Zeekr sovereign locales, prioritizing Cambodia and Uzbekistan; Cambodia's current locale still looks like a generic content stub rather than a clear local consumer flow.

## 2026-03-20
**Did**: Verified Zeekr's Cambodia and Uzbekistan locale surfaces against official site routes and found both inconclusive for official presence, then narrowed the backlog away from those weak signals.
**Result**: pass
**TODO**: Verify the next strongest Zeekr sovereign locales, prioritizing markets with localized dealer, service, or test-drive flows; Cambodia still only shows a bare contact stub and Uzbekistan still falls back to the mainland China site.
