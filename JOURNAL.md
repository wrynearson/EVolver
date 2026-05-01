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

## 2026-04-06
**Did**: Added XPeng official presence for Malaysia after confirming XPENG's live Malaysia site, head-office contact surface, branch locator, and XPENG's own Malaysia launch announcement, then advanced the XPENG Southeast Asia backlog to Singapore.
**Result**: pass

## 2026-04-06
**Did**: Added XPeng official presence for Singapore after confirming XPENG Singapore's live market site, showroom page, and servicing-and-warranty support surface, which closes the current XPENG Southeast Asia backlog slice.
**Result**: pass

## 2026-04-06
**Did**: Added automatic map fit-to-selection behavior so the canvas zooms to the active country or region filter instead of staying at the world view, backed by new bounds helpers and focused EV map coverage.
**Result**: pass
## 2026-04-06
**Did**: Added XPeng official presence for the United Arab Emirates after confirming XPENG's dedicated UAE market site, XPENG's own UAE launch announcement, and the Ali & Sons / Gulf Star Motors distributor page, then promoted the broader XPENG Middle East follow-up into the backlog.
**Result**: pass
## 2026-04-06
**Did**: Added XPeng official presence for Jordan, Lebanon, and Egypt after confirming XPENG's own Middle East partnership announcement plus live local Jordan and Lebanon market/support sites and XPENG Egypt service surfaces with Raya Auto's exclusive-agent launch page, which closes the current XPENG Middle East backlog slice.
**Result**: pass

## 2026-04-07
**Did**: Coverage analysis showed the backlog had drifted to monitoring-only work, so I promoted Neta as the highest-impact gap and added it as a tracked brand with confirmed official presence in China, Indonesia, Malaysia, Brazil, the United Arab Emirates, and Ethiopia using Neta's global market selector plus live local market, dealer, showroom, or distributor pages.
**Result**: pass

## 2026-04-07
**Did**: Improved the brand-footprint panel by showing each market's region label and letting the footprint search match on region names as well as country names and ISO codes, backed by EV map coverage.
**Result**: pass

## 2026-04-07
**Did**: Added Neta official presence for Thailand after confirming Neta's live Thailand market site, the official Thailand about page naming Neta Auto (Thailand) Co., Ltd., and Neta-hosted dealer-network plus test-drive flows on `neta.co.th`.
**Result**: pass

## 2026-04-07
**Did**: Stabilized EVMap clipboard feedback and removed flaky transient-label assertions from the integration test while preserving clipboard side-effect coverage.
**Result**: pass

## 2026-04-07
**Did**: Narrowed the Neta backlog to monitoring after re-checking Neta's official global surfaces and finding no new sovereign market sites beyond the current footprint, then improved empty country details so they suggest tracked brands already confirmed elsewhere in the same region.
**Result**: pass

## 2026-04-08
**Did**: Coverage analysis showed the backlog had drifted back to monitoring-only work, so I promoted AION as the highest-impact gap and added it as a tracked brand with confirmed official presence in China, Thailand, the Philippines, Brazil, and South Africa using official market, model, dealer, and test-drive pages.
**Result**: pass
**TODO**: Verify AION's next highest-impact sovereign markets beyond the initial footprint, prioritizing Kazakhstan, Uzbekistan, Australia, and the strongest Middle East locales with live first-party consumer-market pages.

## 2026-04-08
**Did**: Added AION official presence for Australia, Kuwait, and Uzbekistan after confirming live localized GAC market pages plus official AION model, service, or contact surfaces, and narrowed the remaining AION follow-up away from Kazakhstan because the official site still exposes no live Kazakhstan AION route.
**Result**: pass
**TODO**: Verify AION's next strongest sovereign markets beyond the updated footprint, prioritizing Chile, Panama, Bolivia, and any remaining Middle East locale that exposes a live first-party AION model page.

## 2026-04-08
**Did**: Added AION official presence for Chile and Panama after confirming live localized GAC market sites plus official AION product, dealer, and contact/support surfaces on first-party country domains.
**Result**: pass
**TODO**: Verify AION's next strongest sovereign markets beyond the updated footprint, prioritizing Bolivia and any remaining Middle East locale that exposes a live first-party AION model or support page.

## 2026-04-08
**Did**: Added AION official presence for Bolivia after confirming GAC Bolivia's live localized market, AION Y product, and Bolivia test-drive pages, then demoted the remaining AION Middle East follow-up to monitoring because Bahrain and Oman still 404 while Qatar and Saudi Arabia remain GAC-only.
**Result**: pass
## 2026-04-09
**Did**: Coverage analysis showed Li Auto was the highest-impact untracked gap, so I added it as a tracked brand with confirmed official presence in China after validating Li Auto's official home and store-finder surfaces, and I demoted any non-China follow-up to monitoring because the current official Chinese and English sites still expose only the China network.
**Result**: pass

## 2026-04-09
**Did**: Coverage analysis showed Voyah was the highest-impact actionable gap beyond the monitoring-only backlog, so I added Voyah as a tracked brand with confirmed official presence in China, Norway, Israel, Denmark, and the Netherlands using Voyah's official global and local-market surfaces plus Dongfeng's official launch news pages.
**Result**: pass
**TODO**: Verify additional Voyah sovereign markets beyond the initial China, Norway, Israel, Denmark, and Netherlands slice using official localized sites or brand-hosted showroom, distributor, or service evidence.
## 2026-04-09
**Did**: Upgraded the coverage-panel tabs so arrow, Home, and End keyboard navigation now move focus with the active Brands/Countries/Regions tab, backed by focused EV map coverage.
**Result**: pass
## 2026-04-09
**Did**: Expanded Voyah coverage by adding Finland from Voyah's live Finnish market and test-drive pages, and strengthened the Denmark and Netherlands entries with direct local showroom, dealer, and contact sources instead of relying mainly on launch news.
**Result**: pass
**TODO**: Verify additional Voyah sovereign markets beyond the current China, Norway, Finland, Israel, Denmark, and Netherlands slice using official localized sites or brand-hosted showroom, distributor, or service evidence.
## 2026-04-09
**Did**: Added Voyah official presence for Belgium, Spain, and Italy after confirming live localized market sites plus official test-drive, showroom, service, commercial-network, or dealer pages on first-party country domains, and narrowed the follow-up toward the next explicit Europe leads named on Voyah's global homepage.
**Result**: pass
**TODO**: Verify the next strongest Voyah sovereign markets beyond the updated footprint, prioritizing Germany and Bulgaria because Voyah's global homepage explicitly lists them alongside already-confirmed European markets.
## 2026-04-09
**Did**: Added Voyah official presence for Germany after confirming ADG Sales GmbH's live German models and imprint pages expose Voyah Free consumer pricing plus a `info@voyah-motors.de` contact, and demoted Bulgaria to monitoring because Voyah's global homepage names it but `voyah.bg` still redirects into the German distributor stack while the likely public `/kontakti` route renders only a 404 shell.
**Result**: pass

