export function isAllowEmail(email: string) {
  const nwayEmailRegexp = new RegExp(
    '^[a-zA-Z0-9._%+-]+@(nway|animocabrands)\\.com$',
  )
  return nwayEmailRegexp.test(email)
}
