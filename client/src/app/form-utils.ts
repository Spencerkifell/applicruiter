export function emailValidator(control: any): any {
  const emailPattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  const { value } = control;
  const trimmedValue = value.trim().replace(/\s+/g, '');

  let invalidEmails: boolean = false;

  if (trimmedValue == '') return null;

  const results: string[] = trimmedValue.split(',');
  results.forEach((email: string) => {
    if (!emailPattern.test(email)) invalidEmails = true;
  });

  return invalidEmails ? { invalidEmails: true, emails: results } : null;
}

export function filterMultiInput(value: string): boolean {
  const result: string[] = value.trim().split(/(,)/);
  const totalWords = result.filter(
    (word) => word !== ',' && word.trim() !== ''
  ).length;
  const totalCommas = result.filter((comma) => comma == ',').length;
  return totalCommas === totalWords - 1;
}
