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

## 2026-03-25
**Did**: Added shareable map state so brand and country selections persist in the URL and users can copy a direct link to the current view.
**Result**: pass

## 2026-03-25
**Did**: Marked the remaining Leapmotor Gulf follow-up as `[monitoring]` after the same-day inconclusive checks, then added a hover preview panel so users can inspect a country's current filtered brand count before clicking.
**Result**: pass

## 2026-03-25
**Did**: Added filtered-country context in the hover preview and country details so brand-filtered views now explain when additional tracked brands exist outside the active filter.
**Result**: pass

## 2026-03-26
**Did**: Added an all-brands coverage panel so users can compare confirmed tracked markets per brand, jump into a brand filter, and open each brand's official website directly from the map.
**Result**: pass

## 2026-03-26
**Did**: Added ORA as a tracked brand with 6 verified official markets (China, United Kingdom, Australia, New Zealand, Malaysia, and Nepal) using official model, dealer, and test-drive surfaces, and recorded further ORA expansion in the backlog.
**Result**: pass

## 2026-03-26
**Did**: Added ORA South Africa after confirming the live national ORA 03 market page and official GWM South Africa dealer locator, and tightened the ORA backlog around markets that still lack a second distinct ORA-specific official surface.
**Result**: pass
**TODO**: Verify whether ORA Sri Lanka should count as official presence — the official distributor homepage names the ORA range, but the live site still lacks a second distinct ORA-specific page or brochure URL.

## 2026-03-26
**Did**: Added ORA Sri Lanka after confirming the official GWM Sri Lanka site explicitly markets the ORA range and David Pieris Automobiles' official corporate site links directly to that localized market site.
**Result**: pass
## 2026-03-26
**Did**: Added ORA Thailand after confirming GWM Thailand's official localized site exposes live ORA 5 EV consumer pages, a working official ORA test-drive flow, and the national GWM Partner Stores locator.
**Result**: pass
**TODO**: Verify whether ORA Brazil should count as official presence — the current official `gwm.com.br` surfaces failed with certificate errors in both fetch and browser checks, so no trustworthy consumer or dealer evidence was captured today.

## 2026-03-27
**Did**: Added ORA Brazil after confirming GWM Brazil's live ORA 03 consumer page and official concessionária locator, resolving the prior certificate-related follow-up with updated official URLs.
**Result**: pass

## 2026-03-27
**Did**: Added ORA Ireland after confirming the live official `ora-ev.ie` market site, its rendered authorized retailer network, and Ireland-specific ORA 03 product materials on the same first-party domain.
**Result**: pass

## 2026-03-27
**Did**: Added ORA Jordan after confirming the official GWM Jordan ORA landing page, its linked showroom and test-drive flows, and the local ORA model-detail page operated by Nahj Al-Manar.
**Result**: pass

## 2026-03-27
**Did**: Added ORA Germany and Sweden after confirming GWM Europe's official ORA test-drive market list plus each market's live local ORA consumer and test-drive pages.
**Result**: pass
**TODO**: Verify whether ORA Israel should count as official presence — GWM Europe's official test-drive page still lists Israel, but the linked `ora-israel.co.il` root currently fails with a 403/404 browser result instead of a usable consumer or dealer flow.
## 2026-03-27
**Did**: Added ORA Israel after confirming GWM Europe's official test-drive page still lists Israel and Colmobil for ORA 03, while the linked local `ora-israel.co.il` domain currently serves a broken page.
**Result**: pass

## 2026-03-27
**Did**: Added ORA Argentina after confirming GWM Argentina's live ORA 03 product page and official nationwide concesionarios listing on the same first-party market site.
**Result**: pass
## 2026-03-27
**Did**: Added ORA Mexico after confirming GWM Global's country directory links Mexico to the official `gwm-mx.com` market site, whose live ORA 03 product page and distributor locator expose a real local consumer and dealer flow.
**Result**: pass
## 2026-03-27
**Did**: Added ORA Uruguay after confirming the official `gwm.com.uy` market site exposes a dedicated ORA 03 product page with pricing plus a live national concesionarios page on the same first-party domain.
**Result**: pass
## 2026-03-27
**Did**: Stopped after the Mexico and Uruguay ORA additions because the current Chile and Peru ORA routes still failed simple fetch checks, so I left those markets unverified instead of guessing.
**Result**: pass
**TODO**: Verify whether ORA Chile and Peru should count as official presence — their current local ORA routes need browser-based validation before they are safe to add.
## 2026-03-28
**Did**: Added ORA Chile after confirming GWM Chile's live ORA landing page, ORA 03 product page, and national official dealer network, and closed Peru without adding it because GWM Peru's official ORA page still labels ORA 03 and ORA 03 GT as "PRÓXIMAMENTE" with no live sale or dealer flow.
**Result**: pass
## 2026-03-28
**Did**: Added ORA Colombia after confirming GWM Colombia's live ORA 03 product page with pricing and quote flow plus its nationwide first-party dealer and service locator.
**Result**: pass

