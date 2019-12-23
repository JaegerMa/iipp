# iipp

Small module to parse and work with IPv4 and IPv6 addresses.

Features:
- Parsing IPv4 and IPv6 Addresses with CIDR
- Printing IPv4 and IPv6 (compressed and uncompressed)
- Checking whether an address or an subnet is covered/included in another one

## Usage

### Parse IPv4 address
```js
let address = V4Address.parse('1.2.3.4');
```
If an invalid address is given, `null` is returned.

### Parse IPv6 address
```js
let address = V6Address.parse('::1');
```
If an invalid address is given, `null` is returned.

### Check whether a subnet covers/includes another one
```js
let net = V4Address.parse('10.0.0.0/8');
let address = V4Address.parse('5.0.0.0');
net.covers(address); // => false
```

The `covers` method also accepts a string.
If the given string is not a valid address, `false` is returned.
```js
let net = V4Address.parse('10.0.0.0/8');
net.covers('5.0.0.0'); // => false
net.covers('10.2.3.4'); // => true
net.covers('10.0.0.300'); // => false
```

## Available types

### `Address`
Base class representing an address or net.

#### Attributes
- `addressType`: `int`
  4 or 6
`- size`: `int`
  Address size in bits (32 or 128)
- `bytes`: `int[]`
  Address data as 8-bit unsigned
- `subnetSize`: `int`
  Size of the subnet mask in bits

#### Methods
- `covers(Address | string)`: `bool`
  Checks whether the current net covers/includes the given address
- `toString({ appendCIDR = true })`: `string`
  Prints the address (compressed, if possible). Appends CIDR depending on `appendCIDR` paramete


### `V4Address` extends `Address`
IPv4 address or net.

#### Attributes
- `addressType`: `int` => `4`
- `size`: `int` => `32`
- `bytes`: `int[4]`
  Address data as 8-bit unsigned ints
- `subnetSize`: `int`
  Size of the subnet mask in bits

#### Methods
- `covers(Address | string)`: bool
  Checks whether the current net covers/includes the given address
- `toString({ appendCIDR = true })`: `string`
  Prints the address. Appends CIDR depending on `appendCIDR` paramete
- `static parse(string)`: `V4Address`
  Parses an IPv4 address or net. Returns `null` for invalid data.


### `V6Address` extends `Address`
IPv6 address or net.

#### Attributes
- `addressType`: `int` => `6`
- `size`: `int` => `128`
- `bytes`: `int[16]`
  Address data as 8-bit unsigned ints
- `blocks`: `int[8]`
  Address data as 16-bit unsigned ints
- `subnetSize`: `int`
  Size of the subnet mask in bits

#### Methods
- `covers(Address | string)`: bool
  Checks whether the current net covers/includes the given address
- `toString({ appendCIDR = true })`: `string`
  Prints the compressed address. Appends CIDR depending on `appendCIDR` paramete
- `toUncompressedString({ appendCIDR = true })`: `string`
  Prints the uncompressed address. Appends CIDR depending on `appendCIDR` paramete
- `static parse(string)`: `V6Address`
  Parses an IPv6 address or net. Returns `null` for invalid data.


## Examples
```js
let address = V4Address.parse('1.2.3.4');
/* address => V4Address
	- addressType: 4
	- size: 32
	- bytes: [1, 2, 3, 4]
	- subnetSize: 32
*/

let address = V4Address.parse('5.6.7.8/12');
/* address => V4Address
	- addressType: 4
	- size: 32
	- bytes: [5, 6, 7, 8]
	- subnetSize: 12
*/


let address = V4Address.parse('1.2.288.4'); //Invalid valid at position 3
/* address => null */

let address = V4Address.parse('1.2.3.4/42'); //Invalid CIDR value
/* address => null */



let address = V6Address.parse('::1');
/* address => V6Address
	- addressType: 6
	- size: 128
	- bytes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]
	- subnetSize: 128
*/
address.toUncompressedString(); // => 0000:0000:0000:0000:0000:0000:0000:0001/128
address.toString(); // => ::1/128
address.toString({ appendCIDR: false }); // => ::1


let address = V6Address.parse('::1:0:0:0:0:0/100');
/* address => V6Address
	- addressType: 6
	- size: 128
	- bytes: [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
	- subnetSize: 128
*/
address.toUncompressedString(); // => 0000:0000:0001:0000:0000:0000:0000:0000/100
address.toString(); // => 0:0:1::/100
