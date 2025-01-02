export function getBestDayId(): number {
  const date = new Date();
  const day = date.getDay();
  // monday to friday

  if (day >= 1 && day <= 5) {
    return day - 1;
  } else {
    return 0;
  }
}