## 2026-03-28
**Did**: Added ORA Qatar after confirming GWM Qatar's live ORA electric-car market page and its ORA-preselected official test-drive flow on the same first-party market site.
**Result**: pass
## 2026-03-28
**Did**: Added ORA Lebanon after confirming GWM Lebanon's live ORA 03 model page plus its first-party showroom and test-drive flows on the same official market site.
**Result**: pass
**TODO**: Verify whether ORA Oman should count as official presence — the official Oman site exposes ORA pages and a test-drive flow, but today's fetches mixed in cross-market references that need a cleaner Oman-specific showroom confirmation before it is safe to add.

## 2026-03-28
**Did**: Closed the ORA Oman follow-up without adding Oman after confirming the official Oman ORA page is broken and the live Oman test-drive form excludes ORA, then added ORA Ecuador from GWM Ecuador's official ORA 03 GT page and nationwide branches page.
**Result**: pass
**TODO**: Verify the next strongest ORA sovereign market beyond the updated footprint, prioritizing Costa Rica if its first-party sales and support flows remain live.
## 2026-03-29
**Did**: Added ORA Costa Rica after confirming Grupo Q's official ORA 03 market page plus its official Costa Rica quote and contact flows, while noting that the same first-party pages are currently shielded behind AWS human verification for unauthenticated fetches.
**Result**: pass
## 2026-03-29
**Did**: Added ORA Jamaica after confirming GWM's official global market list links Jamaica to `gwmjamaica.com`, whose live first-party ORA 03 model page, test-drive flow, and local contact details establish a consumer market presence.
**Result**: pass
## 2026-03-29
**Did**: Added ORA official presence for Antigua and Barbuda, the Bahamas, Barbados, Grenada, Haiti, Saint Kitts and Nevis, Saint Lucia, Saint Vincent and the Grenadines, and Trinidad and Tobago after confirming GWM's global market directory points to GWM Caribbean, whose live dealer network lists each market and whose ORA test-drive flow exposes those territories with Ora 03/GT selections.
**Result**: pass
**TODO**: Verify whether ORA Dominica and Guyana should count as official presence — GWM Caribbean lists local dealers for both, but today's live ORA test-drive territory list still omits them.
## 2026-03-29
**Did**: Closed the ORA Dominica and Guyana follow-up after confirming GWM Caribbean's official dealer network still lists both markets, but the live ORA test-drive form omits them and the official Caribbean model payload assigns those territories only to Haval, Tank, or P-Series models rather than any ORA entry.
**Result**: pass
## 2026-03-29
**Did**: Added ORA Dominican Republic after confirming Great Wall Motor Dominican Republic's official ORA 03 GT consumer page plus its first-party authorized dealers page.
**Result**: pass
## 2026-03-29
**Did**: Added ORA Bulgaria after confirming GWM Europe's official Bulgaria-localized homepage and live Bulgaria ORA 03 market page, while leaving Paraguay out because its current official GWM Paraguay site still exposes only non-ORA lines.
**Result**: pass
**TODO**: Verify the next strongest ORA sovereign market beyond the updated footprint, prioritizing first-party country locales that expose both a localized ORA consumer page and a distinct local support or dealer surface.
## 2026-03-29
**Did**: Added ORA Singapore after confirming GWM's official global market directory points Singapore to Cycle & Carriage and the live local ORA site exposes both a consumer Good Cat page and an authorised Singapore showroom/contact flow.
**Result**: pass
**TODO**: Verify the next strongest ORA sovereign market beyond the updated footprint, prioritizing official local distributor sites that expose both an ORA consumer page and a live showroom, dealer, or service surface.

