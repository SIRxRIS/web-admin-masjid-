import { type PengeluaranData, type PengeluaranTahunanData } from "./schema";

export const formatCurrency = (value: number) => {
  return `Rp${value.toLocaleString('id-ID')}`;
};

export const calculateMonthlyTotals = (data: PengeluaranTahunanData[]) => {
  return {
    jan: data.reduce((sum, item) => sum + item.jan, 0),
    feb: data.reduce((sum, item) => sum + item.feb, 0),
    mar: data.reduce((sum, item) => sum + item.mar, 0),
    apr: data.reduce((sum, item) => sum + item.apr, 0),
    mei: data.reduce((sum, item) => sum + item.mei, 0),
    jun: data.reduce((sum, item) => sum + item.jun, 0),
    jul: data.reduce((sum, item) => sum + item.jul, 0),
    aug: data.reduce((sum, item) => sum + item.aug, 0),
    sep: data.reduce((sum, item) => sum + item.sep, 0),
    okt: data.reduce((sum, item) => sum + item.okt, 0),
    nov: data.reduce((sum, item) => sum + item.nov, 0),
    des: data.reduce((sum, item) => sum + item.des, 0)
  };
};

export const calculateTotalPengeluaran = (data: PengeluaranTahunanData[]) => {
  return data.reduce((sum, item) => {
    const itemTotal = [
      item.jan,
      item.feb,
      item.mar,
      item.apr,
      item.mei,
      item.jun,
      item.jul,
      item.aug,
      item.sep,
      item.okt,
      item.nov,
      item.des
    ].reduce((monthSum, value) => monthSum + value, 0);
    return sum + itemTotal;
  }, 0);
};

export const formatNumber = (value: string): string => {
  const number = value.replace(/\D/g, '');
  return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const unformatNumber = (value: string): number => {
  return Number(value.replace(/\D/g, ''));
};

export const calculateMonthlyPengeluaran = (data: PengeluaranData[]) => {
  const monthlyTotals = Array(12).fill(0);
  
  data.forEach(item => {
    const month = new Date(item.tanggal).getMonth();
    monthlyTotals[month] += item.jumlah;
  });
  
  return monthlyTotals;
};

export const calculateTotalPengeluaranBulanan = (data: PengeluaranData[]) => {
  return data.reduce((total, item) => total + item.jumlah, 0);
};
