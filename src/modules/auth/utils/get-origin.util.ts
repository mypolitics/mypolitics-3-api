import { Request } from 'express';

const origins = {
  PL: 'mypolitics.pl',
  default: 'mypolitics.eu',
  dev: 'localhost:3000',
};

export const getOrigin = (req: Request) => {
  const ipCountryHeader = req.headers?.['cf-ipcountry'];
  const country = ipCountryHeader ? `${ipCountryHeader}` : 'dev';
  return origins[country] || origins.default;
};