## 2026-03-29
**Did**: Added ORA Estonia, Latvia, Lithuania, and Iceland after confirming live official local ORA market pages plus Baltic dealer or test-drive surfaces and Iceland's linked Hekla contact/test-drive flow.
**Result**: pass
**TODO**: Verify the next strongest ORA sovereign market beyond the updated footprint, prioritizing official local ORA sites in Europe or other uncovered regions that expose both a consumer page and a live dealer, showroom, or test-drive surface.

## 2026-03-29
**Did**: Re-checked ORA Saudi Arabia, Syria, Algeria, Tunisia, and Mauritius against GWM's official global directory plus each first-party local site, then closed those leads for now because none currently exposes a distinct ORA consumer page with matching local showroom, dealer, contact, or test-drive support.
**Result**: pass

## 2026-03-30
**Did**: Added ORA Brunei after confirming GWM's official global market directory links Brunei to the live local GWM Brunei site, whose first-party ORA and ORA Good Cat pages plus dealer-location network establish a consumer market presence.
**Result**: pass

## 2026-03-30
**Did**: Added ORA Indonesia after confirming GWM Indonesia's live ORA 03 BEV consumer page and official nationwide dealer-network page on the same first-party market site.
**Result**: pass
**TODO**: Verify the next strongest ORA sovereign market beyond the updated footprint, prioritizing first-party local sites that expose both a localized ORA consumer page and a distinct dealer, showroom, contact, or test-drive surface.
## 2026-03-30
**Did**: Closed the generic ORA next-market follow-up after re-checking Peru, Bolivia, and GWM Europe’s official ORA test-drive market list, then added an always-available open share link alongside the copy action so shareable map state stays usable even when clipboard access is unavailable.
**Result**: pass
## 2026-03-30
**Did**: Re-checked the strongest remaining ORA leads in Peru, Bolivia, Paraguay, Panama, and the Philippines against first-party sites and narrowed the backlog away from markets that still fail the official-presence bar.
**Result**: pass

## 2026-03-30
**Did**: Added ORA Pakistan after confirming GWM Sazgar Pakistan's live official ORA 03 model page and nationwide Find a Dealer flow on `gwm-pakistan.com`, which also lists ORA 03 and ORA 07 across the local model range.
**Result**: pass
**TODO**: Verify whether ORA Cambodia should count as official presence if `gwm-kh.com` becomes reachable again — search results point to official ORA and new-energy pages, but both direct fetches and browser checks returned connection refused today.
## 2026-03-30
**Did**: Re-checked ORA Cambodia against Oneroad Group's official Great Wall Cambodia launch post and Oneroad Cambodia's official contact page, while the official `gwm-kh.com` ORA route still returned connection refused in both fetch and browser checks, so I did not add Cambodia without a live ORA-specific consumer or dealer flow.
**Result**: pass
**TODO**: Verify whether ORA Cambodia should count as official presence if `gwm-kh.com` becomes reachable again — Oneroad's official pages confirm the Cambodia distributor relationship, but the official ORA market site still could not be reached today.
## 2026-03-30
**Did**: Moved ORA Cambodia out of the active follow-up queue into monitoring-only backlog status after another no-change reachability check, and made the map legend switch to a single-brand footprint mode whenever a brand filter is active so the color key stays accurate.
**Result**: pass

## 2026-03-30
**Did**: Added ORA Morocco after confirming Great Wall Motors Maroc's live ORA 03 consumer page and official Moroccan concessionnaire network on the same first-party market site.
**Result**: pass
## 2026-03-30
**Did**: Re-checked ORA Philippines after current official search results surfaced a live `gwm.com.ph/models/ora` route, and confirmed GWM Philippines still does not meet the official-presence bar because the ORA detail page fails against the site's own model API while the live public model list still exposes only Haval H9, Cannon Pilot, and Cannon even though the dealership directory is now active.
**Result**: pass
## 2026-03-30
**Did**: Re-checked ORA India and Oman from GWM's official global market directory, confirmed India's listed local domain is currently unreachable in browser and fetch checks, and found that Oman's live first-party site still exposes only Haval, Tank, and pickup content plus generic locations and test-drive flows with no ORA consumer surface, then narrowed the ORA backlog accordingly.
**Result**: pass
## 2026-03-30
**Did**: Re-checked ORA Bahrain and the United Arab Emirates against GWM's official global market directory plus each live first-party local site, then moved both leads to monitoring because Bahrain still exposes only a Haval-only market site with no working ORA route while the UAE official site explicitly limits its local portfolio to Haval, Tank, and Poer.
**Result**: pass

