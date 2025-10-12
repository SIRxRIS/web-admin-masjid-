import * as React from "react";
import { type DonaturData, type KotakAmalData, type DonasiKhususData } from "../schema";
import { type IntegratedData } from "@/lib/services/supabase/data-integration";

interface UseRiwayatTahunanHandlersProps {
  data: IntegratedData[];
  setData: React.Dispatch<React.SetStateAction<IntegratedData[]>>;
  kotakAmalData: KotakAmalData[];
  donasiKhususData: DonasiKhususData[];
  setSelectedDonatur: React.Dispatch<React.SetStateAction<IntegratedData | null>>;
  setIsDetailOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsEditOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedKotakAmal: React.Dispatch<React.SetStateAction<KotakAmalData | null>>;
  setIsKotakAmalDetailOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsKotakAmalEditOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedDonasiKhusus: React.Dispatch<React.SetStateAction<DonasiKhususData | null>>;
  setIsDonasiKhususDetailOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsDonasiKhususEditOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useRiwayatTahunanHandlers({
  data,
  setData,
  kotakAmalData,
  donasiKhususData,
  setSelectedDonatur,
  setIsDetailOpen,
  setIsEditOpen,
  setSelectedKotakAmal,
  setIsKotakAmalDetailOpen,
  setIsKotakAmalEditOpen,
  setSelectedDonasiKhusus,
  setIsDonasiKhususDetailOpen,
  setIsDonasiKhususEditOpen
}: UseRiwayatTahunanHandlersProps) {
  
  const handleViewDetail = React.useCallback((data: IntegratedData) => {
    if (data.sourceType === 'donatur') {
      setSelectedDonatur(data);
      setIsDetailOpen(true);
    } else if (data.sourceType === 'kotakAmal') {
      const sourceId = typeof data.sourceId === 'string' ? parseInt(data.sourceId, 10) : data.sourceId;
      const kotakAmal = kotakAmalData.find(item => item.id === sourceId);
      if (kotakAmal) {
        setSelectedKotakAmal(kotakAmal);
        setIsKotakAmalDetailOpen(true);
      }
    } else if (data.sourceType === 'donasiKhusus') {
      const sourceId = typeof data.sourceId === 'string' ? parseInt(data.sourceId, 10) : data.sourceId;
      const donasi = donasiKhususData.find(item => item.id === sourceId);
      if (donasi) {
        setSelectedDonasiKhusus(donasi);
        setIsDonasiKhususDetailOpen(true);
      } else {
        console.error("Donasi Khusus with ID", sourceId, "not found");
        console.log("Available Donasi Khusus IDs:", donasiKhususData.map(d => d.id));
      }
    }
  }, [
    kotakAmalData, 
    donasiKhususData, 
    setSelectedDonatur, 
    setIsDetailOpen, 
    setSelectedKotakAmal, 
    setIsKotakAmalDetailOpen, 
    setSelectedDonasiKhusus, 
    setIsDonasiKhususDetailOpen
  ]);

  const handleEdit = React.useCallback((data: IntegratedData) => {
    if (data.sourceType === 'donatur') {
      setSelectedDonatur(data);
      setIsEditOpen(true);
    } else if (data.sourceType === 'kotakAmal') {
      const sourceId = typeof data.sourceId === 'string' ? parseInt(data.sourceId, 10) : data.sourceId;
      const kotakAmal = kotakAmalData.find(item => item.id === sourceId);
      if (kotakAmal) {
        setSelectedKotakAmal(kotakAmal);
        setIsKotakAmalEditOpen(true);
      }
    } else if (data.sourceType === 'donasiKhusus') {
      try {
        // Extract sourceId and ensure it's not undefined, null, or 0
        const sourceId = typeof data.sourceId === 'string' 
          ? parseInt(data.sourceId, 10) 
          : Number(data.sourceId);
          
        // Log the found donasi IDs for debugging
        console.log("Data Source ID:", sourceId);
        console.log("Source ID type:", typeof sourceId);
        console.log("Available Donasi Khusus IDs:", donasiKhususData.map(d => d.id));
        
        // Find the matching donasi khusus
        const donasi = donasiKhususData.find(item => item.id === sourceId);
        
        if (donasi) {
          setSelectedDonasiKhusus(donasi);
          setIsDonasiKhususEditOpen(true);
        } else {
          // Try to find by using the integrated data ID as a fallback
          const alternativeDonasi = donasiKhususData.find(item => item.id === data.id);
          if (alternativeDonasi) {
            setSelectedDonasiKhusus(alternativeDonasi);
            setIsDonasiKhususEditOpen(true);
          } else {
            console.error("Donasi Khusus not found. Data:", data);
          }
        }
      } catch (error) {
        console.error("Error processing donasiKhusus edit:", error);
      }
    }
  }, [
    kotakAmalData, 
    donasiKhususData, 
    setSelectedDonatur, 
    setIsEditOpen, 
    setSelectedKotakAmal, 
    setIsKotakAmalEditOpen, 
    setSelectedDonasiKhusus, 
    setIsDonasiKhususEditOpen
  ]);

  const handleDelete = React.useCallback((id: string | number) => {
    const idStr = id.toString();
    const filteredData = data.filter(item => item.id.toString() !== idStr);
    
    const updatedData = filteredData.map((item, index) => ({
      ...item,
      no: index + 1,
    }));

    setData(updatedData);
  }, [data, setData]);

  const handleCloseDetail = React.useCallback(() => {
    setIsDetailOpen(false);
    setSelectedDonatur(null);
  }, [setIsDetailOpen, setSelectedDonatur]);

  const handleCloseEdit = React.useCallback(() => {
    setIsEditOpen(false);
    setSelectedDonatur(null);
  }, [setIsEditOpen, setSelectedDonatur]);

  const handleSaveEdit = React.useCallback((updatedData: IntegratedData) => {
    setData(prevData => 
      prevData.map(item => item.id === updatedData.id ? updatedData : item)
    );
  }, [setData]);

  const handleSaveKotakAmal = React.useCallback((updatedKotakAmal: KotakAmalData) => {
    const total = 
      updatedKotakAmal.jan +
      updatedKotakAmal.feb +
      updatedKotakAmal.mar +
      updatedKotakAmal.apr +
      updatedKotakAmal.mei +
      updatedKotakAmal.jun +
      updatedKotakAmal.jul +
      updatedKotakAmal.aug +
      updatedKotakAmal.sep +
      updatedKotakAmal.okt +
      updatedKotakAmal.nov +
      updatedKotakAmal.des;

    const existingItem = data.find(item => 
      item.sourceType === 'kotakAmal' && 
      (typeof item.sourceId === 'string' 
        ? parseInt(item.sourceId, 10) === updatedKotakAmal.id 
        : item.sourceId === updatedKotakAmal.id)
    );

    const integratedData: IntegratedData = {
      id: existingItem?.id || updatedKotakAmal.id,
      no: existingItem?.no || 0,
      nama: `Kotak Amal: ${updatedKotakAmal.nama}`,
      alamat: updatedKotakAmal.lokasi || '',
      jan: updatedKotakAmal.jan,
      feb: updatedKotakAmal.feb,
      mar: updatedKotakAmal.mar,
      apr: updatedKotakAmal.apr,
      mei: updatedKotakAmal.mei,
      jun: updatedKotakAmal.jun,
      jul: updatedKotakAmal.jul,
      aug: updatedKotakAmal.aug,
      sep: updatedKotakAmal.sep,
      okt: updatedKotakAmal.okt,
      nov: updatedKotakAmal.nov,
      des: updatedKotakAmal.des,
      infaq: 0,
      total,
      sourceType: 'kotakAmal',
      sourceId: updatedKotakAmal.id
    };
    
    handleSaveEdit(integratedData);
    setIsKotakAmalEditOpen(false);
    setSelectedKotakAmal(null);
  }, [data, handleSaveEdit, setIsKotakAmalEditOpen, setSelectedKotakAmal]);

  const handleSaveDonasiKhusus = React.useCallback((updatedDonasi: DonasiKhususData) => {
    const date = new Date(updatedDonasi.tanggal);
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'] as const;
    const monthKey = monthNames[date.getMonth()] as keyof typeof monthlyData;
    
    const monthlyData = {
      jan: 0, feb: 0, mar: 0, apr: 0, mei: 0, jun: 0,
      jul: 0, aug: 0, sep: 0, okt: 0, nov: 0, des: 0
    };
    monthlyData[monthKey] = updatedDonasi.jumlah;
    
    // Make sure to find the existing item properly
    const existingItem = data.find(item => 
      item.sourceType === 'donasiKhusus' && 
      ((typeof item.sourceId === 'string' 
        ? parseInt(item.sourceId, 10) === updatedDonasi.id 
        : item.sourceId === updatedDonasi.id) || 
       item.id === updatedDonasi.id)
    );

    const integratedData: IntegratedData = {
      id: existingItem?.id || updatedDonasi.id,
      no: existingItem?.no || data.length + 1,
      nama: `Donasi Khusus: ${updatedDonasi.nama}`,
      alamat: updatedDonasi.keterangan || '',
      ...monthlyData,
      infaq: 0,
      total: updatedDonasi.jumlah,
      sourceType: 'donasiKhusus',
      sourceId: updatedDonasi.id
    };
    
    if (existingItem) {
      handleSaveEdit(integratedData);
    } else {
      setData(prevData => [...prevData, integratedData]);
    }
    
    setIsDonasiKhususEditOpen(false);
    setSelectedDonasiKhusus(null);
  }, [data, handleSaveEdit, setData, setIsDonasiKhususEditOpen, setSelectedDonasiKhusus]);

  const handleCloseDonasiKhususDetail = React.useCallback(() => {
    setIsDonasiKhususDetailOpen(false);
    setSelectedDonasiKhusus(null);
  }, [setIsDonasiKhususDetailOpen, setSelectedDonasiKhusus]);

  const handleCloseDonasiKhususEdit = React.useCallback(() => {
    setIsDonasiKhususEditOpen(false);
    setSelectedDonasiKhusus(null);
  }, [setIsDonasiKhususEditOpen, setSelectedDonasiKhusus]);

  return {
    handleViewDetail,
    handleEdit,
    handleDelete,
    handleCloseDetail,
    handleCloseEdit,
    handleSaveEdit,
    handleSaveKotakAmal,
    handleSaveDonasiKhusus,
    handleCloseDonasiKhususDetail,
    handleCloseDonasiKhususEdit
  };
}