## 2026-04-10
**Did**: Coverage analysis showed the backlog had drifted to monitoring-only work again, so I promoted the next actionable Voyah gap and added Portugal and Poland after confirming live localized Voyah market sites plus official local test-drive/contact and operator pages.
**Result**: pass
## 2026-04-10
**Did**: Coverage analysis showed the backlog had drifted to monitoring-only work again, so I promoted Hongqi as the highest-impact actionable gap and added it as a tracked brand with confirmed official presence in China, Germany, the United Arab Emirates, the Philippines, and Saudi Arabia using first-party market, contact, location, maintenance, and test-drive surfaces.
**Result**: pass

## 2026-04-10
**Did**: Expanded Hongqi coverage by adding Mexico, Norway, Sweden, Denmark, and the Netherlands after confirming live first-party local market sites plus official dealer, importer, or test-drive flows.
**Result**: pass
**TODO**: Verify Hongqi's next highest-impact sovereign markets beyond the updated footprint, prioritizing additional first-party local-market, dealer, or test-drive flows in Europe and the Gulf.
## 2026-04-10
**Did**: Expanded Hongqi coverage by adding Iceland, Poland, and Qatar after confirming live first-party local market sites plus official dealer, contact, location, or test-drive flows on their local Hongqi domains.
**Result**: pass
**TODO**: Verify Hongqi's next highest-impact sovereign markets beyond the current China, Germany, Iceland, Mexico, the Netherlands, Norway, Poland, Sweden, Denmark, the United Arab Emirates, Qatar, Saudi Arabia, and the Philippines footprint, prioritizing any remaining first-party local-market, dealer, or test-drive flows in Europe and the Gulf.
## 2026-04-10
**Did**: Added a country-level Copy all sources action in the details panel so users can copy every currently shown verification link for a market in one click, backed by EV map coverage.
**Result**: pass

## 2026-04-11
**Did**: Expanded Hongqi coverage by adding Belgium, the Czech Republic, and Oman after confirming live first-party local market sites plus official local contact, test-drive, warranty, or service-booking flows.
**Result**: pass
**TODO**: Verify Hongqi's next highest-impact sovereign markets beyond the updated footprint, prioritizing Bahrain and any remaining live first-party Europe locales with local dealer, contact, or test-drive flows.
## 2026-04-11
**Did**: After today's Hongqi Bahrain and Europe re-checks turned up unavailable, blocked, or non-market shells, I improved the map's brand and country comboboxes so pressing Enter now accepts the sole visible suggestion without requiring arrow-key navigation first.
**Result**: pass

## 2026-04-11
**Did**: Demoted the remaining Hongqi expansion follow-up to monitoring after re-checking Bahrain and the unresolved Europe leads against first-party surfaces and confirming they are still unavailable, blocked, or shell-only.
**Result**: pass

## 2026-04-11
**Did**: Made the shared map state more faithful by persisting coverage-panel and brand-footprint search queries in the URL and resetting the copy-link feedback whenever any shareable view state changes, backed by EV map coverage.
**Result**: pass

## 2026-04-11
**Did**: Coverage analysis showed AION was the highest-impact tracked brand still missing Europe, so I added Finland, Poland, and Portugal after confirming live first-party local AION/GAC market sites plus official dealer, importer, about, and test-drive flows on their localized consumer surfaces.
**Result**: pass

## 2026-04-12
**Did**: Added AION official presence for France after confirming GAC's live French tenant, first-party AION V model page, and French service page, then demoted the remaining AION Europe follow-up to monitoring because the official Europe stack still exposes no other sovereign locale roots beyond the already-tracked markets.
**Result**: pass

## 2026-04-12
**Did**: Added Chery official presence for Turkey, the United Arab Emirates, Egypt, Mexico, and Peru after confirming live first-party local market sites plus dealer, showroom, contact, service, or test-drive flows on each sovereign market surface.
**Result**: pass

## 2026-04-12
**Did**: Strengthened the export-helper guardrails by adding focused tests for source deduplication and CSV escaping of quoted or comma-containing fields.
**Result**: pass

## 2026-04-12
**Did**: Re-checked Chery Spain and Italy against live first-party domains and confirmed Spain's official domain remains unreachable while `chery.it` is still only a "coming soon" placeholder, so I demoted that expansion lead to monitoring in the backlog.
**Result**: pass

## 2026-04-12
**Did**: Hardened shareable map-state recovery so invalid country query params are cleared after data loads and locked the behavior with regression coverage for stale country and region URLs.
**Result**: pass

## 2026-04-12
**Did**: Coverage analysis showed the backlog had drifted to monitoring-only work again, so I promoted Deepal as the highest-impact actionable gap and added it as a tracked brand with confirmed official presence in China, Australia, Bangladesh, Singapore, Sri Lanka, and Thailand using first-party local market, dealer, contact, and test-drive flows.
**Result**: pass
**TODO**: Verify additional Deepal sovereign markets beyond China, Australia, Bangladesh, Singapore, Sri Lanka, and Thailand using official localized sites plus dealer, test-drive, or aftersales flows.

## 2026-04-13
**Did**: Added Deepal official presence for Pakistan after confirming the live local Deepal Pakistan site exposes consumer model pages plus a first-party dealership locator and register-your-interest test-drive flow.
**Result**: pass
**TODO**: Verify additional Deepal sovereign markets beyond China, Australia, Bangladesh, Pakistan, Singapore, Sri Lanka, and Thailand using official localized sites plus dealer, test-drive, or aftersales flows.

