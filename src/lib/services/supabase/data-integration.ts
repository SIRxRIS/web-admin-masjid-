import { DonaturData, KotakAmalData, DonasiKhususData, KotakAmalMasjidData, KotakAmalJumatData } from "@/lib/schema/pemasukan/schema";

export type IntegratedData = {
  id: number;
  no: number;
  nama: string;
  alamat: string;
  jan: number;
  feb: number;
  mar: number;
  apr: number;
  mei: number;
  jun: number;
  jul: number;
  aug: number;
  sep: number;
  okt: number;
  nov: number;
  des: number;
  infaq: number;
  total: number;
  sourceType: 'donatur' | 'kotakAmal' | 'donasiKhusus' | 'kotakAmalMasjid' | 'kotakAmalJumat';
  sourceId: number;
};

export function integrateData(
  donaturData: DonaturData[],
  kotakAmalData: KotakAmalData[],
  donasiKhususData: DonasiKhususData[],
  kotakAmalMasjidData: KotakAmalMasjidData[],
  kotakAmalJumatData: KotakAmalJumatData[],
  year: string
): IntegratedData[] {
  const result: IntegratedData[] = [];
  
  const filteredDonasiKhusus = donasiKhususData.filter(donasi => {
    const date = donasi.tanggal instanceof Date ? donasi.tanggal : new Date(donasi.tanggal);
    return date.getFullYear().toString() === year;
  });
  
  const filteredKotakAmalMasjid = kotakAmalMasjidData.filter(item => {
    return item.tahun.toString() === year;
  });
  
  const filteredKotakAmalJumat = kotakAmalJumatData.filter(item => {
    return item.tahun.toString() === year;
  });
  
  donaturData.forEach((donatur, index) => {
    const total = 
      donatur.jan + 
      donatur.feb + 
      donatur.mar + 
      donatur.apr + 
      donatur.mei + 
      donatur.jun + 
      donatur.jul + 
      donatur.aug + 
      donatur.sep + 
      donatur.okt + 
      donatur.nov + 
      donatur.des + 
      donatur.infaq;
      
    result.push({
      id: result.length + 1,
      no: index + 1,
      nama: donatur.nama,
      alamat: donatur.alamat || '',
      jan: donatur.jan,
      feb: donatur.feb,
      mar: donatur.mar,
      apr: donatur.apr,
      mei: donatur.mei,
      jun: donatur.jun,
      jul: donatur.jul,
      aug: donatur.aug,
      sep: donatur.sep,
      okt: donatur.okt,
      nov: donatur.nov,
      des: donatur.des,
      infaq: donatur.infaq,
      total,
      sourceType: 'donatur',
      sourceId: donatur.id
    });
  });
  
  kotakAmalData.forEach((kotakAmal, index) => {
    const total = 
      kotakAmal.jan +
      kotakAmal.feb +
      kotakAmal.mar +
      kotakAmal.apr +
      kotakAmal.mei +
      kotakAmal.jun +
      kotakAmal.jul +
      kotakAmal.aug +
      kotakAmal.sep +
      kotakAmal.okt +
      kotakAmal.nov +
      kotakAmal.des;
      
    result.push({
      id: result.length + 1,
      no: result.length + 1,
      nama: `Kotak Amal: ${kotakAmal.nama}`,
      alamat: kotakAmal.lokasi || '',
      jan: kotakAmal.jan,
      feb: kotakAmal.feb,
      mar: kotakAmal.mar,
      apr: kotakAmal.apr,
      mei: kotakAmal.mei,
      jun: kotakAmal.jun,
      jul: kotakAmal.jul,
      aug: kotakAmal.aug,
      sep: kotakAmal.sep,
      okt: kotakAmal.okt,
      nov: kotakAmal.nov,
      des: kotakAmal.des,
      infaq: 0,
      total,
      sourceType: 'kotakAmal',
      sourceId: kotakAmal.id
    });
  });
  
  // Proses data kotak amal masjid 
  const kotakAmalMasjidByMonth: Record<string, number> = {
    jan: 0, feb: 0, mar: 0, apr: 0, mei: 0, jun: 0,
    jul: 0, aug: 0, sep: 0, okt: 0, nov: 0, des: 0
  };
  
  filteredKotakAmalMasjid.forEach(item => {
    const tanggal = item.tanggal instanceof Date ? item.tanggal : new Date(item.tanggal);
    const bulan = tanggal.getMonth();
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'];
    const monthKey = monthNames[bulan];
    
    kotakAmalMasjidByMonth[monthKey] += item.jumlah;
  });
  
  // Menambahkan total kotak amal masjid ke hasil integrasi
  const totalKotakAmalMasjid = Object.values(kotakAmalMasjidByMonth).reduce((sum, val) => sum + val, 0);
  
  result.push({
    id: result.length + 1,
    no: result.length + 1,
    nama: "Kotak Amal Masjid",
    alamat: "Masjid",
    jan: kotakAmalMasjidByMonth.jan,
    feb: kotakAmalMasjidByMonth.feb,
    mar: kotakAmalMasjidByMonth.mar,
    apr: kotakAmalMasjidByMonth.apr,
    mei: kotakAmalMasjidByMonth.mei,
    jun: kotakAmalMasjidByMonth.jun,
    jul: kotakAmalMasjidByMonth.jul,
    aug: kotakAmalMasjidByMonth.aug,
    sep: kotakAmalMasjidByMonth.sep,
    okt: kotakAmalMasjidByMonth.okt,
    nov: kotakAmalMasjidByMonth.nov,
    des: kotakAmalMasjidByMonth.des,
    infaq: 0,
    total: totalKotakAmalMasjid,
    sourceType: 'kotakAmalMasjid',
    sourceId: 0 // ID gabungan untuk semua kotak amal masjid
  });
  
  // Proses data kotak amal jumat 
  const kotakAmalJumatByMonth: Record<string, number> = {
    jan: 0, feb: 0, mar: 0, apr: 0, mei: 0, jun: 0,
    jul: 0, aug: 0, sep: 0, okt: 0, nov: 0, des: 0
  };
  
  filteredKotakAmalJumat.forEach(item => {
    const tanggal = item.tanggal instanceof Date ? item.tanggal : new Date(item.tanggal);
    const bulan = tanggal.getMonth();
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'];
    const monthKey = monthNames[bulan];
    
    kotakAmalJumatByMonth[monthKey] += item.jumlah;
  });
  
  // Menambahkan total kotak amal jumat ke hasil integrasi
  const totalKotakAmalJumat = Object.values(kotakAmalJumatByMonth).reduce((sum, val) => sum + val, 0);
  
  result.push({
    id: result.length + 1,
    no: result.length + 1,
    nama: "Kotak Amal Jumat",
    alamat: "Masjid",
    jan: kotakAmalJumatByMonth.jan,
    feb: kotakAmalJumatByMonth.feb,
    mar: kotakAmalJumatByMonth.mar,
    apr: kotakAmalJumatByMonth.apr,
    mei: kotakAmalJumatByMonth.mei,
    jun: kotakAmalJumatByMonth.jun,
    jul: kotakAmalJumatByMonth.jul,
    aug: kotakAmalJumatByMonth.aug,
    sep: kotakAmalJumatByMonth.sep,
    okt: kotakAmalJumatByMonth.okt,
    nov: kotakAmalJumatByMonth.nov,
    des: kotakAmalJumatByMonth.des,
    infaq: 0,
    total: totalKotakAmalJumat,
    sourceType: 'kotakAmalJumat',
    sourceId: 0 // ID gabungan untuk semua kotak amal jumat
  });
  
  const donasiByMonth: Record<string, number> = {
    jan: 0, feb: 0, mar: 0, apr: 0, mei: 0, jun: 0,
    jul: 0, aug: 0, sep: 0, okt: 0, nov: 0, des: 0
  };
  
  const donasiByDonatur: Record<string, {
    nama: string;
    keterangan: string;
    byMonth: Record<string, number>;
    total: number;
    id: number;  
  }> = {};
  
  filteredDonasiKhusus.forEach(donasi => {
    const date = donasi.tanggal instanceof Date ? donasi.tanggal : new Date(donasi.tanggal);
    const month = date.getMonth();
    
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des'];
    const monthKey = monthNames[month];
    
    donasiByMonth[monthKey] += donasi.jumlah;
    
    const donaturKey = `${donasi.nama}-${donasi.keterangan}`;
    
    if (!donasiByDonatur[donaturKey]) {
      donasiByDonatur[donaturKey] = {
        nama: donasi.nama,
        keterangan: donasi.keterangan,
        byMonth: {
          jan: 0, feb: 0, mar: 0, apr: 0, mei: 0, jun: 0,
          jul: 0, aug: 0, sep: 0, okt: 0, nov: 0, des: 0
        },
        total: 0,
        id: donasi.id  
      };
    }
    
    donasiByDonatur[donaturKey].byMonth[monthKey] += donasi.jumlah;
    donasiByDonatur[donaturKey].total += donasi.jumlah;
  });
  
  Object.keys(donasiByDonatur).forEach(key => {
    const donasi = donasiByDonatur[key];
    
    result.push({
      id: result.length + 1,
      no: result.length + 1,
      nama: `Donasi Khusus: ${donasi.nama}`,
      alamat: donasi.keterangan,
      jan: donasi.byMonth.jan,
      feb: donasi.byMonth.feb,
      mar: donasi.byMonth.mar,
      apr: donasi.byMonth.apr,
      mei: donasi.byMonth.mei,
      jun: donasi.byMonth.jun,
      jul: donasi.byMonth.jul,
      aug: donasi.byMonth.aug,
      sep: donasi.byMonth.sep,
      okt: donasi.byMonth.okt,
      nov: donasi.byMonth.nov,
      des: donasi.byMonth.des,
      infaq: 0,
      total: donasi.total,
      sourceType: 'donasiKhusus',
      sourceId: donasi.id  
    });
  });
  
  return result.map((item, index) => ({
    ...item,
    no: index + 1
  }));
}

