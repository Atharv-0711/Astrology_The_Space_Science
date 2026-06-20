"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchChart,
  fetchChartSvgPayload,
  fetchCurrentDasha,
  fetchDashaTimeline,
  fetchNextDasha,
  fetchSupportedCharts,
  fetchTraditionalStrength,
  fetchTransits,
  fetchVarshphal,
  fetchVarshphalAnnualHoroscope,
  fetchVarshphalSvgPayload,
} from "@/lib/api";
import type { ChartRequest, ChartType, TransitRequest, VarshphalRequest } from "@/lib/types";

export function useChart(chartType: ChartType, request: ChartRequest | null, enabled = true) {
  return useQuery({
    queryKey: ["chart", chartType, request],
    queryFn: () => fetchChart(chartType, request as ChartRequest),
    enabled: enabled && request !== null,
  });
}

export function useChartSvgPayload(chartType: ChartType, request: ChartRequest | null, enabled = true) {
  return useQuery({
    queryKey: ["chart-svg", chartType, request],
    queryFn: () => fetchChartSvgPayload(chartType, request as ChartRequest),
    enabled: enabled && request !== null,
  });
}

export function useSupportedCharts() {
  return useQuery({
    queryKey: ["supported-charts"],
    queryFn: fetchSupportedCharts,
  });
}

export function useDasha(request: ChartRequest | null, calculationDate?: string, enabled = true) {
  return useQuery({
    queryKey: ["dasha", request, calculationDate],
    queryFn: () => fetchDashaTimeline(request as ChartRequest, calculationDate),
    enabled: enabled && request !== null,
  });
}

export function useCurrentDasha(request: ChartRequest | null, calculationDate?: string, enabled = true) {
  return useQuery({
    queryKey: ["dasha-current", request, calculationDate],
    queryFn: () => fetchCurrentDasha(request as ChartRequest, calculationDate),
    enabled: enabled && request !== null,
  });
}

export function useNextDasha(request: ChartRequest | null, calculationDate?: string, enabled = true) {
  return useQuery({
    queryKey: ["dasha-next", request, calculationDate],
    queryFn: () => fetchNextDasha(request as ChartRequest, calculationDate),
    enabled: enabled && request !== null,
  });
}

export function useTransits(request: TransitRequest | null, enabled = true) {
  return useQuery({
    queryKey: ["transits", request],
    queryFn: () => fetchTransits(request as TransitRequest),
    enabled: enabled && request !== null,
  });
}

export function useTraditionalStrength(request: ChartRequest | null, enabled = true) {
  return useQuery({
    queryKey: ["traditional-strength", request],
    queryFn: () => fetchTraditionalStrength(request as ChartRequest),
    enabled: enabled && request !== null,
  });
}

export function useVarshphal(request: VarshphalRequest | null, enabled = true) {
  return useQuery({
    queryKey: ["varshphal", request],
    queryFn: () => fetchVarshphal(request as VarshphalRequest),
    enabled: enabled && request !== null,
  });
}

export function useVarshphalAnnualHoroscope(request: VarshphalRequest | null, enabled = true) {
  return useQuery({
    queryKey: ["varshphal-annual-horoscope", request],
    queryFn: () => fetchVarshphalAnnualHoroscope(request as VarshphalRequest),
    enabled: enabled && request !== null,
  });
}

export function useVarshphalSvgPayload(request: VarshphalRequest | null, enabled = true) {
  return useQuery({
    queryKey: ["varshphal-svg", request],
    queryFn: () => fetchVarshphalSvgPayload(request as VarshphalRequest),
    enabled: enabled && request !== null,
  });
}
