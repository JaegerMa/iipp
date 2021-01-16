'use strict';

import Address from './Address';

class V4Address extends Address
{
	constructor({ bytes, subnetSize = 32 }: { bytes: number[], subnetSize?: number })
	{
		super({ bytes, subnetSize });
	}

	get addressType(): number
	{
		return 4;
	}
	get size(): number
	{
		return 32;
	}

	covers(address: V4Address | string): boolean
	{
		let addressObj = typeof (address) == 'object' ? address : V4Address.parse(address);
		if(!addressObj)
			return false;

		return super.covers(address);
	}
	toInt(): number
	{
		let n = 0;
		for(let i = 0; i < this.bytes.length; ++i)
			n = (n << 8) | this.bytes[i];

		return n;
	}
	toString({ appendCIDR = undefined }: { appendCIDR?: boolean | undefined } = {}): string
	{
		let str = this.bytes.map((byte) => byte.toString()).join('.');
		if(appendCIDR === true || (appendCIDR === undefined && this.subnetSize !== this.size))
			str += '/' + this.subnetSize;

		return str;
	}
	[Symbol.toPrimitive]()
	{
		return this.toString();
	}

	clone()
	{
		return new V4Address({ bytes: this.bytes.slice(), subnetSize: this.subnetSize });
	}


	static parse(str: string): V4Address | undefined
	{
		if(!str || typeof (str) !== 'string')
			return;

		let [, addressStr, , subnetStr] = str.match(/^([^\/]+)(\/(\d+))?$/) || [];
		if(!addressStr)
			return;

		let strParts = addressStr.split('.');
		if(strParts.length !== 4 || strParts.some((strPart) => Number.isNaN(Number(strPart))))
			return;

		let parts = strParts.map((strPart) => parseInt(strPart));
		if(parts.some((part) => part < 0 || part > 255))
			return;

		let subnetSize = 32;
		if(subnetStr)
		{
			subnetSize = parseInt(subnetStr);
			if(subnetSize < 0 || subnetSize > 32)
				return;
		}

		let address = new V4Address({ bytes: parts, subnetSize: subnetSize });

		return address;
	}
	static fromBigInt(bigInt: bigint): V4Address | undefined
	{
		if(bigInt > 0xFFFFFFFFn || bigInt < 0n)
			return undefined;


		let bytes = Array(4);
		for(let i = 3; i >= 0; --i)
		{
			bytes[i] = Number(bigInt & 0xFFn);
			bigInt >>= 8n;
		}

		return new V4Address({ bytes });
	}
	static fromInt(int: number): V4Address | undefined
	{
		if(!Number.isInteger(int) || int > 0xFFFFFFFF || int< 0)
			return undefined;


		let bytes = Array(4);
		for(let i = 3; i >= 0; --i)
		{
			bytes[i] = Number(int & 0xFF);
			int >>= 8;
		}

		return new V4Address({ bytes });
	}
}


export default V4Address;
