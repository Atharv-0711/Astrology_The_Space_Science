import type {
  AnnualHoroscopeInformationBlock,
  Chart,
  ChartRequest,
  ChartType,
  CurrentDashaResponse,
  DashaTimeline,
  NextDashaResponse,
  NorthIndianChartPayload,
  SupportedChartsResponse,
  TraditionalStrengthResponse,
  TransitRequest,
  TransitResponse,
  VarshphalReport,
  VarshphalRequest,
} from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function postJson<TResponse>(path: string, body: unknown): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<TResponse>;
}

export function fetchChart(chartType: ChartType, request: ChartRequest): Promise<Chart> {
  return postJson<Chart>(`/chart?varga=${chartTypeToDivision(chartType)}`, request);
}

export function fetchChartSvgPayload(
  chartType: ChartType,
  request: ChartRequest,
): Promise<NorthIndianChartPayload> {
  return postJson<NorthIndianChartPayload>(`/chart/svg?varga=${chartTypeToDivision(chartType)}`, request);
}

export async function fetchSupportedCharts(): Promise<SupportedChartsResponse> {
  const response = await fetch(`${API_BASE_URL}/divisional/charts`);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<SupportedChartsResponse>;
}

export function fetchDashaTimeline(
  request: ChartRequest,
  calculationDate?: string,
  includeDepth = 3,
): Promise<DashaTimeline> {
  return postJson<DashaTimeline>("/dasha/timeline", {
    ...request,
    calculation_date: calculationDate,
    include_depth: includeDepth,
  });
}

export function fetchCurrentDasha(
  request: ChartRequest,
  calculationDate?: string,
  includeDepth = 5,
): Promise<CurrentDashaResponse> {
  return postJson<CurrentDashaResponse>("/dasha/current", {
    ...request,
    calculation_date: calculationDate,
    include_depth: includeDepth,
  });
}

export function fetchNextDasha(
  request: ChartRequest,
  calculationDate?: string,
  includeDepth = 3,
): Promise<NextDashaResponse> {
  return postJson<NextDashaResponse>("/dasha/next", {
    ...request,
    calculation_date: calculationDate,
    include_depth: includeDepth,
  });
}

export function fetchTransits(request: TransitRequest): Promise<TransitResponse> {
  return postJson<TransitResponse>("/transits", request);
}

export function fetchTraditionalStrength(request: ChartRequest): Promise<TraditionalStrengthResponse> {
  return postJson<TraditionalStrengthResponse>("/traditional-strength", request);
}

export function fetchVarshphal(request: VarshphalRequest): Promise<VarshphalReport> {
  return postJson<VarshphalReport>("/varshphal", request);
}

export function fetchVarshphalAnnualHoroscope(
  request: VarshphalRequest,
): Promise<AnnualHoroscopeInformationBlock> {
  return postJson<AnnualHoroscopeInformationBlock>("/varshphal/annual-horoscope", request);
}

export function fetchVarshphalSvgPayload(
  request: VarshphalRequest,
): Promise<NorthIndianChartPayload> {
  return postJson<NorthIndianChartPayload>("/varshphal/chart/svg", request);
}

function chartTypeToDivision(chartType: ChartType): number {
  if (chartType === "Varshphal") {
    return 1;
  }
  const division = Number.parseInt(chartType.replace(/^D/i, ""), 10);
  if (!Number.isFinite(division)) {
    throw new Error(`Invalid chart type: ${chartType}`);
  }
  return division;
}