## 2026-04-13
**Did**: Added Deepal official presence for Nepal after confirming Changan Nepal's live Deepal model pages plus official dealer, contact, enquiry, and browser-verified test-drive flows on the local first-party site.
**Result**: pass
**TODO**: Verify additional Deepal sovereign markets beyond China, Australia, Bangladesh, Nepal, Pakistan, Singapore, Sri Lanka, and Thailand using official localized sites plus dealer, test-drive, or aftersales flows.

## 2026-04-13
**Did**: Added Deepal official presence for Peru and Uruguay after confirming Peru's live localized Deepal consumer site plus model and contact routes and Uruguay's sovereign Deepal site plus model pages and local contact and showroom details, then closed the stale generic Deepal follow-up by narrowing the remaining leads to monitoring-only parked or non-sovereign domains.
**Result**: pass
## 2026-04-13
**Did**: Added a region breakdown to the brand footprint panel so users can see a selected brand's market spread by region and jump directly into region-scoped map views, backed by new helper and EV map regression coverage.
**Result**: pass

## 2026-04-13
**Did**: Coverage analysis showed Xiaomi was the highest-impact uncovered major-region gap, but Xiaomi's official global, UK, and Spain surfaces still exposed only electronics content with no overseas EV market, dealer, service, or test-drive flow, so I added it to the monitoring backlog instead of inferring presence.
**Result**: pass

## 2026-04-13
**Did**: Added region-based sorting to the brand footprint panel so users can group a selected brand's markets geographically in either direction, backed by EV map regression coverage.
**Result**: pass

## 2026-04-14
**Did**: Closed the stale Leapmotor Nepal follow-up after confirming the official `leapmotor.net/nepal` locale still returns a 404 shell while the Israel locale still fails with a 500 error, so further active re-checking adds no value until Leapmotor publishes real public market pages.
**Result**: pass

## 2026-04-14
**Did**: Added one-click clear actions for the coverage and brand-footprint search boxes so users can quickly reset panel filters without reaching for Escape, backed by EV map regression coverage.
**Result**: pass

## 2026-04-14
**Did**: Coverage analysis showed the backlog had drifted to monitoring-only work again, so I promoted Deepal's strongest European gap and added Greece after confirming Changan Europe's live Greek Deepal S05 market page plus its first-party dealer, quote, service, and contact flows.
**Result**: pass

## 2026-04-14
**Did**: Coverage analysis still showed Deepal's Middle East footprint was empty, so I promoted the UAE as the highest-impact actionable gap and added it after confirming Al Tayer Motors' official DEEPAL UAE site, local aftersales servicing, showroom pages, and the Premier Motors launch announcement, then pruned the resolved `deepal.ae` lead and demoted Saudi Arabia to monitoring because `deepal.sa` is still bot-gated.
**Result**: pass

## 2026-04-14
**Did**: Added a one-click clear action for the top-level region filter so users can reset region-scoped map state and share links without reopening the select, backed by EV map regression coverage.
**Result**: pass

## 2026-04-15
**Did**: Coverage analysis showed Neta was still under-covered outside its existing Southeast Asia, Gulf, Brazil, and Ethiopia footprint, so I added Nepal after confirming the live `neta.cgmotors.com.np` local market site plus CG Motors' NETA X and Nepal service-center pages.
**Result**: pass

## 2026-04-15
**Did**: Re-checked Neta's official global surfaces and likely sovereign-domain leads, confirmed the global region selector still exposes only already-tracked sovereign markets plus non-sovereign Hong Kong, and closed the active Neta follow-up by demoting the remaining expansion work back to monitoring because `neta.com.vn`, `neta.com.ph`, and `neta.com.au` currently resolve to unrelated or non-EV sites instead of official Neta market, dealer, or service flows.
**Result**: pass

## 2026-04-15
**Did**: Coverage analysis showed Chery's European footprint was still limited to the United Kingdom, so I promoted Czech Republic as the highest-impact actionable gap and added it after confirming Chery Czech's localized homepage, live Czech test-drive booking page, and local Tiggo model pages.
**Result**: pass
## 2026-04-15
**Did**: Expanded Chery's European footprint by adding Poland and Slovakia after confirming both markets expose live localized Chery sites plus official dealer and test-drive flows, then narrowed the backlog to remaining European leads beyond that stronger footprint.
**Result**: pass

## 2026-04-16
**Did**: Expanded Chery's European footprint by adding Romania after confirming the live Chery Romania market site plus its first-party authorized dealer and service contact network.
**Result**: pass
## 2026-04-16
**Did**: Added an uncertain-only filter to the coverage panel so users can focus brand, country, and regional rankings on entries that still need verification, with shareable URL state and regression coverage for filtering, empty states, reset, and restore flows.
**Result**: pass

## 2026-04-16
**Did**: Expanded Chery's European footprint by adding Greece after confirming the live Chery Greece market site plus its official dealer-network and contact/test-drive pages on `chery.gr`.
**Result**: pass

## 2026-04-16
**Did**: Expanded Chery's European footprint by adding Hungary after confirming `cherymotors.hu` exposes a live localized market site plus first-party dealer-network and contact pages.
**Result**: pass

## 2026-04-17
**Did**: Expanded Chery's European footprint by adding Serbia, Ukraine, Estonia, Latvia, and Lithuania after confirming Chery's own global market manifest plus each live local market site and local contact or service surfaces.
**Result**: pass

