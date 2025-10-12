export const formatCurrency = (value: number) => {
  return `Rp${value.toLocaleString('id-ID')}`;
};

export const calculateMonthlyTotals = (data: any[]) => {
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
    des: data.reduce((sum, item) => sum + item.des, 0),
    infaq: data.reduce((sum, item) => sum + item.infaq, 0),
  };
};

export const calculateTotalDonations = (data: any[]) => {
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
      item.des,
      item.infaq,
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
