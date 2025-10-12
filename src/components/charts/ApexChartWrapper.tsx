"use client";
import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

// Loading component
const ChartLoading = () => (
  <div className="flex items-center justify-center h-[310px] bg-gray-50 rounded-lg">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

// Dynamic import with proper error handling
const Chart = dynamic(
  () => import("react-apexcharts").then((mod) => {
    // Ensure we're getting the default export
    return mod.default || mod;
  }),
  {
    ssr: false,
    loading: () => <ChartLoading />,
  }
);

interface ApexChartWrapperProps {
  options: ApexOptions;
  series: any[];
  type: "line" | "area" | "bar" | "pie" | "donut" | "radialBar" | "scatter" | "bubble" | "heatmap" | "candlestick" | "boxPlot" | "radar" | "polarArea" | "rangeBar" | "rangeArea" | "treemap";
  height?: number | string;
  width?: number | string;
}

const ApexChartWrapper: React.FC<ApexChartWrapperProps> = ({
  options,
  series,
  type,
  height = 310,
  width = "100%",
}) => {
  return (
    <Suspense fallback={<ChartLoading />}>
      <Chart
        options={options}
        series={series}
        type={type}
        height={height}
        width={width}
      />
    </Suspense>
  );
};

export default ApexChartWrapper;