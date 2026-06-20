import type { AnnualHoroscopeInformationBlock, Saham } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

import { AnnualScoreSvg } from "./AnnualScoreSvg";
import { InfoTable } from "./InfoTable";
import { PlanetaryPositionsTable } from "./PlanetaryPositionsTable";
import { StrengthSummarySvg } from "./StrengthSummarySvg";
import { TajikaSection } from "./TajikaSection";

export function AnnualHoroscopeBlock({ block }: { block: AnnualHoroscopeInformationBlock }) {
  const { locale, t, term } = useI18n();

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-amber-200/70">
          {t("ui.annualHoroscopeBlock")}
        </p>
        <h2 className="mt-2 text-3xl font-bold text-white">
          {t("ui.varshphalYear", { year: block.varsha_pravesh.varshphal_year })}
        </h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <InfoTable
          title={t("ui.birthInformation")}
          rows={[
            [t("ui.name"), block.birth_info.name],
            [t("ui.gender"), term("genders", block.birth_info.gender)],
            [t("ui.dateOfBirth"), block.birth_info.date_of_birth],
            [t("ui.timeOfBirth"), block.birth_info.time_of_birth],
            [t("ui.dayOfBirth"), term("weekdays", block.birth_info.day_of_birth)],
            [t("ui.placeOfBirth"), term("places", block.birth_info.place_of_birth)],
            [t("ui.country"), term("countries", block.birth_info.country)],
            [t("ui.latitude"), block.birth_info.latitude],
            [t("ui.longitude"), block.birth_info.longitude],
            [t("ui.timeZone"), block.birth_info.time_zone],
          ]}
        />
        <InfoTable
          title={t("ui.astronomicalData")}
          rows={[
            [t("ui.localMeanTime"), block.astronomical_data.local_mean_time],
            [t("ui.localTimeCorrection"), block.astronomical_data.local_time_correction],
            [t("ui.warTimeCorrection"), block.astronomical_data.war_time_correction],
            [t("ui.julianDay"), block.astronomical_data.julian_day],
            [term("panchangaTerms", "sunrise"), block.astronomical_data.sunrise],
            [term("panchangaTerms", "sunset"), block.astronomical_data.sunset],
            [t("ui.ayanamshaValue"), block.astronomical_data.ayanamsha_value],
            [t("ui.ayanamshaName"), term("ayanamshaNames", block.astronomical_data.ayanamsha_name)],
          ]}
        />
        <InfoTable
          title={t("ui.natalReferenceData")}
          rows={[
            [t("ui.natalLagna"), term("signs", block.natal_reference.lagna)],
            [t("ui.natalLagnaLord"), term("planets", block.natal_reference.lagna_lord)],
            [t("ui.natalMoonSign"), term("signs", block.natal_reference.moon_sign)],
            [t("ui.natalMoonSignLord"), term("planets", block.natal_reference.moon_sign_lord)],
            [t("ui.natalNakshatra"), term("nakshatras", block.natal_reference.nakshatra)],
            [t("ui.natalNakshatraLord"), term("planets", block.natal_reference.nakshatra_lord)],
            [t("ui.natalYoga"), term("panchangaYogas", block.natal_reference.yoga)],
            [t("ui.natalKarana"), term("karanas", block.natal_reference.karana)],
          ]}
        />
        <InfoTable
          title={t("ui.varshPraveshData")}
          rows={[
            [t("ui.varshphalYearLabel"), block.varsha_pravesh.varshphal_year],
            [t("ui.exactDate"), block.varsha_pravesh.exact_varsha_pravesh_date],
            [t("ui.exactTime"), block.varsha_pravesh.exact_varsha_pravesh_time],
            [t("ui.varshaLagna"), term("signs", block.varsha_pravesh.varsha_lagna)],
            [t("ui.varshaLagnaLord"), term("planets", block.varsha_pravesh.varsha_lagna_lord)],
            [t("ui.varshaMoonSign"), term("signs", block.varsha_pravesh.varsha_moon_sign)],
            [t("ui.varshaMoonSignLord"), term("planets", block.varsha_pravesh.varsha_moon_sign_lord)],
            [t("ui.varshaNakshatra"), term("nakshatras", block.varsha_pravesh.varsha_nakshatra)],
            [t("ui.varshaNakshatraLord"), term("planets", block.varsha_pravesh.varsha_nakshatra_lord)],
            [t("ui.varshaYoga"), term("panchangaYogas", block.varsha_pravesh.varsha_yoga)],
            [t("ui.varshaKarana"), term("karanas", block.varsha_pravesh.varsha_karana)],
          ]}
        />
        <InfoTable
          title={t("ui.munthaSection")}
          rows={[
            [t("ui.munthaSign"), term("signs", block.muntha.muntha_sign)],
            [t("ui.munthaHouse"), block.muntha.muntha_house],
            [term("varshphalTerms", "munthesh"), term("planets", block.muntha.munthesh)],
            [t("ui.munthaStrength"), block.muntha.muntha_strength],
          ]}
        />
        <InfoTable
          title={t("ui.dashaSection")}
          rows={[
            [t("ui.currentMuddaDasha"), formatPlanet(block.mudda_dasha.current_mudda_dasha, term)],
            [t("ui.currentAntardasha"), formatPlanet(block.mudda_dasha.current_antardasha, term)],
            [t("ui.startDate"), formatDateTime(block.mudda_dasha.start_date, locale.code)],
            [t("ui.endDate"), formatDateTime(block.mudda_dasha.end_date, locale.code)],
          ]}
        />
      </div>

      <InfoTable title={t("ui.sahamSection")} rows={sahamRows(block.sahams, t, term)} />
      <TajikaSection tajika={block.tajika} />
      <PlanetaryPositionsTable positions={block.planetary_positions} />
      <StrengthSummarySvg analysis={block.strength_analysis} />
      <AnnualScoreSvg summary={block.annual_summary} />
    </section>
  );
}

function sahamRows(
  sahams: AnnualHoroscopeInformationBlock["sahams"],
  t: (key: string, values?: Record<string, string | number>) => string,
  term: (layer: string, canonical: string) => string,
): Array<[string, string | number | null | undefined]> {
  return [
    [t("ui.punyaSaham"), formatSaham(sahams.punya_saham, t, term)],
    [t("ui.rajyaSaham"), formatSaham(sahams.rajya_saham, t, term)],
    [t("ui.karmaSaham"), formatSaham(sahams.karma_saham, t, term)],
    [t("ui.vivahaSaham"), formatSaham(sahams.vivaha_saham, t, term)],
    [t("ui.putraSaham"), formatSaham(sahams.putra_saham, t, term)],
    [t("ui.vidyaSaham"), formatSaham(sahams.vidya_saham, t, term)],
    [t("ui.mrityuSaham"), formatSaham(sahams.mrityu_saham, t, term)],
  ];
}

function formatSaham(
  saham: Saham | null,
  t: (key: string, values?: Record<string, string | number>) => string,
  term: (layer: string, canonical: string) => string,
) {
  if (!saham) {
    return "-";
  }
  return t("ui.sahamPosition", {
    sign: term("signs", saham.sign),
    degree: saham.degree.toFixed(2),
    house: saham.house,
    lord: term("planets", saham.lord),
  });
}

function formatPlanet(value: string | null, term: (layer: string, canonical: string) => string) {
  return value ? term("planets", value) : value;
}

function formatDateTime(value: string | null, localeCode = "en") {
  if (!value) {
    return "-";
  }
  return new Date(value).toLocaleString(localeCode);
}
