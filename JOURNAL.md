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

## 2026-03-21
**Did**: Expanded Zeekr coverage by adding Egypt, Colombia, Costa Rica, Lebanon, and Uruguay from official localized market pages plus official contact or test-drive flows.
**Result**: pass
**TODO**: Verify the next strongest Zeekr sovereign locales from the official locale sitemap, prioritizing Vietnam and other remaining locale-only markets where localized homepages exist but consumer flows are still unclear.

## 2026-03-21
**Did**: Added Zeekr Vietnam after confirming the official Vietnam locale, its localized about page, and the live homepage footer naming PREMIUM EV Co., Ltd. with a Hanoi address, hotline, and `zeekr.com.vn` email, which closes the stale Vietnam follow-up.
**Result**: pass

## 2026-03-22
**Did**: Expanded Zeekr coverage by adding Laos, Moldova, and Ecuador from official localized market pages plus official contact, test-drive, or distributor evidence, and narrowed the remaining backlog away from those markets.
**Result**: pass
**TODO**: Verify Azerbaijan from official Zeekr pages or dealer/service flows; the current `/en-az` routes still appear to fall back to the mainland China site.

## 2026-03-23
**Did**: Closed the Zeekr Azerbaijan follow-up after re-checking official Zeekr sources and confirming the global sitemap omits `en-az` while the live `/en-az/` route resolves to Zeekr's own 404 page instead of a localized market or dealer flow.
**Result**: pass

## 2026-03-23
**Did**: Added Zeekr Greece after confirming Zeekr's official Europe region manifest, localized Greek market site, Greek test-drive flow, and country domain.
**Result**: pass

## 2026-03-23
**Did**: Added Zeekr Italy after confirming Zeekr's official Europe region manifest routes Italy to `zeekr.it` and the live localized Italy site presents a Zeekr consumer signup flow operated by Jameel Motors Italy.
**Result**: pass
## 2026-03-23
**Did**: Added Zeekr Bulgaria, Croatia, Romania, and Slovenia after confirming Zeekr's official Europe region manifest and live `zeekr.eu` market selector both route those countries to dedicated `zeekr-see.eu` localized market pages, even though the SEE site is bot-blocked behind Cloudflare for direct fetches.
**Result**: pass
## 2026-03-23
**Did**: Added Leapmotor as a tracked brand with 7 verified official markets (China, United Kingdom, Germany, France, Spain, Italy, and the Netherlands) using Leapmotor's localized market pages plus official dealer pages.
**Result**: pass
**TODO**: Verify additional Leapmotor sovereign markets already exposed via official localized pages and dealer flows, starting with Belgium and Austria.
## 2026-03-23
**Did**: Expanded Leapmotor coverage by adding Austria and Belgium from official localized market pages plus official dealer pages.
**Result**: pass
**TODO**: Verify the next strongest Leapmotor sovereign locales already exposed through official localized pages and dealer flows, starting with Denmark, Greece, Ireland, and Portugal.
## 2026-03-23
**Did**: Expanded Leapmotor coverage by adding Ireland and Portugal from official localized market pages plus official dealer pages, and stopped short of Denmark and Greece because their localized homepages resolve but the expected `/dealer` pages currently return 404.
**Result**: pass
**TODO**: Resolve whether Leapmotor Denmark and Greece should count as official presence — localized market homepages exist, but the expected official dealer confirmation pages currently return 404.
## 2026-03-23
**Did**: Added Leapmotor Denmark and Greece after confirming Greece's live localized market and dealer routes on `leapmotor.net`, and Denmark's official handoff from Leapmotor's market manifest to `leapmotor.dk`, where the local site exposes consumer flows and describes a nationwide dealer/service network.
**Result**: pass
## 2026-03-23
**Did**: Expanded Leapmotor coverage by adding the Czech Republic, Hungary, and Poland from live localized Leapmotor market pages plus their official dealer-route surfaces.
**Result**: pass
## 2026-03-23
**Did**: Expanded Leapmotor coverage by adding Bulgaria, Croatia, Romania, Slovakia, and Slovenia from Leapmotor's global locale manifest plus live localized market and dealer pages.
**Result**: pass
**TODO**: Verify the next strongest Leapmotor sovereign locales whose official market and support surfaces already appear to be live, prioritizing Iceland, Luxembourg, Malta, North Macedonia, and Serbia.

## 2026-03-23
**Did**: Expanded Leapmotor coverage by adding Iceland, Luxembourg, Malta, and Serbia from official localized Leapmotor market pages plus official dealer, importer, or sales-and-service-center surfaces, and left North Macedonia deferred because its current `mk` routes still do not expose a working localized market flow.
**Result**: pass
**TODO**: Verify whether Leapmotor North Macedonia should count as official presence — the `mk` market route still returns 404 while the current dealer page remains blank.
## 2026-03-24
**Did**: Closed the Leapmotor North Macedonia follow-up after re-checking Leapmotor's official `mk` locale surfaces and confirming the public market route still returns 404, the dealer page renders a blank shell, and the live Leapmotor country-list API does not expose MK as an available market.
**Result**: pass
## 2026-03-24
**Did**: Expanded Leapmotor coverage by adding New Zealand, South Africa, and Switzerland from live localized Leapmotor market sites plus official register-interest, test-drive, or dealer flows.
**Result**: pass
**TODO**: Verify the next strongest Leapmotor sovereign locales beyond the current footprint, prioritizing Australia, the United Arab Emirates, and Malaysia.

