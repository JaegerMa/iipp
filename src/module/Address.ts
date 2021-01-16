'use strict';


abstract class Address
{
	bytes: number[];
	subnetSize: number;

	abstract get addressType(): number;
	abstract get size(): number;

	constructor({ bytes, subnetSize }: { bytes: number[], subnetSize: number; })
	{
		this.bytes = bytes;
		this.subnetSize = subnetSize;
	}

	covers(address: Address | string): boolean
	{
		let addressObj = typeof (address) == 'object' ? address : Address.parse(address);
		if(!addressObj)
			return false;


		if(this.addressType !== addressObj.addressType)
			return false;
		if(addressObj.subnetSize < this.subnetSize)
			return false;

		const maxBytes = this.size / 8;
		for(let byte = 0; byte * 8 < this.subnetSize && byte < maxBytes; ++byte)
		{
			if(this.bytes[byte] !== addressObj.bytes[byte])
				return false;
		}
		let bitsLeft = this.subnetSize % 8;

		let ourByte = this.bytes[Math.floor(this.subnetSize / 8)];
		ourByte >>= 8 - bitsLeft;
		let theirByte = addressObj.bytes[Math.floor(this.subnetSize / 8)];
		theirByte >>= 8 - bitsLeft;

		if(ourByte !== theirByte)
			return false;

		return true;
	}

	static parse(str: string, addressFamily: number = 0): Address | undefined
	{
		switch(addressFamily)
		{
			case 4:
				return V4Address.parse(str);
			case 6:
				return V6Address.parse(str);
		}

		return V4Address.parse(str) || V6Address.parse(str);
	}
}

export default Address;


import V4Address from './V4Address';
import V6Address from './V6Address';
