export const calcEMI = (rate, amount, tenure) => {
  const r = rate / 12; // monthly rate
  return (amount * r * Math.pow(1 + r, tenure)) / (Math.pow(1 + r, tenure) - 1);
};

export const generateSchedule = (loanAmount, rate, tenure, startDate) => {
  const schedule = [];
  let remaining = loanAmount;
  let currentDate = new Date(startDate);

  for (let i = 0; i < tenure; i++) {
    const interest = remaining * (rate / 12);
    const emi = calcEMI(rate, loanAmount, tenure);
    const principal = emi - interest;
    remaining -= principal;

    schedule.push({
      date: currentDate.toISOString().split("T")[0],
      emi: emi.toFixed(2),
      principal: principal.toFixed(2),
      interest: interest.toFixed(2),
      remaining: remaining > 0 ? remaining.toFixed(2) : "0.00",
    });

    // move to next month
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return schedule;
};
