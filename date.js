// Named Exports

export function getDate() {
  const options = {
    weekday: "long",
    month: "short",
    day: "numeric",
  };
  const day = new Date().toLocaleDateString("en-US", options);
  return day;
}

export function getDay() {
  const options = {
    weekday: "long",
  };
  const day = new Date().toLocaleDateString("en-US", options);
  return day;
}