## 2026-03-30
**Did**: Re-checked ORA Canada and kept it out of the dataset because the live official `gwmcanada.ca` site is still only a generic "Launching Soon" shell with a contact form and no public ORA model, dealer, showroom, or test-drive flow, then moved the lead into monitoring.
**Result**: pass
## 2026-03-30
**Did**: Re-checked ORA Netherlands, Belgium, Portugal, and Spain against GWM Europe's live ORA 03, test-drive, and contact surfaces, then narrowed the backlog because those markets still expose only centralized EU marketing/contact pages rather than country-specific consumer or dealer flows.
**Result**: pass

## 2026-03-30
**Did**: Added ORA Iraq after confirming GWM Iraq's live ORA market pages plus the official contact page that names Nahj Al-Iraq as the exclusive distributor and exposes local showroom and service flows.
**Result**: pass
## 2026-03-30
**Did**: Re-checked ORA Serbia against Great Wall Serbia's official `greatwall.rs` site plus Centar S's first-party distributor page, then narrowed the active ORA backlog because Serbia still exposes only general GWM/distributor surfaces with no live ORA-specific consumer or dealer flow.
**Result**: pass
## 2026-03-30
**Did**: Re-checked ORA Oman after GWM's official global directory and local Omani site surfaced a new ORA navigation link, then kept Oman out of the dataset because the first-party `/en/ora/ora.html` route still returns the site's own 404 page while the public Oman test-drive and contact flows remain generic rather than ORA-specific.
**Result**: pass

## 2026-03-30
**Did**: Added ORA Bangladesh after confirming GWM's official global market directory links Bangladesh to the live local `haval.com.bd` site, whose first-party ORA EV market page and Bangladesh contact flow establish a consumer market presence.
**Result**: pass
## 2026-03-30
**Did**: Re-checked ORA Austria, Italy, and Greece against GWM Europe's live ORA 03 and service/contact surfaces, then narrowed the backlog because all three markets still expose only centralized EU pages while guessed country roots return 404 and no local dealer, showroom, or market-specific handoff is live yet.
**Result**: pass
## 2026-03-30
**Did**: Re-checked ORA Egypt, Mozambique, Moldova, Uzbekistan, and Tajikistan against GWM's official global market directory plus each linked first-party local site, then moved those leads to monitoring because the live sites still expose only Haval/GWM non-ORA lineups or fail to load.
**Result**: pass
## 2026-03-30
**Did**: Added ORA Azerbaijan after confirming GWM Azerbaijan's live first-party ORA model page plus local test-drive and contact flows establish a consumer market presence.
**Result**: pass
**TODO**: Verify whether ORA Kuwait should count as official presence if `haval.com.kw` becomes reliably reachable — GWM's official market directory still lists Kuwait, but both fetch and browser checks timed out today before any ORA consumer or dealer flow could be confirmed.
## 2026-03-30
**Did**: Re-checked ORA Kuwait against GWM's official global market directory plus the live `haval.com.kw` root and likely ORA routes, then narrowed the ORA backlog further because GWM Europe's official ORA test-drive page still lists current availability only in Germany, Ireland, Israel, Sweden, and the United Kingdom.
**Result**: pass
## 2026-03-31
**Did**: Added ORA Ukraine after confirming GWM's official global market selector links Ukraine to the live local `haval-ukraine.com` site and that same official site now exposes a dedicated ORA catalogue page for the Ukrainian market.
**Result**: pass
## 2026-03-31
**Did**: Re-checked ORA Bolivia against GWM's official global market directory and Autokorp's live Bolivia site, confirmed the official local site still exposes only Great Wall and Haval ranges plus branches/service pages with no ORA consumer flow, and narrowed the backlog away from that lead.
**Result**: pass
## 2026-03-31
**Did**: Re-checked ORA Italy, India, and Libya against GWM's official global market directory plus each current local site, confirmed Italy's listed `haval.it` domain is still a legacy Haval-only site with no ORA route while the official India and Libya leads remain unreachable, and tightened the ORA backlog away from those low-signal paths.
**Result**: pass
## 2026-03-31
**Did**: Re-checked ORA France, the Netherlands, and Poland against GWM Europe's live homepage, official ORA test-drive list, and guessed country-specific roots, then narrowed the backlog because Europe still exposes only an EU-wide ORA site while those local roots return 404.
**Result**: pass
## 2026-03-31
**Did**: Added country-details drilldown actions so users can open a listed brand's official website and jump straight from a selected country into that brand's filtered footprint, with test coverage for the new flow.
**Result**: pass
## 2026-03-31
**Did**: Added a switchable all-brands coverage panel so users can compare either brand rankings or country rankings and jump from country coverage leaders straight into the country details view, while demoting the saturated ORA expansion backlog item into concise monitoring-only follow-up.
**Result**: pass
## 2026-03-31
**Did**: Added searchable filters, result counts, and empty states to the brand-footprint and coverage panels so users can quickly narrow long brand and country lists as the dataset grows.
**Result**: pass
## 2026-03-31
**Did**: Lazy-loaded the main EV map behind a tested loading shell so the app can show immediate feedback while deferring the heavy map bundle until it is needed.
**Result**: pass
## 2026-03-31
**Did**: Synced the map's brand and country selection with browser history navigation so shared URLs now stay in step with back/forward actions, backed by a focused interaction test.
**Result**: pass

