import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { parseOffice } = require('officeparser');

async function test() {
  console.log(parseOffice.toString());
}
test();
