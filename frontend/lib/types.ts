export type VargaChartType = `D${number}`;
export type ChartType = VargaChartType | "Varshphal";

export type SupportedChart = {
  code: VargaChartType;
  division: number;
  name: string;
};

export type SupportedChartsResponse = {
  supported_charts: Record<VargaChartType, number>;
  charts: SupportedChart[];
};

export type BirthData = {
  name: string;
  gender: string;
  birth_date: string;
  birth_time: string;
  place_of_birth: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: number;
};

export type AstrologySettings = {
  zodiac?: "sidereal";
  ayanamsha?: "lahiri";
  house_system?: "whole_sign";
  node_type?: "true";
  include_outer_planets?: boolean;
  enable_vedic_aspects?: boolean;
  enable_western_aspects?: boolean;
  western_aspect_orb?: number;
};

export type ChartRequest = {
  birth_data: BirthData;
  settings?: AstrologySettings;
};

export type ZodiacPosition = {
  longitude: number;
  sign_number: number;
  sign_name: string;
  degree: number;
  sign_lord: string;
  nakshatra_number: number;
  nakshatra: string;
  nakshatra_lord: string;
  pada: number;
};

export type PlanetPosition = {
  name: string;
  abbreviation: string;
  longitude: number;
  latitude: number;
  speed: number;
  retrograde: boolean;
  zodiac: ZodiacPosition;
  house: number | null;
  dignity: {
    exalted: boolean;
    debilitated: boolean;
    own_sign: boolean;
    moolatrikona: boolean;
  };
};

export type House = {
  number: number;
  sign_number: number;
  sign_name: string;
  lord: string;
  occupants: string[];
  strength: number | null;
};

export type Chart = {
  chart_type: ChartType;
  birth_data: BirthData;
  julian_day: number;
  ascendant: {
    longitude: number;
    zodiac: ZodiacPosition;
    lord: string;
  };
  planets: Record<string, PlanetPosition>;
  houses: Record<string, House>;
  aspects: Array<{
    source: string;
    target: string;
    aspect_type: string;
    aspect_system: "Vedic" | "Western" | string;
    angle: number | null;
    orb: number | null;
    source_house: number | null;
    target_house: number | null;
    strength: number | null;
    exact: boolean;
    reason: string | null;
  }>;
};

export type ChartPoint = {
  x: number;
  y: number;
};

export type NorthIndianChartPayload = {
  chart_type: ChartType;
  view_box: string;
  lines: Array<{
    start: ChartPoint;
    end: ChartPoint;
  }>;
  labels: Array<{
    kind: "sign" | "house" | "planet" | "ascendant";
    text: string;
    house: number;
    x: number;
    y: number;
    planet: string | null;
    tooltip: string | null;
  }>;
};

export type DashaLevel = "mahadasha" | "antardasha" | "pratyantar" | "sookshma" | "prana";

export type DashaPeriod = {
  level: DashaLevel;
  planet: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  status: "past" | "running" | "future";
  parent_mahadasha: string | null;
  parent_antardasha: string | null;
  parent_pratyantar: string | null;
  parent_sookshma: string | null;
  children: DashaPeriod[];
  interpretation: Record<string, string> | null;
};

export type DashaPath = {
  mahadasha: DashaPeriod | null;
  antardasha: DashaPeriod | null;
  pratyantar: DashaPeriod | null;
  sookshma: DashaPeriod | null;
  prana: DashaPeriod | null;
};

export type CurrentDashaResponse = {
  current_mahadasha: string | null;
  current_antardasha: string | null;
  current_pratyantar: string | null;
  current_sookshma: string | null;
  current_prana: string | null;
  start_date: string | null;
  end_date: string | null;
  path: DashaPath;
  interpretations: Array<Record<string, string>>;
};

export type NextDashaResponse = {
  next: DashaPeriod | null;
  upcoming: DashaPeriod[];
};

