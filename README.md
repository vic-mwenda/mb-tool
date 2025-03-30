# mb-tool

A command-line interface tool for Modbus RTU and TCP communication.

## Installation

```bash
npm install -g mb-tool
```

Or use it directly from the project directory:

```bash
npm install
npm link
```

## Usage

### Connect to a Modbus device

#### RTU (Serial) Connection

```bash
mb-tool connect rtu --port /dev/ttyUSB0 --baudRate 9600 --dataBits 8 --stopBits 1 --parity none --id 1
```

#### TCP (Network) Connection

```bash
mb-tool connect tcp --host 192.168.1.100 --port 502 --id 1
```

#### Interactive Mode

```bash
mb-tool connect
```

### Read registers

Read holding registers:
```bash
mb-tool read --type holding --address 0 --count 10
```

Read input registers:
```bash
mb-tool read --type input --address 0 --count 10
```

Read coils:
```bash
mb-tool read --type coil --address 0 --count 10
```

Read discrete inputs:
```bash
mb-tool read --type discrete --address 0 --count 10
```

### Write registers

Write to a single holding register:
```bash
mb-tool write --type holding --address 0 --values 123
```

Write to multiple holding registers:
```bash
mb-tool write --type holding --address 0 --values 123,456,789
```

Write to a single coil:
```bash
mb-tool write --type coil --address 0 --values true
```

Write to multiple coils:
```bash
mb-tool write --type coil --address 0 --values true,false,true
```

## Options

### Global Options

- `--help`: Display help information
- `--version`: Display version information

### RTU Connection Options

- `--port, -p`: Serial port path (e.g., /dev/ttyUSB0, COM1)
- `--baudRate, -b`: Baud rate (default: 9600)
- `--dataBits, -d`: Data bits (default: 8)
- `--stopBits, -s`: Stop bits (default: 1)
- `--parity, -a`: Parity (none, even, odd) (default: none)
- `--id, -i`: Slave ID (default: 1)

### TCP Connection Options

- `--host, -h`: Host IP address or hostname (default: localhost)
- `--port, -p`: TCP port (default: 502)
- `--id, -i`: Slave ID (default: 1)

### Read Options

- `--type, -t`: Register type (holding, input, coil, discrete) (default: holding)
- `--address, -a`: Starting address (default: 0)
- `--count, -c`: Number of registers to read (default: 1)

### Write Options

- `--type, -t`: Register type (holding, coil) (default: holding)
- `--address, -a`: Starting address (default: 0)
- `--values, -v`: Values to write (comma-separated)

## License

MIT
```

Finally, let's make the CLI script executable:

```bash
chmod +x bin/mb-tool.js
```

Now, let's install the tool locally for testing:

```bash
npm link