## 2026-04-17
**Did**: Re-checked Chery's Sweden and Finland leads and found their official sovereign roots still unresolved or non-customer-facing, then improved the map's brand lookup suggestions so each match shows confirmed and uncertain market counts before selection.
**Result**: pass
## 2026-04-17
**Did**: Expanded Chery's European footprint by adding Moldova after confirming the live Chery Moldova market site plus its official local contact and service-booking flows operated by official distributor GBS SRL.
**Result**: pass
## 2026-04-17
**Did**: Re-checked NIO's announced Austria, Belgium, Czech Republic, Hungary, Luxembourg, Poland, and Romania expansion against NIO's June 2025 official rollout announcements and found those markets are still in phased distributor-launch status without live local consumer sites, so I demoted the backlog item to monitoring.
**Result**: pass
## 2026-04-17
**Did**: Added a one-click brand-website copy action in the brand footprint panel so users can copy the selected brand's official site URL directly from the map UI, backed by EV map regression coverage.
**Result**: pass
## 2026-04-17
**Did**: Fixed the EV map regression test for the brand-website copy action by re-querying the live brand footprint panel after its post-click re-render.
**Result**: pass
## 2026-04-17
**Did**: Closed the stale Hongqi follow-up because the remaining Bahrain and Europe leads were already demoted to `[monitoring]` after repeated official-site re-checks kept yielding unavailable, blocked, or shell-only surfaces, so further active chasing adds no value until the public market signals change.
**Result**: pass
## 2026-04-18
**Did**: Expanded BYD coverage by adding Belgium, India, Argentina, Bahrain, Algeria, and Cyprus after confirming BYD's official dealer-directory country pages plus live city pages with authorized local dealer listings for each market.
**Result**: pass
**TODO**: Verify the next strongest BYD sovereign markets from the official dealer directory, prioritizing other untracked Europe, Middle East, and Asia-Pacific locales with live country pages plus dealer-bearing city pages.
## 2026-04-18
**Did**: Expanded BYD coverage again by adding Ireland, Switzerland, Oman, and Qatar after confirming BYD's official dealer-directory country pages plus live city pages with authorized local dealer listings in Cork, Zürich, Muscat, and Doha.
**Result**: pass
**TODO**: Verify the next strongest non-BYD deferred task so the next session slice varies category instead of continuing the same dealer-directory expansion pattern.

## 2026-04-18
**Did**: Turned the map hover preview into a quick-action panel so users can apply a hovered brand footprint and open that brand's official country source without first opening the country details panel.
**Result**: pass

## 2026-04-18
**Did**: Expanded Chery's European footprint by adding North Macedonia after confirming `www.chery.mk` redirects into the live official `cheryauto.mk` market site, whose localized contact page exposes a Skopje showroom with phone and email details and whose Tiggo 4 Hybrid model page includes a test-drive/request-offer flow.
**Result**: pass

## 2026-04-18
**Did**: Expanded Zeekr coverage by adding Azerbaijan after confirming the live official `ru-az` localized market site and Zeekr-hosted Azerbaijan launch article, while re-verifying Vietnam's existing official locale still exposes a local Tasco-backed distributor, Hanoi address, hotline, and `zeekr.com.vn` contact on Zeekr's own pages.
**Result**: pass
**TODO**: Verify the next strongest non-Zeekr deferred task so the next session slice keeps varying brands instead of staying on Zeekr locale follow-ups.
## 2026-04-19
**Did**: Re-checked Chery's remaining official Europe leads through Chery's own global map and confirmed `cherymotor.se` and `cherymotor.fi` still do not resolve, so I demoted that leftover Europe follow-up to `[monitoring]` and promoted Voyah's next major-region expansion gap into the actionable backlog.
**Result**: no-op

## 2026-04-19
**Did**: Added a one-click "Copy all sources in view" action beside the export controls so users can copy every deduplicated verification URL from the current brand-and-region slice without downloading a file, backed by EV map regression coverage.
**Result**: pass
## 2026-04-19
**Did**: Fixed a flaky EVMap copy-state regression so the selected brand website copy action no longer resets during initial data hydration, and tightened the regression test to wait against the live document.
**Result**: pass

## 2026-04-19
**Did**: Re-checked Voyah's next major-region expansion gap against Voyah's own shipped global-site bundle and confirmed it still exposes only the already-tracked local domains plus an unresolved Bulgaria mention, so I demoted that backlog item to `[monitoring]` and promoted XPeng's first Americas-market gap into the actionable backlog.
**Result**: no-op

## 2026-04-19
**Did**: Added a "Copy visible markets" action to the brand footprint panel so users can copy the currently filtered market list for the selected brand, and covered the new workflow with EV map regression tests.
**Result**: pass
## 2026-04-19
**Did**: Added XPeng Mexico after confirming XPeng's global region selector now links Mexico to a dedicated `/mx` market site and that the live Mexico site exposes localized consumer pages plus an official showroom list for Zapopan, Mexico City, and San Pedro Garza García.
**Result**: pass
**TODO**: Verify the next strongest non-XPENG deferred task so the next session slice keeps varying brands instead of staying on XPENG's new Americas follow-ups.

## 2026-04-20
**Did**: Added XPeng Colombia after confirming XPeng's own global country selector now links Colombia to a dedicated `/co` market site and that the live Colombia site exposes a first-party localized homepage plus a Colombia test-drive booking flow.
**Result**: pass

## 2026-04-20
**Did**: Expanded BYD coverage by adding Israel and Ukraine after confirming BYD's official dealer-directory country pages plus live city and dealer-detail pages for Bnei Brak and Kyiv.
**Result**: pass
**TODO**: Ship the next session slice as a product or UX improvement instead of another data-only expansion so the recent journal run varies category.
## 2026-04-20
**Did**: Added an active-view chip bar in the map controls so users can see and clear the current brand, region, country, and search filters one by one without resetting the whole view, backed by EV map regression coverage.
**Result**: pass
## 2026-04-20
**Did**: Added an uncertain-only toggle in the selected brand footprint so users can isolate flagged markets with shareable URL state, active-view chips, and EV map regression coverage.
**Result**: pass

## 2026-04-21
**Did**: Added one-click coverage ranking copy actions so users can copy the currently visible brand, country, or region coverage list from the map panel, backed by EV map regression coverage.
**Result**: pass

## 2026-04-21
**Did**: Expanded Deepal coverage by adding Egypt after confirming the live official Deepal Egypt market site, its about page naming GB Auto as Deepal's exclusive distributor in Egypt, and the matching local contact surface.
**Result**: pass
## 2026-04-21
**Did**: Stabilized the visible coverage ranking copy regression by awaiting the copied-state button label in the EVMap test, eliminating the suite-order timing flake without changing runtime behavior.
**Result**: pass

## 2026-04-21
**Did**: Added a major-region gap panel in the dataset summary so users can see which tracked brands still lack confirmed coverage in Europe, Southeast Asia, the Americas, and the Middle East, backed by new helper coverage logic and EV map regressions.
**Result**: pass
**TODO**: Verify the highest-confidence major-region gap surfaced by the new panel, prioritizing Voyah's first Southeast Asia or Americas market from official first-party consumer or dealer pages.

