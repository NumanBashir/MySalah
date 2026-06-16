const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  hour12: false,
  minute: '2-digit',
});

const gregorianDateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'long',
  weekday: 'long',
});

const hijriDateFormatter = new Intl.DateTimeFormat(
  'en-US-u-ca-islamic-umalqura',
  {
    day: 'numeric',
    month: 'long',
  },
);

export function formatTime(date: Date) {
  return timeFormatter.format(date);
}

export function formatGregorianDate(date: Date) {
  return gregorianDateFormatter.format(date);
}

export function formatHijriDate(date: Date) {
  try {
    return hijriDateFormatter.format(date);
  } catch {
    return 'Hijri date unavailable';
  }
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
