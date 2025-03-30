const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const modbusClient = require('./modbus-client');

const CONFIG_FILE = path.join(process.cwd(), '.mb-tool-config.json');

async function setupConnection(options) {
  try {
    if (!options.type) {
      const typeAnswer = await inquirer.prompt([
        {
          type: 'list',
          name: 'type',
          message: 'Select connection type:',
          choices: ['rtu', 'tcp']
        }
      ]);
      options.type = typeAnswer.type;
    }

    if (options.type === 'rtu') {
      await setupRTUConnection(options);
    } else if (options.type === 'tcp') {
      await setupTCPConnection(options);
    } else {
      throw new Error(`Invalid connection type: ${options.type}`);
    }
  } catch (error) {
    console.error(chalk.red(`Connection error: ${error.message}`));
    process.exit(1);
  }
}

async function setupRTUConnection(options) {
  if (!options.port) {
    options = await promptRTUConnectionDetails(options);
  }
  
  const success = await modbusClient.connectRTU(options);
  
  if (success) {
    saveConnectionConfig({ ...options, type: 'rtu' });
  }
}

async function setupTCPConnection(options) {
  if (!options.host || !options.port) {
    options = await promptTCPConnectionDetails(options);
  }
  
  const success = await modbusClient.connectTCP(options);
  
  if (success) {
    saveConnectionConfig({ ...options, type: 'tcp' });
  }
}

async function promptRTUConnectionDetails(options) {
  try {
    const { SerialPort } = await import('serialport');
    const ports = await SerialPort.list();
    
    const portChoices = ports.map(port => ({
      name: `${port.path} - ${port.manufacturer || 'Unknown device'}`,
      value: port.path
    }));

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'port',
        message: 'Select serial port:',
        choices: portChoices,
        when: !options.port
      },
      {
        type: 'list',
        name: 'baudRate',
        message: 'Select baud rate:',
        choices: [1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200],
        default: options.baudRate || 9600,
        when: !options.baudRate
      },
      {
        type: 'list',
        name: 'dataBits',
        message: 'Select data bits:',
        choices: [7, 8],
        default: options.dataBits || 8,
        when: !options.dataBits
      },
      {
        type: 'list',
        name: 'stopBits',
        message: 'Select stop bits:',
        choices: [1, 2],
        default: options.stopBits || 1,
        when: !options.stopBits
      },
      {
        type: 'list',
        name: 'parity',
        message: 'Select parity:',
        choices: ['none', 'even', 'odd'],
        default: options.parity || 'none',
        when: !options.parity
      },
      {
        type: 'number',
        name: 'id',
        message: 'Enter slave ID:',
        default: options.id || 1,
        when: !options.id
      }
    ]);

    return { ...options, ...answers };
  } catch (error) {
    console.error(chalk.yellow('Could not auto-detect serial ports. Please specify port manually.'));
    
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'port',
        message: 'Enter serial port path:',
        when: !options.port
      },
      {
        type: 'list',
        name: 'baudRate',
        message: 'Select baud rate:',
        choices: [1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200],
        default: options.baudRate || 9600,
        when: !options.baudRate
      },
      {
        type: 'list',
        name: 'dataBits',
        message: 'Select data bits:',
        choices: [7, 8],
        default: options.dataBits || 8,
        when: !options.dataBits
      },
      {
        type: 'list',
        name: 'stopBits',
        message: 'Select stop bits:',
        choices: [1, 2],
        default: options.stopBits || 1,
        when: !options.stopBits
      },
      {
        type: 'list',
        name: 'parity',
        message: 'Select parity:',
        choices: ['none', 'even', 'odd'],
        default: options.parity || 'none',
        when: !options.parity
      },
      {
        type: 'number',
        name: 'id',
        message: 'Enter slave ID:',
        default: options.id || 1,
        when: !options.id
      }
    ]);

    return { ...options, ...answers };
  }
}

async function promptTCPConnectionDetails(options) {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'host',
      message: 'Enter Modbus TCP host (IP address or hostname):',
      default: options.host || 'localhost',
      when: !options.host
    },
    {
      type: 'number',
      name: 'port',
      message: 'Enter Modbus TCP port:',
      default: options.port || 502,
      when: !options.port
    },
    {
      type: 'number',
      name: 'id',
      message: 'Enter slave ID:',
      default: options.id || 1,
      when: !options.id
    }
  ]);

  return { ...options, ...answers };
}

function saveConnectionConfig(config) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error(chalk.yellow(`Could not save connection config: ${error.message}`));
  }
}

function loadConnectionConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    }
  } catch (error) {
    console.error(chalk.yellow(`Could not load connection config: ${error.message}`));
  }
  return null;
}

module.exports = {
  setupConnection,
  loadConnectionConfig
};
