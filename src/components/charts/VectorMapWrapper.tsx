"use client";
import React, { Suspense } from "react";
import dynamic from "next/dynamic";

// Loading component
const MapLoading = () => (
  <div className="flex items-center justify-center h-[400px] bg-gray-50 rounded-lg">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
  </div>
);

// Dynamic import with proper error handling
const VectorMap = dynamic(
  () => import("@react-jvectormap/core").then((mod) => {
    return mod.VectorMap;
  }),
  {
    ssr: false,
    loading: () => <MapLoading />,
  }
);

interface VectorMapWrapperProps {
  map: any;
  backgroundColor?: string;
  markerStyle?: any;
  markersSelectable?: boolean;
  markers?: any[];
  regionStyle?: any;
  regionLabelStyle?: any;
  series?: any;
  onRegionClick?: (event: any, code: string) => void;
  onMarkerClick?: (event: any, index: number) => void;
  zoomOnScroll?: boolean;
  zoomMax?: number;
  zoomMin?: number;
  zoomStep?: number;
  zoomAnimate?: boolean;
  focusOn?: any;
  labels?: any;
  selectedRegions?: string[];
  selectedMarkers?: number[];
  regionsSelectable?: boolean;
  regionsSelectableOne?: boolean;
  markersSelectableOne?: boolean;
  [key: string]: any; // Allow any additional props
}

const VectorMapWrapper: React.FC<VectorMapWrapperProps> = (props) => {
  return (
    <Suspense fallback={<MapLoading />}>
      <VectorMap {...(props as any)} />
    </Suspense>
  );
};

export default VectorMapWrapper;