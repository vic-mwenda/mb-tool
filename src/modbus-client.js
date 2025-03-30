const ModbusRTU = require('modbus-serial');
const chalk = require('chalk');

class ModbusClient {
  constructor() {
    this.client = new ModbusRTU();
    this.connected = false;
    this.options = {};
    this.connectionType = null; 
  }

  async connectRTU(options) {
    this.options = options;
    this.connectionType = 'rtu';
    
    try {
      await this.client.connectRTUBuffered(options.port, {
        baudRate: options.baudRate,
        dataBits: options.dataBits,
        stopBits: options.stopBits,
        parity: options.parity
      });
      
      this.client.setID(options.id);
      this.connected = true;
      
      console.log(chalk.green(`Connected to Modbus RTU device on ${options.port}`));
      console.log(chalk.gray(`Settings: ${options.baudRate} baud, ${options.dataBits}${options.parity.charAt(0).toUpperCase()}${options.stopBits}, Slave ID: ${options.id}`));
      
      return true;
    } catch (error) {
      console.error(chalk.red(`Failed to connect: ${error.message}`));
      return false;
    }
  }

  async connectTCP(options) {
    this.options = options;
    this.connectionType = 'tcp';
    
    try {
      await this.client.connectTCP(options.host, { port: options.port });
      this.client.setID(options.id);
      this.connected = true;
      
      console.log(chalk.green(`Connected to Modbus TCP device at ${options.host}:${options.port}`));
      console.log(chalk.gray(`Slave ID: ${options.id}`));
      
      return true;
    } catch (error) {
      console.error(chalk.red(`Failed to connect: ${error.message}`));
      return false;
    }
  }

  async disconnect() {
    if (this.connected) {
      try {
        await this.client.close();
        this.connected = false;
        console.log(chalk.yellow(`Disconnected from Modbus ${this.connectionType.toUpperCase()} device`));
      } catch (error) {
        console.error(chalk.red(`Error disconnecting: ${error.message}`));
      }
    }
  }

  async readHoldingRegisters(address, length) {
    this.checkConnection();
    try {
      const result = await this.client.readHoldingRegisters(address, length);
      return result.data;
    } catch (error) {
      throw new Error(`Failed to read holding registers: ${error.message}`);
    }
  }

  async readInputRegisters(address, length) {
    this.checkConnection();
    try {
      const result = await this.client.readInputRegisters(address, length);
      return result.data;
    } catch (error) {
      throw new Error(`Failed to read input registers: ${error.message}`);
    }
  }

  async readCoils(address, length) {
    this.checkConnection();
    try {
      const result = await this.client.readCoils(address, length);
      return result.data;
    } catch (error) {
      throw new Error(`Failed to read coils: ${error.message}`);
    }
  }

  async readDiscreteInputs(address, length) {
    this.checkConnection();
    try {
      const result = await this.client.readDiscreteInputs(address, length);
      return result.data;
    } catch (error) {
      throw new Error(`Failed to read discrete inputs: ${error.message}`);
    }
  }

  async writeHoldingRegister(address, value) {
    this.checkConnection();
    try {
      await this.client.writeRegister(address, value);
      return true;
    } catch (error) {
      throw new Error(`Failed to write holding register: ${error.message}`);
    }
  }

  async writeHoldingRegisters(address, values) {
    this.checkConnection();
    try {
      await this.client.writeRegisters(address, values);
      return true;
    } catch (error) {
      throw new Error(`Failed to write holding registers: ${error.message}`);
    }
  }

  async writeCoil(address, value) {
    this.checkConnection();
    try {
      await this.client.writeCoil(address, value);
      return true;
    } catch (error) {
      throw new Error(`Failed to write coil: ${error.message}`);
    }
  }

  async writeCoils(address, values) {
    this.checkConnection();
    try {
      await this.client.writeCoils(address, values);
      return true;
    } catch (error) {
      throw new Error(`Failed to write coils: ${error.message}`);
    }
  }

  checkConnection() {
    if (!this.connected) {
      throw new Error('Not connected to any Modbus device. Use "connect" command first.');
    }
  }

  getConnectionType() {
    return this.connectionType;
  }
}

const client = new ModbusClient();
module.exports = client;
