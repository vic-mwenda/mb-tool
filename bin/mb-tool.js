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
  .option('-b, --baudRate <rate>', 'Baud rate', (val) => parseInt(val, 10), 9600)
  .option('-d, --dataBits <bits>', 'Data bits', (val) => parseInt(val, 10), 8)
  .option('-s, --stopBits <bits>', 'Stop bits', (val) => parseInt(val, 10), 1)
  .option('-a, --parity <parity>', 'Parity (none, even, odd)', 'none')
  .option('-i, --id <id>', 'Slave ID', (val) => parseInt(val, 10), 1)
  .action((options) => {
    console.log('RTU Options:', options);
    setupConnection({ ...options, type: 'rtu' });
  });

connectCmd
  .command('tcp')
  .description('Connect to a Modbus TCP device')
  .option('-h, --host <host>', 'Host IP address or hostname', 'localhost')
  .option('-p, --port <port>', 'TCP port', (val) => parseInt(val, 10), 502)
  .option('-i, --id <id>', 'Slave ID', (val) => parseInt(val, 10), 1)
  .action((options) => {
    console.log('TCP Options:', options);
    
    if (typeof options.port === 'string') options.port = parseInt(options.port, 10);
    if (typeof options.id === 'string') options.id = parseInt(options.id, 10);
        
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
  .option('-a, --address <address>', 'Starting address', (val) => parseInt(val, 10), 0)
  .option('-c, --count <count>', 'Number of registers to read', (val) => parseInt(val, 10), 1)
  .action((options) => {
    console.log('Read Options:', options);
    if (typeof options.address === 'string') options.address = parseInt(options.address, 10);
    if (typeof options.count === 'string') options.count = parseInt(options.count, 10);
    
    readRegisters(options);
  });

program
  .command('write')
  .description('Write to Modbus registers')
  .option('-t, --type <type>', 'Register type (holding, coil)', 'holding')
  .option('-a, --address <address>', 'Starting address', (val) => parseInt(val, 10), 0)
  .option('-v, --values <values>', 'Values to write (comma-separated)')
  .action((options) => {
    console.log('Write Options:', options);
    if (typeof options.address === 'string') options.address = parseInt(options.address, 10);
    
    writeRegisters(options);
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