## 2026-03-31
**Did**: Split the heavy interactive map canvas out of `EVMap` so the data panels, filters, and country details render immediately while the MapLibre chunk loads, and added coverage for the new in-place loading shell.
**Result**: pass
## 2026-03-31
**Did**: Added a regional coverage view so users can compare confirmed presence by region and drill from a region into country rankings, backed by new region-summary helpers and UI coverage tests.
**Result**: pass
## 2026-03-31
**Did**: Replaced the long country lookup select with a searchable country-or-ISO lookup that shows live matches, supports quick clearing, and jumps directly into country details, backed by UI coverage.
**Result**: pass
## 2026-03-31
**Did**: Made the coverage analysis shareable by persisting the active coverage tab and regional drill-down in the URL, and added tests to verify restoration plus browser-history sync for those views.
**Result**: pass
## 2026-03-31
**Did**: Added a first-class region filter so users can narrow the map, lookup, shareable URL state, and brand footprint to a single world region, backed by helper and UI coverage.
**Result**: pass
## 2026-03-31
**Did**: Added filtered CSV and JSON dataset exports to the map summary so users can download the current brand- and region-scoped view for offline analysis, backed by new export helpers and UI coverage.
**Result**: pass
## 2026-03-31
**Did**: Replaced the growing brand dropdown with a searchable brand filter that shows live matches, supports one-click clearing, and keeps the filtered map footprint flow test-covered.
**Result**: pass

## 2026-03-31
**Did**: Added sort controls for the coverage rankings and brand-footprint lists, and persisted those sort choices in the shareable URL state with focused UI coverage.
**Result**: pass
## 2026-03-31
**Did**: Added BYD official presence for the United Arab Emirates and Jordan after confirming live localized BYD market sites plus UAE showroom listings and Jordan contact/dealer surfaces on official local domains, and created a new actionable backlog item for the broader BYD coverage gap.
**Result**: pass
**TODO**: Verify the next strongest BYD markets beyond the updated footprint, prioritizing official local sites that expose both localized consumer pages and live showroom, dealer, or service flows.
## 2026-03-31
**Did**: Added BYD official presence for Saudi Arabia and the Philippines after confirming BYD's official global-to-local market handoffs plus live local showroom, dealer, service, or test-drive surfaces.
**Result**: pass
**TODO**: Verify the next strongest BYD markets beyond the updated footprint, prioritizing official Southeast Asia and Latin America local sites that expose localized consumer pages plus live dealer or service flows.