## 2026-04-22
**Did**: Re-checked Voyah's first Southeast Asia or Americas gap against Voyah's own live global site and JS bundle, closed it back to monitoring when the first-party `Find Us` flow still exposed only China, Norway, and Israel, and added a one-click copy action for the major-region gap panel with regression coverage.
**Result**: pass
## 2026-04-22
**Did**: Re-checked Neta's first Europe expansion gap against Neta's public global pages and business-contact surfaces, confirmed those first-party pages still expose no European sovereign market or dealer flow, and demoted the follow-up back to `[monitoring]` after the current `netaauto.co` site also failed browser checks with `ERR_CERT_DATE_INVALID`.
**Result**: no-op

## 2026-04-22
**Did**: Made the major-region gap panel actionable by letting users focus a brand's specific missing region and carry that gap context into the brand footprint panel, backed by EV map regression coverage and stabler copy-action assertions.
**Result**: pass

## 2026-04-22
**Did**: Added DENZA as a tracked brand with confirmed official presence in China, the United Kingdom, and Singapore after verifying DENZA's mainland consumer site plus its dedicated UK market pages and Singapore showroom/test-drive surfaces.
**Result**: pass

## 2026-04-22
**Did**: Expanded DENZA coverage by adding Australia and the United Arab Emirates after confirming DENZA's official localized market pages plus supporting model and brand-story pages on denza.com.
**Result**: pass

## 2026-04-23
**Did**: Expanded DENZA coverage by adding Indonesia, Malaysia, and New Zealand after confirming live official localized DENZA market sites plus supporting local contact, dealer/find-store, and test-drive flows on DENZA's own domains.
**Result**: pass

## 2026-04-23
**Did**: Made major-region gap focus in the EV map easier to clear by turning the gap pills into true toggles and adding a dedicated clear action in the brand footprint panel, backed by regression coverage.
**Result**: pass
## 2026-04-23
**Did**: Closed DENZA's exhausted sovereign-market follow-up back to monitoring after confirming its public first-party locales still top out at the already-tracked sovereign footprint plus Macau and Europe-only surfaces, and surfaced official source counts in the map preview, country details, and brand footprint panels.
**Result**: pass

## 2026-04-23
**Did**: Expanded Deepal coverage by adding Germany after confirming Changan Europe's live German Deepal market site plus first-party German test-drive and contact flows.
**Result**: pass

## 2026-04-23
**Did**: Re-checked Voyah's highest-impact missing-region gap after recalculating the major-region coverage ranking and confirmed Voyah's own global `Find Us` dialog still hard-codes only China, Norway, and Israel, so the Southeast Asia/Americas follow-up stays in monitoring.
**Result**: no-op

## 2026-04-23
**Did**: Surfaced non-default coverage and footprint sort choices in the active-view chip bar so users can see and clear sort-driven shared state without resetting the rest of the map, backed by EV map regression coverage.
**Result**: pass

## 2026-04-23
**Did**: Added AVATR as a tracked brand with confirmed official presence in China, Thailand, and Singapore after verifying AVATR's own overseas hub links plus live local consumer, showroom/find-us, and test-drive flows on first-party market sites.
**Result**: pass

## 2026-04-24
**Did**: Expanded AVATR coverage by adding the United Arab Emirates and Azerbaijan after confirming AVATR's live UAE showroom and authorized dealer flow plus AVATR Azerbaijan's localized consumer and contact pages on first-party local market sites.
**Result**: pass
**TODO**: Verify AVATR's next sovereign markets beyond Azerbaijan, China, Singapore, Thailand, and the United Arab Emirates, prioritizing first-party sovereign locales backed by live local consumer, dealer, contact, or test-drive flows.

## 2026-04-24
**Did**: Closed AVATR's next-sovereign follow-up back to monitoring after confirming AVATR's own live overseas switcher still exposes only Hong Kong, Thailand, and Singapore, leaving no additional sovereign market beyond the already-tracked Thailand, Singapore, United Arab Emirates, and Azerbaijan footprint.
**Result**: pass

## 2026-04-24
**Did**: Expanded DENZA coverage by adding Brazil and Mexico after confirming live official `denza.com/br` and `denza.com/mx` market sites plus localized first-party model, test-drive, and dealer or roadside-support flows on DENZA's own domains.
**Result**: pass

## 2026-04-24
**Did**: Expanded NIO coverage by adding Costa Rica after recalculating the major-region gap ranking and confirming NIO's live `findourpartners` directory plus its official distribution-announcement page both name Horizontes Cielo Azul as Costa Rica's NIO, ONVO, and firefly partner.
**Result**: pass

## 2026-04-24
**Did**: Added MAXUS as a tracked brand with confirmed official presence in China, Norway, Indonesia, Saudi Arabia, and the United Arab Emirates after using SAIC MAXUS's global market selector plus live local dealer, contact, and test-drive flows to seed a high-confidence first slice.
**Result**: pass
**TODO**: Verify MAXUS's next strongest sovereign markets beyond China, Indonesia, Norway, Saudi Arabia, and the United Arab Emirates, prioritizing first-party local sites with live dealer, contact, or test-drive flows.

## 2026-04-24
**Did**: Added a compact toggle to the brand footprint panel so users can collapse each market row down to a cleaner country-plus-ISO list while keeping the existing source links and drill-down actions, backed by EV map regression coverage.
**Result**: pass

## 2026-04-25
**Did**: Expanded MAXUS coverage by adding Austria, Ecuador, Hungary, Paraguay, and Uruguay after confirming live first-party local market sites plus dealer, contact, and test-drive flows across those sovereign markets.
**Result**: pass
**TODO**: Verify MAXUS's next strongest sovereign markets beyond Austria, China, Ecuador, Hungary, Indonesia, Norway, Paraguay, Saudi Arabia, the United Arab Emirates, and Uruguay, prioritizing first-party local sites with live dealer, contact, or test-drive flows.

