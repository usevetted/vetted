export const yearsOptions = [
  { value: 'Less than 1 year', label: 'Less than 1 year' },
  ...Array.from({ length: 29 }, (_, i) => {
    const n = i + 1;
    return { value: `${n} year${n > 1 ? 's' : ''}`, label: `${n} year${n > 1 ? 's' : ''}` };
  }),
  { value: '30+ years', label: '30+ years' },
];