## 2026-03-31
**Did**: Added BYD official presence for Indonesia, Malaysia, Mexico, and Chile after confirming localized passenger-car sites plus official local contact, aftersales, or dealer-network surfaces.
**Result**: pass
**TODO**: Verify the next strongest BYD markets beyond the updated footprint, prioritizing official Southeast Asia and Latin America local sites that expose localized consumer pages plus live dealer, contact, or service flows.

## 2026-03-31
**Did**: Added keyboard shortcuts so Ctrl/Cmd+K focuses the brand filter, Escape clears active searches and lookups, and arrow keys switch the coverage tabs, backed by a focused EVMap interaction test.
**Result**: pass

## 2026-03-31
**Did**: Added BYD official presence for Colombia after confirming BYD's own Colombia dealer-network page plus BYD-hosted local distributor and passenger-vehicle launch coverage.
**Result**: pass
**TODO**: Verify the next strongest BYD markets beyond the updated footprint, prioritizing official Southeast Asia and Latin America local sites that expose localized consumer pages plus live dealer, contact, or service flows.
## 2026-03-31
**Did**: Added BYD official presence for Peru, Ecuador, Costa Rica, and Vietnam after confirming BYD's own dealer-directory country pages plus rendered city dealer pages on the official `byd.international` domain.
**Result**: pass
**TODO**: Verify the next strongest BYD markets beyond the updated footprint, prioritizing official Latin American dealer-directory markets with clear city-level dealer pages.
## 2026-03-31
**Did**: Added BYD official presence for Panama, Paraguay, and Uruguay after confirming BYD's own dealer-directory country pages plus city-level authorized dealer listings on the official `byd.international` domain.
**Result**: pass
**TODO**: Verify the next strongest BYD markets beyond the updated footprint, prioritizing remaining official Latin American or Southeast Asian BYD markets with country pages plus city-level dealer listings or local passenger-car sites.
## 2026-03-31
**Did**: Added BYD official presence for Singapore, the Dominican Republic, Guatemala, El Salvador, Bolivia, Cambodia, and Laos after confirming official local BYD market sites plus BYD-hosted dealer-directory, contact, or showroom evidence.
**Result**: pass
**TODO**: Verify the next strongest BYD markets beyond the updated footprint, prioritizing official Central American and Caribbean BYD markets with localized consumer pages plus live dealer, contact, or service flows.
## 2026-03-31
**Did**: Added BYD official presence for Nicaragua after confirming BYD's own country, city, and authorized-dealer pages for Managua on the official `byd.international` directory.
**Result**: pass
**TODO**: Verify the next strongest BYD markets beyond the updated footprint, prioritizing remaining official Central American and Caribbean BYD markets with localized consumer pages or BYD-hosted dealer-detail pages.
## 2026-03-31
**Did**: Added a one-click reset view control that clears the active brand, country, region, ranking state, and panel searches back to the default map view, with focused UI coverage.
**Result**: pass

## 2026-03-31
**Did**: Added BYD official presence for the Bahamas, Antigua and Barbuda, Barbados, Jamaica, Suriname, and Trinidad and Tobago after confirming BYD's own Bahamas locale plus the official BYD Caribbean dealer network and live regional test-drive flow.
**Result**: pass
**TODO**: Verify the next strongest BYD locales beyond the updated Americas footprint, prioritizing remaining official BYD market sites in Europe, Africa, and Asia-Pacific with live dealer, contact, or service flows.
## 2026-03-31
**Did**: Added BYD official presence for Japan, South Korea, Serbia, and South Africa after confirming official local passenger-car sites plus live dealer, showroom, contact, or service surfaces on BYD-owned pages.
**Result**: pass
**TODO**: Verify the next strongest BYD locales beyond the updated footprint, prioritizing remaining official BYD market sites in Europe, Africa, and Asia-Pacific with live dealer, contact, or service flows.
## 2026-03-31
**Did**: Added BYD official presence for Spain, France, Italy, the Netherlands, and Sweden after confirming live localized BYD market sites plus official contact, service, or dealer-network surfaces on first-party BYD domains.
**Result**: pass
**TODO**: Verify the next strongest BYD locales beyond the updated footprint, prioritizing remaining official BYD Europe markets such as Austria, Portugal, Poland, Denmark, and Romania plus any Africa or Asia-Pacific locales with live first-party contact, dealer, or service flows.
## 2026-03-31
**Did**: Added explanatory tooltips to the map's existing Uncertain badges so users can understand the verification status directly in the country details and brand-footprint panels, backed by a focused UI test.
**Result**: pass
## 2026-03-31
**Did**: Added BYD official presence for Austria, Portugal, Poland, Denmark, and Romania after confirming live localized BYD market pages plus first-party about/store or market-support routes on the same country domains.
**Result**: pass
**TODO**: Verify the next strongest BYD locales beyond the updated footprint, prioritizing remaining official BYD Europe markets such as Czechia, Croatia, Estonia, Finland, Greece, Hungary, Slovakia, and Turkey plus any Africa or Asia-Pacific locales with live first-party contact, dealer, or service flows.