## 2026-04-25
**Did**: Expanded MAXUS coverage by adding Denmark, Finland, Portugal, Slovenia, and Spain after confirming SAIC MAXUS's global selector plus live first-party local dealer, contact, or test-drive surfaces across those sovereign markets.
**Result**: pass
**TODO**: Verify MAXUS's next strongest sovereign markets beyond Austria, China, Denmark, Ecuador, Finland, Hungary, Indonesia, Norway, Paraguay, Portugal, Saudi Arabia, Slovenia, Spain, the United Arab Emirates, and Uruguay, prioritizing other first-party local sites with live dealer, contact, or test-drive flows.

## 2026-04-25
**Did**: Expanded MAXUS coverage by adding Belgium, the Netherlands, and Switzerland after confirming SAIC MAXUS's global market selector plus each local first-party site's live dealer, contact, and test-drive or quote-request flows.
**Result**: pass
**TODO**: Verify MAXUS's next strongest sovereign markets beyond Austria, Belgium, China, Denmark, Ecuador, Finland, Hungary, Indonesia, the Netherlands, Norway, Paraguay, Portugal, Saudi Arabia, Slovenia, Spain, Switzerland, the United Arab Emirates, and Uruguay, prioritizing other first-party local sites with live dealer, contact, or test-drive flows.

## 2026-04-25
**Did**: Expanded MAXUS coverage by adding the Dominican Republic, Guatemala, and South Africa after confirming SAIC MAXUS's official global market selector plus each local market's live contact, dealer, or test-drive flow.
**Result**: pass
**TODO**: Verify MAXUS's next strongest sovereign markets beyond Austria, Belgium, China, Denmark, the Dominican Republic, Ecuador, Finland, Guatemala, Hungary, Indonesia, the Netherlands, Norway, Paraguay, Portugal, Saudi Arabia, Slovenia, South Africa, Spain, Switzerland, the United Arab Emirates, and Uruguay, prioritizing other first-party local sites with live dealer, contact, or test-drive flows.

## 2026-04-26
**Did**: Expanded MAXUS coverage by adding France, Germany, Luxembourg, Malta, and Romania after confirming SAIC MAXUS's official global selector plus each local first-party site's live dealer, contact, or test-drive surfaces.
**Result**: pass
**TODO**: Verify MAXUS's next strongest sovereign markets beyond Austria, Belgium, China, Denmark, the Dominican Republic, Ecuador, Finland, France, Germany, Guatemala, Hungary, Indonesia, Luxembourg, Malta, the Netherlands, Norway, Paraguay, Portugal, Romania, Saudi Arabia, Slovenia, South Africa, Spain, Switzerland, the United Arab Emirates, and Uruguay, prioritizing other first-party local sites with live dealer, contact, or test-drive flows.

## 2026-04-26
**Did**: Added retry actions for dataset and boundary load failures so transient fetch errors can recover in place, backed by EV map regression coverage for both retry paths.
**Result**: pass

## 2026-04-26
**Did**: Expanded MAXUS coverage by adding Poland after confirming SAIC MAXUS's official global selector plus Poland's live EV model page, contact flow, and rendered dealer and service network on the local first-party site.
**Result**: pass
**TODO**: Verify MAXUS's next strongest sovereign markets beyond Austria, Belgium, China, Denmark, the Dominican Republic, Ecuador, Finland, France, Germany, Guatemala, Hungary, Indonesia, Luxembourg, Malta, the Netherlands, Norway, Paraguay, Poland, Portugal, Romania, Saudi Arabia, Slovenia, South Africa, Spain, Switzerland, the United Arab Emirates, and Uruguay, prioritizing other first-party local sites with live dealer, contact, or test-drive flows.

## 2026-04-26
**Did**: Expanded MAXUS coverage by adding Iceland, Malaysia, and Sweden after confirming SAIC MAXUS's official global selector plus each local first-party site's live EV lineup and contact, dealer, or test-drive surfaces.
**Result**: pass
**TODO**: Verify MAXUS's next strongest sovereign markets beyond Austria, Belgium, China, Denmark, the Dominican Republic, Ecuador, Finland, France, Germany, Guatemala, Hungary, Iceland, Indonesia, Luxembourg, Malaysia, Malta, the Netherlands, Norway, Paraguay, Poland, Portugal, Romania, Saudi Arabia, Slovenia, South Africa, Spain, Sweden, Switzerland, the United Arab Emirates, and Uruguay, prioritizing other first-party local sites with live dealer, contact, or test-drive flows.

## 2026-04-26
**Did**: Expanded MAXUS coverage by adding Jordan after confirming SAIC MAXUS's official global selector links to a sovereign local site and that the live Jordan site exposes consumer EV models plus a book-test-drive flow.
**Result**: pass
**TODO**: Verify MAXUS's next strongest sovereign markets beyond Austria, Belgium, China, Denmark, the Dominican Republic, Ecuador, Finland, France, Germany, Guatemala, Hungary, Iceland, Indonesia, Jordan, Luxembourg, Malaysia, Malta, the Netherlands, Norway, Paraguay, Poland, Portugal, Romania, Saudi Arabia, Slovenia, South Africa, Spain, Sweden, Switzerland, the United Arab Emirates, and Uruguay, prioritizing other first-party local sites with live dealer, contact, or test-drive flows.

## 2026-04-26
**Did**: Expanded MAXUS coverage by adding Armenia, Bahrain, Brunei, Honduras, Israel, and Qatar after confirming SAIC MAXUS's official global selector plus each local first-party site's live contact, showroom, dealer, or test-drive surfaces.
**Result**: pass
**TODO**: Verify MAXUS's next strongest sovereign markets beyond Armenia, Austria, Bahrain, Belgium, Brunei, China, Denmark, the Dominican Republic, Ecuador, Finland, France, Germany, Guatemala, Honduras, Hungary, Iceland, Indonesia, Israel, Jordan, Luxembourg, Malaysia, Malta, the Netherlands, Norway, Paraguay, Poland, Portugal, Qatar, Romania, Saudi Arabia, Slovenia, South Africa, Spain, Sweden, Switzerland, the United Arab Emirates, and Uruguay, prioritizing other first-party local sites with live dealer, contact, or test-drive flows.