## 2026-03-24
**Did**: Expanded Leapmotor coverage by adding Australia, the United Arab Emirates, and Malaysia from Leapmotor's official locale manifest plus live localized market and dealer/support flows.
**Result**: pass
**TODO**: Verify the next strongest Leapmotor sovereign locales beyond the current footprint, prioritizing Bahrain, Oman, Qatar, Saudi Arabia, and Singapore.
## 2026-03-24
**Did**: Added Leapmotor Singapore after confirming Leapmotor's official market selector links Singapore to a dedicated local site, and that live Singapore site exposes a local showroom plus consumer vehicle pages.
**Result**: pass
**TODO**: Verify whether Leapmotor Bahrain, Oman, Qatar, and Saudi Arabia should count as official presence — Leapmotor's official market manifest and locale routes exist, but the current public localized pages still render as weak or incomplete signals compared with Singapore's live local site.
## 2026-03-24
**Did**: Closed the Leapmotor Bahrain, Oman, Qatar, and Saudi Arabia follow-up after re-checking Leapmotor's official locale manifest and public GCC routes, which still expose only broken `page?key=Leapmotor` shells while the locale roots and dealer routes return 404.
**Result**: pass
## 2026-03-24
**Did**: Added Leapmotor Jordan after confirming the official `jo-en` locale plus the live dealer page naming trusted sales and services by Stellantis and Leapmotor JO Abu Khader Automotive.
**Result**: pass
**TODO**: Verify the next strongest Leapmotor sovereign locales with live locale roots, prioritizing Morocco and Mauritius; Thailand still looks like a page-shell-only locale.
## 2026-03-24
**Did**: Added Leapmotor Morocco and Mauritius after confirming official localized market pages; Morocco's official C10 and T03 pages expose test-drive flows, and Mauritius' localized pages show local pricing plus trusted sales and services by Stellantis.
**Result**: pass
**TODO**: Verify whether Leapmotor Thailand should count as official presence — the official `th` locale is live, but it still needs stronger public dealer or support confirmation than the current page shell.

## 2026-03-24
**Did**: Added Leapmotor Thailand after confirming Leapmotor's official global market manifest now hands Thailand to a live local Leapmotor Thailand site whose homepage exposes Thai customer-service contact details, while its C10 product page and dealer-finder flow provide live local consumer surfaces.
**Result**: pass
**TODO**: Verify whether Leapmotor Nepal, Sweden, and Israel should count as official presence — their current official locale routes or linked local pages still render as empty shells or server errors.
## 2026-03-24
**Did**: Closed the Leapmotor Sweden follow-up after re-checking Leapmotor's official locale selector and Swedish routes, which still show only a locale link plus empty `page?key=` shells while the localized root itself returns Leapmotor's own 404 page.
**Result**: pass
**TODO**: Verify whether Leapmotor Nepal and Israel should count as official presence — their current official locale routes or linked local pages still render as empty shells or server errors.
## 2026-03-24
**Did**: Closed the Leapmotor Israel follow-up after re-checking Leapmotor's official locale selector and Israel routes, which still fail with live 500 errors instead of exposing a public localized market or dealer flow.
**Result**: pass
**TODO**: Verify whether Leapmotor Nepal should count as official presence — its current official locale routes or linked local pages still render as empty shells or server errors.
## 2026-03-24
**Did**: Closed the Leapmotor Nepal follow-up after re-checking Leapmotor's official locale selector and Nepal routes, which still show only a locale link plus empty `page?key=` shells while the localized root itself returns Leapmotor's own 404 page.
**Result**: pass
## 2026-03-25
**Did**: Added Leapmotor Mexico after confirming Leapmotor's live global market selector hands Mexico to `leapmotor.com.mx` and the official local site exposes a dedicated Spanish consumer launch page for Mexico, while updating the backlog to deprioritize Kuwait alongside the still shell-only Gulf locales.
**Result**: pass
## 2026-03-25
**Did**: Re-checked Leapmotor North Macedonia and confirmed its official locale still falls back to a 404 root plus empty `page?key=` shells, then added a tested brand filter so the map can show a single brand's confirmed footprint at a time.
**Result**: pass
**TODO**: Re-check Leapmotor's Gulf locales only after their public locale roots and dealer or support flows go live.

## 2026-03-25
**Did**: Re-checked Leapmotor's remaining Gulf locales and confirmed Bahrain and Kuwait now expose official `page?key=` market routes plus backend thank-you templates, while Saudi Arabia, Qatar, and Oman still resolve only to empty official templates with no public dealer or support flow.
**Result**: pass
## 2026-03-25
**Did**: Added clickable country details on the map so users can inspect a selected country's confirmed brand presence and jump to the official source URLs, backed by new derived-data tests and UI coverage.
**Result**: pass

## 2026-03-25
**Did**: Added a country lookup control and explicit empty-state country details so users can inspect any country, even when the current brand filter has no tracked official presence there.
**Result**: pass

## 2026-03-25
**Did**: Added a brand-footprint panel for the active brand filter so users can browse that brand's confirmed markets, open official source links, and jump straight into country details.
**Result**: pass