export function getSourceDetail(
  sourceType: 'donatur' | 'kotakAmal' | 'donasiKhusus' | 'kotakAmalMasjid' | 'kotakAmalJumat',
  sourceId: number,
  donaturData: DonaturData[],
  kotakAmalData: KotakAmalData[],
  donasiKhususData: DonasiKhususData[],
  kotakAmalMasjidData: KotakAmalMasjidData[],
  kotakAmalJumatData: KotakAmalJumatData[]
) {
  switch (sourceType) {
    case 'donatur':
      return donaturData.find(item => item.id === sourceId);
    case 'kotakAmal':
      return kotakAmalData.find(item => item.id === sourceId);
    case 'donasiKhusus':
      return donasiKhususData.filter(item => item.id === sourceId);
    case 'kotakAmalMasjid':
      return kotakAmalMasjidData.filter(item => item.tahun === parseInt(sourceId.toString()));
    case 'kotakAmalJumat':
      return kotakAmalJumatData.filter(item => item.tahun === parseInt(sourceId.toString()));
    default:
      return null;
  }
}

export function updateIntegratedData(
  updatedItem: IntegratedData,
  donaturData: DonaturData[],
  kotakAmalData: KotakAmalData[],
  donasiKhususData: DonasiKhususData[],
  kotakAmalMasjidData: KotakAmalMasjidData[],
  kotakAmalJumatData: KotakAmalJumatData[]
) {
  const { sourceType, sourceId } = updatedItem;
  
  let updatedDonaturData = [...donaturData];
  let updatedKotakAmalData = [...kotakAmalData];
  let updatedDonasiKhususData = [...donasiKhususData];
  let updatedKotakAmalMasjidData = [...kotakAmalMasjidData];
  let updatedKotakAmalJumatData = [...kotakAmalJumatData];
  
  switch (sourceType) {
    case 'donatur':
      updatedDonaturData = donaturData.map(item => {
        if (item.id === sourceId) {
          return {
            ...item,
            nama: updatedItem.nama,
            alamat: updatedItem.alamat,
            jan: updatedItem.jan,
            feb: updatedItem.feb,
            mar: updatedItem.mar,
            apr: updatedItem.apr,
            mei: updatedItem.mei,
            jun: updatedItem.jun,
            jul: updatedItem.jul,
            aug: updatedItem.aug,
            sep: updatedItem.sep,
            okt: updatedItem.okt,
            nov: updatedItem.nov,
            des: updatedItem.des,
            infaq: updatedItem.infaq
          };
        }
        return item;
      });
      break;
    case 'kotakAmal':
      updatedKotakAmalData = kotakAmalData.map(item => {
        if (item.id === sourceId) {
          return {
            ...item,
            nama: updatedItem.nama.replace('Kotak Amal: ', ''),
            lokasi: updatedItem.alamat,
            jan: updatedItem.jan,
            feb: updatedItem.feb,
            mar: updatedItem.mar,
            apr: updatedItem.apr,
            mei: updatedItem.mei,
            jun: updatedItem.jun,
            jul: updatedItem.jul,
            aug: updatedItem.aug,
            sep: updatedItem.sep,
            okt: updatedItem.okt,
            nov: updatedItem.nov,
            des: updatedItem.des
          };
        }
        return item;
      });
      break;
  }
  
  return {
    updatedDonaturData,
    updatedKotakAmalData,
    updatedDonasiKhususData,
    updatedKotakAmalMasjidData,
    updatedKotakAmalJumatData
  };
}