## 2026-04-27
**Did**: Expanded MAXUS coverage by adding the Czech Republic, Serbia, Turkey, and Ukraine after confirming each market's live first-party MAXUS site plus local model, contact, price-list, or importer pages.
**Result**: pass
**TODO**: Verify MAXUS's next strongest sovereign markets beyond Armenia, Austria, Bahrain, Belgium, Brunei, China, the Czech Republic, Denmark, the Dominican Republic, Ecuador, Finland, France, Germany, Guatemala, Honduras, Hungary, Iceland, Indonesia, Israel, Jordan, Luxembourg, Malaysia, Malta, the Netherlands, Norway, Paraguay, Poland, Portugal, Qatar, Romania, Saudi Arabia, Serbia, Slovenia, South Africa, Spain, Sweden, Switzerland, Turkey, Ukraine, the United Arab Emirates, and Uruguay, prioritizing other first-party local sites with live dealer, contact, or test-drive flows.

## 2026-04-27
**Did**: Added a visible hover outline on the interactive map so hovered countries are highlighted directly on the map instead of only in the preview panel, backed by EV map regression coverage.
**Result**: pass

## 2026-04-27
**Did**: Expanded MAXUS coverage by adding Greece after confirming SAIC MAXUS's official global selector plus Maxus Hellas's live localized site, EV product page, and test-drive flow.
**Result**: pass
**TODO**: Verify MAXUS's next strongest sovereign markets beyond Armenia, Austria, Bahrain, Belgium, Brunei, China, the Czech Republic, Denmark, the Dominican Republic, Ecuador, Finland, France, Germany, Greece, Guatemala, Honduras, Hungary, Iceland, Indonesia, Israel, Jordan, Luxembourg, Malaysia, Malta, the Netherlands, Norway, Paraguay, Poland, Portugal, Qatar, Romania, Saudi Arabia, Serbia, Slovenia, South Africa, Spain, Sweden, Switzerland, Turkey, Ukraine, the United Arab Emirates, and Uruguay, prioritizing other first-party local sites with live dealer, contact, or test-drive flows.

## 2026-04-27
**Did**: Expanded MAXUS coverage by adding Kuwait and Singapore after confirming SAIC MAXUS's official global selector plus each market's live first-party local site, contact/showroom surface, and test-drive flow.
**Result**: pass
**TODO**: Verify MAXUS's next strongest sovereign markets beyond Armenia, Austria, Bahrain, Belgium, Brunei, China, the Czech Republic, Denmark, the Dominican Republic, Ecuador, Finland, France, Germany, Greece, Guatemala, Honduras, Hungary, Iceland, Indonesia, Israel, Jordan, Kuwait, Luxembourg, Malaysia, Malta, the Netherlands, Norway, Paraguay, Poland, Portugal, Qatar, Romania, Saudi Arabia, Serbia, Singapore, Slovenia, South Africa, Spain, Sweden, Switzerland, Turkey, Ukraine, the United Arab Emirates, and Uruguay, prioritizing other first-party local sites with live dealer, contact, or test-drive flows.

## 2026-04-27
**Did**: Expanded MAXUS coverage by adding Venezuela after confirming SAIC MAXUS's official global selector plus MAXUS Venezuela's live first-party contact and dealer-network pages.
**Result**: pass
**TODO**: Verify MAXUS's next strongest sovereign markets beyond Armenia, Austria, Bahrain, Belgium, Brunei, China, the Czech Republic, Denmark, the Dominican Republic, Ecuador, Finland, France, Germany, Greece, Guatemala, Honduras, Hungary, Iceland, Indonesia, Israel, Jordan, Kuwait, Luxembourg, Malaysia, Malta, the Netherlands, Norway, Paraguay, Poland, Portugal, Qatar, Romania, Saudi Arabia, Serbia, Singapore, Slovenia, South Africa, Spain, Sweden, Switzerland, Turkey, Ukraine, the United Arab Emirates, Uruguay, and Venezuela, prioritizing other first-party local sites with live dealer, contact, or test-drive flows.

## 2026-04-27
**Did**: Improved EV map accessibility and empty-state affordances by adding explicit uncertain-filter labels, consistent disabled styling for empty filters, and regression coverage for the disabled filter state.
**Result**: pass

## 2026-04-28
**Did**: Expanded MAXUS coverage by adding Australia and New Zealand after confirming SAIC MAXUS's official global selector hands both markets to live LDV-branded local sites with public dealer, contact, and test-drive flows.
**Result**: pass

## 2026-04-28
**Did**: Expanded MAXUS coverage by adding Chile, Ireland, Panama, and the United Kingdom after confirming SAIC MAXUS's official global selector plus first-party dealer, contact, and test-drive routes on each local market domain.
**Result**: pass
**TODO**: Verify MAXUS's next strongest sovereign markets beyond Armenia, Australia, Austria, Bahrain, Belgium, Brunei, Chile, China, the Czech Republic, Denmark, the Dominican Republic, Ecuador, Finland, France, Germany, Greece, Guatemala, Honduras, Hungary, Iceland, Indonesia, Ireland, Israel, Jordan, Kuwait, Luxembourg, Malaysia, Malta, the Netherlands, New Zealand, Norway, Panama, Paraguay, Poland, Portugal, Qatar, Romania, Saudi Arabia, Serbia, Singapore, Slovenia, South Africa, Spain, Sweden, Switzerland, Turkey, Ukraine, the United Arab Emirates, the United Kingdom, Uruguay, and Venezuela, prioritizing other first-party local sites with live dealer, contact, or test-drive flows.

## 2026-04-28
**Did**: Expanded MAXUS coverage by adding Peru after confirming SAIC MAXUS's official global selector plus Peru's live first-party dealer-network and test-drive pages on its local distributor stack.
**Result**: pass
**TODO**: Verify MAXUS's next strongest sovereign markets beyond Armenia, Australia, Austria, Bahrain, Belgium, Brunei, Chile, China, the Czech Republic, Denmark, the Dominican Republic, Ecuador, Finland, France, Germany, Greece, Guatemala, Honduras, Hungary, Iceland, Indonesia, Ireland, Israel, Jordan, Kuwait, Luxembourg, Malaysia, Malta, the Netherlands, New Zealand, Norway, Panama, Paraguay, Peru, Poland, Portugal, Qatar, Romania, Saudi Arabia, Serbia, Singapore, Slovenia, South Africa, Spain, Sweden, Switzerland, Turkey, Ukraine, the United Arab Emirates, the United Kingdom, Uruguay, and Venezuela, prioritizing other first-party local sites with live dealer, contact, or test-drive flows.