## 2026-03-31
**Did**: Added BYD official presence for Czechia, Croatia, Finland, and Slovakia after confirming live localized BYD market sites plus first-party about/store routes on official BYD country domains.
**Result**: pass
**TODO**: Verify the next strongest BYD locales beyond the updated footprint, prioritizing remaining official BYD Europe markets such as Estonia, Greece, Hungary, and Turkey plus any Africa or Asia-Pacific locales with live first-party contact, dealer, or service flows.

## 2026-04-01
**Did**: Added BYD official presence for Estonia, Greece, Hungary, and Turkey after confirming live localized BYD market sites plus official contact, dealer-finder, or sitemap-backed support routes on BYD-owned country domains.
**Result**: pass
**TODO**: Verify the next strongest BYD locales beyond the updated footprint, prioritizing Africa and Asia-Pacific markets with live first-party contact, dealer, or service flows.

## 2026-04-01
**Did**: Added BYD official presence for Nigeria, Kenya, Rwanda, and New Zealand after confirming missing first-party local BYD market sites plus live customer-care, dealer-finder, service, or contact surfaces on official BYD domains.
**Result**: pass
**TODO**: Verify the next strongest BYD Africa and Asia-Pacific locales beyond the updated footprint, prioritizing sovereign markets such as Egypt, Morocco, Mauritius, Tanzania, and Uzbekistan if their official BYD local sites keep exposing live customer-care, dealer, or service flows.

## 2026-04-01
**Did**: Added BYD official presence for Egypt, Morocco, Mauritius, Tanzania, and Uzbekistan after confirming localized BYD market sites plus live dealer, contact, test-drive, or service-network surfaces on official first-party or authorized local distributor pages.
**Result**: pass

## 2026-04-01
**Did**: Added uncertainty-aware single-brand map styling so filtered views now distinguish confirmed and uncertain official presence with matching legend guidance, backed by focused map utility and EV map tests.
**Result**: pass

## 2026-04-01
**Did**: Added BYD official presence for Kazakhstan, Pakistan, and Nepal after confirming BYD's own dealer-directory country pages plus live local distributor, experience-center, or dealer-network surfaces on official market sites.
**Result**: pass

## 2026-04-02
**Did**: Added BYD official presence for Bangladesh and Sri Lanka after confirming BYD's official country and city dealer-directory pages plus live local BYD market sites with consumer and after-sales messaging.
**Result**: pass

## 2026-04-02
**Did**: Added MG (SAIC) official presence for Mexico and the United Arab Emirates after confirming MG's official local service, distributor, and country contact pages across the Americas and Middle East.
**Result**: pass

## 2026-04-02
**Did**: Added an official website shortcut to the filtered brand footprint panel so users can jump straight from a brand's market list to its homepage, backed by EV map test coverage.
**Result**: pass
## 2026-04-02
**Did**: Added MG (SAIC) official presence for Saudi Arabia and Chile after confirming live first-party MG market, service, contact, and MG Latam distributor pages, and narrowed the remaining MG backlog to the still fetch-hostile Americas markets.
**Result**: pass

## 2026-04-02
**Did**: Added MG (SAIC) official presence for Guyana and Peru after confirming MG Latam lists both markets and matching local MG sites expose live consumer, contact, landing, or after-sales booking flows.
**Result**: pass

## 2026-04-02
**Did**: Added MG (SAIC) official presence for Argentina, Bolivia, Ecuador, Paraguay, Uruguay, and Venezuela after confirming MG Latam distributor listings plus live local MG consumer, dealer, contact, or MG Care surfaces across the remaining Americas backlog slice.
**Result**: pass

