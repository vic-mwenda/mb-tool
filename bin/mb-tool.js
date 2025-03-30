#!/usr/bin/env node
const program = require('commander');
const { version } = require('../package.json');
const ModbusClient = require('../src/modbus-client');
const { setupConnection } = require('../src/connection');
const { readRegisters, writeRegisters } = require('../src/operations');

program
  .version(version)
  .description('A CLI tool for Modbus RTU and TCP communication');

const connectCmd = program.command('connect')
  .description('Connect to a Modbus device');

connectCmd
  .command('rtu')
  .description('Connect to a Modbus RTU device')
  .option('-p, --port <port>', 'Serial port path (e.g., /dev/ttyUSB0, COM1)')
  .option('-b, --baudRate <rate>', 'Baud rate', parseInt, 9600)
  .option('-d, --dataBits <bits>', 'Data bits', parseInt, 8)
  .option('-s, --stopBits <bits>', 'Stop bits', parseInt, 1)
  .option('-a, --parity <parity>', 'Parity (none, even, odd)', 'none')
  .option('-i, --id <id>', 'Slave ID', parseInt, 1)
  .action((options) => {
    setupConnection({ ...options, type: 'rtu' });
  });

connectCmd
  .command('tcp')
  .description('Connect to a Modbus TCP device')
  .option('-h, --host <host>', 'Host IP address or hostname', 'localhost')
  .option('-p, --port <port>', 'TCP port', parseInt, 502)
  .option('-i, --id <id>', 'Slave ID', parseInt, 1)
  .action((options) => {
    setupConnection({ ...options, type: 'tcp' });
  });

connectCmd
  .action(() => {
    setupConnection({});
  });

program
  .command('read')
  .description('Read Modbus registers')
  .option('-t, --type <type>', 'Register type (holding, input, coil, discrete)', 'holding')
  .option('-a, --address <address>', 'Starting address', parseInt, 0)
  .option('-c, --count <count>', 'Number of registers to read', parseInt, 1)
  .action(readRegisters);

program
  .command('write')
  .description('Write to Modbus registers')
  .option('-t, --type <type>', 'Register type (holding, coil)', 'holding')
  .option('-a, --address <address>', 'Starting address', parseInt, 0)
  .option('-v, --values <values>', 'Values to write (comma-separated)')
  .action(writeRegisters);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