export type DashaTimeline = {
  system: "vimshottari";
  zodiac: "sidereal";
  ayanamsha: "lahiri";
  nakshatra_system: "27_nakshatras";
  total_years: number;
  moon: {
    longitude: number;
    nakshatra_number: number;
    nakshatra: string;
    nakshatra_lord: string;
    pada: number;
    elapsed_degrees: number;
    remaining_degrees: number;
    elapsed_fraction: number;
    remaining_fraction: number;
  };
  birth_balance: {
    planet: string;
    total_years: number;
    elapsed_years: number;
    remaining_years: number;
    elapsed_days: number;
    remaining_days: number;
    mahadasha_start_date: string;
    birth_date: string;
    mahadasha_end_date: string;
  };
  mahadashas: DashaPeriod[];
  current: CurrentDashaResponse;
  next: NextDashaResponse;
  past: DashaPeriod[];
  future: DashaPeriod[];
};

export type TransitRequest = ChartRequest & {
  calculation_date?: string;
};

export type TransitEntry = {
  planet: string;
  natal_sign: string;
  transit_sign: string;
  transit_degree: number;
  natal_house: number;
  motion: "Direct" | "Retrograde";
  relationship: string;
  longitude_delta: number;
};

export type TransitResponse = {
  calculation_date: string;
  focus: string[];
  entries: TransitEntry[];
};

export type TraditionalComponentScore = {
  score: number;
  evidence: string[];
};

export type TraditionalShadbalaScore = {
  sthana_bala: TraditionalComponentScore;
  dig_bala: TraditionalComponentScore;
  kala_bala: TraditionalComponentScore;
  chesta_bala: TraditionalComponentScore;
  naisargika_bala: TraditionalComponentScore;
  drik_bala: TraditionalComponentScore;
  total: number;
};

export type TraditionalPlanetStrength = {
  planet: string;
  dignity_score: TraditionalComponentScore;
  shadbala_score: TraditionalShadbalaScore;
  ashtakavarga_score: TraditionalComponentScore;
  varga_support_score: TraditionalComponentScore;
  aspect_quality_score: TraditionalComponentScore;
  combustion_status: string;
  combustion_penalty: number;
  planetary_war_status: string;
  planetary_war_penalty: number;
  sign_relationship: string;
  final_traditional_strength: number;
  evidence: string[];
};

export type TraditionalStrengthResponse = {
  system: "traditional_jyotish_strength";
  scoring_note: string;
  planets: TraditionalPlanetStrength[];
};

export type VarshphalRequest = ChartRequest & {
  year: number;
  calculation_date?: string;
};

export type VarshPravesh = {
  natal_sun_longitude: number;
  return_sun_longitude: number;
  julian_day: number;
  utc_datetime: string;
  local_datetime: string;
  timezone: number;
};

export type Muntha = {
  muntha_house: number;
  muntha_sign: string;
  muntha_sign_number: number;
  munthesh: string;
  completed_years: number;
};

export type TajikaAspect = {
  source: string;
  target: string;
  aspect_type: "Conjunction" | "Sextile" | "Square" | "Trine" | "Opposition";
  exact_angle: number;
  actual_angle: number;
  orb: number;
  applying: boolean;
  strength: number;
};

export type TajikaYoga = {
  name: string;
  planets: string[];
  description: string;
  strength: number;
  tags: string[];
};

export type Saham = {
  name: string;
  longitude: number;
  sign: string;
  sign_number: number;
  degree: number;
  house: number;
  lord: string;
  formula: string;
};

export type MuddaDashaPeriod = {
  level: "mahadasha" | "antardasha";
  planet: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  children: MuddaDashaPeriod[];
};

export type MuddaDashaTimeline = {
  system: "mudda";
  start_lord: string;
  year_start: string;
  year_end: string;
  current: MuddaDashaPeriod | null;
  periods: MuddaDashaPeriod[];
};

