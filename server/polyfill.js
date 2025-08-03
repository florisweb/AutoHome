import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = getCurDir();

export function getCurDir() {
    return dirname(fileURLToPath(import.meta.url));
}