## 2026-04-28
**Did**: Expanded MAXUS coverage by adding Argentina and Bolivia after confirming live first-party MAXUS market sites plus distributor/about, branch, and contact surfaces in both sovereign markets.
**Result**: pass
**TODO**: Verify MAXUS's next strongest sovereign markets beyond Argentina, Armenia, Australia, Austria, Bahrain, Belgium, Bolivia, Brunei, Chile, China, the Czech Republic, Denmark, the Dominican Republic, Ecuador, Finland, France, Germany, Greece, Guatemala, Honduras, Hungary, Iceland, Indonesia, Ireland, Israel, Jordan, Kuwait, Luxembourg, Malaysia, Malta, the Netherlands, New Zealand, Norway, Panama, Paraguay, Peru, Poland, Portugal, Qatar, Romania, Saudi Arabia, Serbia, Singapore, Slovenia, South Africa, Spain, Sweden, Switzerland, Turkey, Ukraine, the United Arab Emirates, the United Kingdom, Uruguay, and Venezuela, prioritizing other first-party local sites with live dealer, contact, or test-drive flows.

## 2026-04-29
**Did**: Probed SAIC MAXUS's remaining sovereign-looking selector leads and narrowed the follow-up to Costa Rica and Croatia after confirming the official global selector still links only those local surfaces beyond the tracked footprint.
**Result**: pass
**TODO**: Re-check MAXUS Costa Rica and Croatia only after their selector-linked local roots become browser-accessible again; on 2026-04-29 the Costa Rica roots returned 403 access-denied responses and `maxus.hr` failed DNS resolution.

## 2026-04-29
**Did**: Added an "Uncertain markets in view" metric to the dataset summary so filtered map views expose confidence gaps alongside confirmed market coverage.
**Result**: pass

## 2026-04-29
**Did**: Added Dongfeng as a tracked brand with an initial verified footprint in China, Chile, Ecuador, Panama, Saudi Arabia, and the United Arab Emirates using Dongfeng's own global passenger-network registry plus live local market and dealer surfaces.
**Result**: pass
**TODO**: Expand Dongfeng's passenger-EV footprint beyond the initial verified markets by pairing the official global passenger-network registry with live local consumer or dealer flows, prioritizing Malaysia, Nepal, Peru, and Egypt.


## 2026-04-29
**Did**: Expanded Dongfeng coverage by adding Egypt after confirming Dongfeng's own global passenger-network registry plus Dongfeng Egypt's live Mage EV model and services/support pages.
**Result**: pass
**TODO**: Expand Dongfeng's passenger-EV footprint beyond China, Chile, Ecuador, Egypt, Panama, Saudi Arabia, and the United Arab Emirates by pairing the official global passenger-network registry with live local consumer or dealer flows, prioritizing Malaysia, Nepal, and Peru.
## 2026-04-29
**Did**: Expanded Dongfeng coverage by adding Peru after confirming Dongfeng's global passenger-network registry plus Dongfeng Motor Peru's live local market and dealer surfaces.
**Result**: pass
**TODO**: Expand Dongfeng's passenger-EV footprint beyond China, Chile, Ecuador, Egypt, Panama, Peru, Saudi Arabia, and the United Arab Emirates by pairing the official global passenger-network registry with live local consumer or dealer flows, prioritizing Malaysia and Nepal.

## 2026-04-29
**Did**: Improved keyboard accessibility for the brand and country lookup comboboxes by letting Space select the active suggestion, backed by regression coverage.
**Result**: pass

## 2026-04-30
**Did**: Narrowed the Dongfeng follow-up away from Malaysia and Nepal after Dongfeng's own global passenger-network page failed to list either market, then made major-region gap focus shareable and restorable through the map URL with regression coverage.
**Result**: pass

## 2026-04-30
**Did**: Expanded Dongfeng coverage by adding Algeria after confirming Dongfeng/Forthing's Africa operation-center page plus Dongfeng Algérie's live local showroom, distributor, and after-sales support surfaces.
**Result**: pass
**TODO**: Expand Dongfeng's passenger-EV footprint beyond Algeria, China, Chile, Ecuador, Egypt, Panama, Peru, Saudi Arabia, and the United Arab Emirates by pairing the official global passenger-network registry with live local EV model or dealer flows in the remaining selector-linked sovereign markets.

## 2026-04-30
**Did**: Expanded Dongfeng coverage by adding Hungary, Kuwait, and Qatar after confirming Dongfeng's own passenger-network selector plus official Forthing distributor evidence and live local dealer or test-drive flows in each market.
**Result**: pass
**TODO**: Expand Dongfeng's passenger-EV footprint in the remaining selector-linked sovereign markets, prioritizing Bulgaria, Slovakia, and Tunisia where Dongfeng or Forthing official distributor signals already exist.

## 2026-04-30
**Did**: Expanded Dongfeng coverage by adding Bulgaria, Slovakia, and Tunisia after confirming official distributor-linked local market sites plus live dealer, service, EV model, or test-drive flows in each market.
**Result**: pass
**TODO**: Expand Dongfeng's passenger-EV footprint in the remaining selector-linked sovereign markets, prioritizing Azerbaijan, the Dominican Republic, Latvia, Montenegro, North Macedonia, and Uruguay where official distributor signals still need live EV model or dealer-flow verification.

## 2026-04-30
**Did**: Strengthened the data guardrails by adding a validation test that rejects duplicate or whitespace-padded source URLs in `ev-presence.json`.
**Result**: pass

## 2026-05-01
**Did**: Expanded Dongfeng coverage by adding Azerbaijan, Latvia, Montenegro, and North Macedonia after confirming official local dealer surfaces plus live EV model, contact, or showroom pages on each market's first-party site.
**Result**: pass
**TODO**: Expand Dongfeng's passenger-EV footprint in the remaining selector-linked sovereign markets, prioritizing the Dominican Republic and Uruguay where official distributor signals still need live EV model or dealer-flow verification.

## 2026-05-01
**Did**: Expanded Dongfeng coverage by adding the Dominican Republic and Uruguay after confirming Forthing's official distributor network plus each local market's live EV model and official distributor or contact surfaces.
**Result**: pass