export type VarshphalPrediction = {
  area: string;
  summary: string;
  factors: string[];
};

export type VarshphalReport = {
  year: number;
  varsh_pravesh: VarshPravesh;
  chart: Chart;
  muntha: Muntha;
  tajika_aspects: TajikaAspect[];
  tajika_yogas: TajikaYoga[];
  sahams: Saham[];
  mudda_dasha: MuddaDashaTimeline;
  predictions: VarshphalPrediction[];
};

export type BirthInformation = {
  name: string;
  gender: string;
  date_of_birth: string;
  time_of_birth: string;
  day_of_birth: string;
  place_of_birth: string;
  country: string;
  latitude: number;
  longitude: number;
  time_zone: number;
};

export type AstronomicalData = {
  local_mean_time: string;
  local_time_correction: string;
  war_time_correction: string;
  julian_day: number;
  sunrise: string | null;
  sunset: string | null;
  ayanamsha_value: number;
  ayanamsha_name: string;
};

export type ChartReferenceData = {
  lagna: string;
  lagna_lord: string;
  moon_sign: string;
  moon_sign_lord: string;
  nakshatra: string;
  nakshatra_lord: string;
  yoga: string;
  karana: string;
};

export type VarshaPraveshData = {
  varshphal_year: number;
  exact_varsha_pravesh_date: string;
  exact_varsha_pravesh_time: string;
  varsha_lagna: string;
  varsha_lagna_lord: string;
  varsha_moon_sign: string;
  varsha_moon_sign_lord: string;
  varsha_nakshatra: string;
  varsha_nakshatra_lord: string;
  varsha_yoga: string;
  varsha_karana: string;
};

export type MunthaSection = {
  muntha_sign: string;
  muntha_house: number;
  munthesh: string;
  muntha_strength: number;
};

export type TajikaSection = {
  tajika_aspects: TajikaAspect[];
  ithasala_yogas: TajikaYoga[];
  isharafa_yogas: TajikaYoga[];
  kamboola_yogas: TajikaYoga[];
  nakta_yogas: TajikaYoga[];
  yamaya_yogas: TajikaYoga[];
  manahoo_yogas: TajikaYoga[];
  radda_yogas: TajikaYoga[];
};

export type DashaSection = {
  current_mudda_dasha: string | null;
  current_antardasha: string | null;
  start_date: string | null;
  end_date: string | null;
};

export type SahamSection = {
  punya_saham: Saham | null;
  rajya_saham: Saham | null;
  karma_saham: Saham | null;
  vivaha_saham: Saham | null;
  putra_saham: Saham | null;
  vidya_saham: Saham | null;
  mrityu_saham: Saham | null;
};

export type PlanetaryPositionRow = {
  longitude: number;
  sign: string;
  degree: number;
  nakshatra: string;
  pada: number;
  house: number | null;
  retrograde_status: boolean;
  combust_status: boolean;
  aspect_count: number;
};

export type StrengthAnalysis = {
  strongest_planet: string;
  weakest_planet: string;
  strongest_house: number;
  weakest_house: number;
  benefic_influence_score: number;
  malefic_influence_score: number;
};

export type AnnualSummary = {
  career_score: number;
  wealth_score: number;
  marriage_score: number;
  health_score: number;
  education_score: number;
  travel_score: number;
  spiritual_score: number;
};

export type AnnualHoroscopeInformationBlock = {
  birth_info: BirthInformation;
  astronomical_data: AstronomicalData;
  natal_reference: ChartReferenceData;
  varsha_pravesh: VarshaPraveshData;
  muntha: MunthaSection;
  tajika: TajikaSection;
  mudda_dasha: DashaSection;
  sahams: SahamSection;
  planetary_positions: Record<string, PlanetaryPositionRow>;
  strength_analysis: StrengthAnalysis;
  annual_summary: AnnualSummary;
};