## 2026-04-03
**Did**: Added Chery as a tracked brand and confirmed official presence in China, Brazil, Chile, South Africa, Australia, and Malaysia using first-party market, dealer, roadside-assistance, and after-sales pages.
**Result**: pass

## 2026-04-03
**Did**: Improved keyboard accessibility by adding combobox-style lookup suggestion navigation plus Escape-to-close support for the floating country-details and brand-footprint panels, backed by focused EV map tests.
**Result**: pass

## 2026-04-03
**Did**: Confirmed Chery's official consumer-market presence in Saudi Arabia and Qatar using first-party local sites, test-drive flows, and service or branch pages, then added both markets to the dataset.
**Result**: pass

## 2026-04-03
**Did**: Added Chery official presence for the United Kingdom after confirming the live localized Chery UK market site plus first-party retailer, warranty, roadside-assistance, and customer-care pages.
**Result**: pass

## 2026-04-03
**Did**: Added NIO official presence for Sweden and Denmark after confirming live localized market pages plus first-party service, test-drive, and warranty/support surfaces, and narrowed the remaining NIO expansion follow-up to the bot-gated UAE site.
**Result**: pass

## 2026-04-04
**Did**: Added NIO official presence for the United Arab Emirates after confirming NIO's dedicated UAE locale via the official `en_AE` sitemap and global news posts announcing NIO MENA's UAE launch plus live UAE sales and service networks.
**Result**: pass

## 2026-04-04
**Did**: Added explicit EV dataset and country-boundary load error states so the map surfaces failed fetches instead of hanging on loading, backed by focused EV map tests for both failure paths.
**Result**: pass

## 2026-04-04
**Did**: Added Chery official presence for Indonesia and the Philippines after confirming live local Chery sites plus first-party dealer, after-sales, booking-service, and test-drive flows across both markets, and promoted the next Chery Southeast Asia verification slice into the backlog.
**Result**: pass

## 2026-04-04
**Did**: Added Chery official presence for Bangladesh after confirming the official local Chery site plus first-party contact, service, and test-drive flows, and narrowed the remaining Chery Southeast Asia backlog to Vietnam.
**Result**: pass

## 2026-04-04
**Did**: Added MG (SAIC) official presence for Germany, France, Ireland, Italy, and the Netherlands after confirming official local MG sites plus first-party contact, service, or dealer-network pages across the European footprint.
**Result**: pass

## 2026-04-05
**Did**: Added MG (SAIC) official presence for Belgium, Norway, Spain, and Portugal after confirming live local MG homepages plus first-party contact and owner-support pages across each market.
**Result**: pass
## 2026-04-05
**Did**: Added MG (SAIC) official presence for Austria, Denmark, Finland, Iceland, and Sweden after confirming live localized MG market sites plus first-party contact, owners, or service-network surfaces across each market.
**Result**: pass
## 2026-04-05
**Did**: Added a one-click country copy action in the country-details panel so users can copy the selected country name and ISO code for reuse outside the map, backed by EV map coverage.
**Result**: pass
## 2026-04-05
**Did**: Added MG (SAIC) official presence for Croatia, Estonia, Greece, Hungary, Poland, and Slovenia after confirming live local MG market sites plus first-party contact or owner-support surfaces on each country domain.
**Result**: pass
## 2026-04-05
**Did**: Added MG (SAIC) official presence for Albania, Bosnia and Herzegovina, Bulgaria, Latvia, Lithuania, Luxembourg, North Macedonia, Serbia, and Switzerland after confirming live localized MG country sites plus first-party contact or owner-support pages, then removed the completed MG Europe backlog slice.
**Result**: pass

## 2026-04-05
**Did**: Added XPENG official presence for Thailand after coverage analysis flagged its empty Southeast Asia footprint, using XPENG Thailand's live market and after-sales pages plus XPENG's official Thailand dealer-network and shipment announcements, and added the broader Southeast Asia follow-up to the backlog.
**Result**: pass

## 2026-04-05
**Did**: Added copy-sources actions to the country-details and brand-footprint panels so users can reuse multi-link verification evidence directly from the map, backed by EV map coverage.
**Result**: pass
