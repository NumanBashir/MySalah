export function formatTime(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
    timeZone,
  }).format(date);
}

export function formatGregorianDate(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    timeZone,
    weekday: 'long',
  }).format(date);
}

export function formatHijriDate(date: Date, timeZone: string) {
  try {
    return new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      timeZone,
    }).format(date);
  } catch {
    return 'Hijri date unavailable';
  }
}

export function getDateForTimeZone(date: Date, timeZone: string) {
  const dateParts = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'numeric',
    timeZone,
    year: 'numeric',
  }).formatToParts(date);

  const getPart = (type: string) => {
    const value = dateParts.find((part) => part.type === type)?.value;
    return value ? Number(value) : 0;
  };

  return new Date(getPart('year'), getPart('month') - 1, getPart('day'));
}

export function formatCountdown(from: Date, to: Date) {
  const diffMs = Math.max(0, to.getTime() - from.getTime());
  const totalSeconds = Math.ceil(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours <= 0) {
    if (minutes <= 0) {
      return `in ${seconds}s`;
    }

    return `in ${minutes}m ${seconds}s`;
  }

  return `in ${hours}h ${minutes}m ${seconds}s`;
}
