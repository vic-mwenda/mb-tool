const chalk = require('chalk');
const modbusClient = require('./modbus-client');
const { loadConnectionConfig } = require('./connection');

async function readRegisters(options) {
  try {
    if (!modbusClient.connected) {
      const config = loadConnectionConfig();
      if (!config) {
        console.error(chalk.red('Not connected to any device. Use "connect" command first.'));
        process.exit(1);
      }
      
      if (config.type === 'rtu') {
        await modbusClient.connectRTU(config);
      } else if (config.type === 'tcp') {
        await modbusClient.connectTCP(config);
      } else {
        throw new Error(`Invalid connection type in saved config: ${config.type}`);
      }
    }

    let data;
    const { type, address, count } = options;
    
    console.log(chalk.blue(`Reading ${count} ${type} register(s) from address ${address}...`));
    
    switch (type.toLowerCase()) {
      case 'holding':
        data = await modbusClient.readHoldingRegisters(address, count);
        break;
      case 'input':
        data = await modbusClient.readInputRegisters(address, count);
        break;
      case 'coil':
        data = await modbusClient.readCoils(address, count);
        break;
      case 'discrete':
        data = await modbusClient.readDiscreteInputs(address, count);
        break;
      default:
        throw new Error(`Invalid register type: ${type}`);
    }

    console.log(chalk.green('Read successful:'));
    
    if (type.toLowerCase() === 'coil' || type.toLowerCase() === 'discrete') {
      console.log(chalk.cyan('Address\tValue'));
      console.log(chalk.cyan('-------\t-----'));
      data.forEach((value, index) => {
        console.log(`${address + index}\t${value ? chalk.green('ON') : chalk.red('OFF')}`);
      });
    } else {
      console.log(chalk.cyan('Address\tDec\tHex\tBin'));
      console.log(chalk.cyan('-------\t---\t---\t---'));
      data.forEach((value, index) => {
        console.log(`${address + index}\t${value}\t0x${value.toString(16).padStart(4, '0')}\t${value.toString(2).padStart(16, '0')}`);
      });
    }
  } catch (error) {
    console.error(chalk.red(`Error reading registers: ${error.message}`));
    process.exit(1);
  }
}

async function writeRegisters(options) {
  try {
    if (!modbusClient.connected) {
      const config = loadConnectionConfig();
      if (!config) {
        console.error(chalk.red('Not connected to any device. Use "connect" command first.'));
        process.exit(1);
      }
      
      if (config.type === 'rtu') {
        await modbusClient.connectRTU(config);
      } else if (config.type === 'tcp') {
        await modbusClient.connectTCP(config);
      } else {
        throw new Error(`Invalid connection type in saved config: ${config.type}`);
      }
    }

    const { type, address, values } = options;
    
    if (!values) {
      console.error(chalk.red('No values specified. Use --values option.'));
      process.exit(1);
    }
    
    const valueArray = values.split(',').map(val => {
      if (val.toLowerCase() === 'true' || val.toLowerCase() === 'on' || val === '1') {
        return true;
      } else if (val.toLowerCase() === 'false' || val.toLowerCase() === 'off' || val === '0') {
        return false;
      }
      return parseInt(val, 10);
    });
    
    console.log(chalk.blue(`Writing to ${type} register(s) at address ${address}...`));
    
    let success = false;
    
    switch (type.toLowerCase()) {
      case 'holding':
        if (valueArray.length === 1) {
          success = await modbusClient.writeHoldingRegister(address, valueArray[0]);
        } else {
          success = await modbusClient.writeHoldingRegisters(address, valueArray);
        }
        break;
      case 'coil':
        if (valueArray.length === 1) {
          success = await modbusClient.writeCoil(address, valueArray[0]);
        } else {
          success = await modbusClient.writeCoils(address, valueArray);
        }
        break;
      default:
        throw new Error(`Invalid register type for writing: ${type}. Use 'holding' or 'coil'.`);
    }

    if (success) {
      console.log(chalk.green(`Successfully wrote ${valueArray.length} value(s) to ${type} register(s) starting at address ${address}`));
      
      console.log(chalk.cyan('Address\tValue'));
      console.log(chalk.cyan('-------\t-----'));
      valueArray.forEach((value, index) => {
        if (typeof value === 'boolean') {
          console.log(`${address + index}\t${value ? chalk.green('ON') : chalk.red('OFF')}`);
        } else {
          console.log(`${address + index}\t${value} (0x${value.toString(16).padStart(4, '0')})`);
        }
      });
    }
  } catch (error) {
    console.error(chalk.red(`Error writing to registers: ${error.message}`));
    process.exit(1);
  }
}

module.exports = {
  readRegisters,
  writeRegisters
};
