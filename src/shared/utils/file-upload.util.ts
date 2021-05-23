import { join } from 'lodash';
import { Express } from 'express';

export const createUniqueFilename = (file: Express.Multer.File): string => {
  const timestamp = new Date().getTime();
  const encodedFileName = encodeURIComponent(file.originalname);
  return join([timestamp, encodedFileName], '-');
};

export const createPublicPath = (dir: string, fileName: string) => (
  join(['mypolitics-3', 'public', dir, fileName], '/')
);
