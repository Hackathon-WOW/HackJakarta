export const groupSalesByMonth = (salesData) => {
    const monthlySales = {};
  
    salesData.forEach(sale => {
      const date = new Date(sale['Purchase Date']);
      const month = date.getMonth();
      const year = date.getFullYear();
      const key = `${year}-${month===0? 12:month}`;
  
      if (!monthlySales[key]) {
        monthlySales[key] = 0;
      }
      monthlySales[key] += parseInt(sale['Sub Total']);
    });
    return Object.keys(monthlySales).map(key => ({
      date: key,
      SalesRevenues: monthlySales[key]
    }));
  };

  export const revNProfitMargin = (salesData) => {
    const monthlyProfit = {};
  
    salesData.forEach(sale => {
      const date = new Date(sale['Purchase Date']);
      const month = date.getMonth();
      const year = date.getFullYear();
      const key = `${year}-${month===0? 12:month}`;
  
      if (!monthlyProfit[key]) {
        monthlyProfit[key] = 0;
      }
      monthlyProfit[key] += parseInt(sale['Profit']);
    });
   return Object.keys(monthlyProfit).map(key => ({
        date: key,
        Profit: monthlyProfit[key]
      }));
  };

