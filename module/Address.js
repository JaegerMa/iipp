'use strict';

class Address
{
	/* Address
	- bytes: Number[]
	- subnetSize: int
	*/
	constructor({ bytes, subnetSize })
	{
		this.bytes = bytes;
		this.subnetSize = subnetSize;
	}

	covers(address)
	{
		if(!address)
			return false;

		if(this.addressType !== address.addressType)
			return false;
		if(address.subnetSize < this.subnetSize)
			return false;

		const maxBytes = this.size / 8;
		for(let byte = 0; byte * 8 < this.subnetSize && byte < maxBytes; ++byte)
		{
			if(this.bytes[byte] !== address.bytes[byte])
				return false;
		}
		let bitsLeft = this.subnetSize % 8;

		let ourByte = this.bytes[Math.floor(this.subnetSize / 8)];
		ourByte >>= 8 - bitsLeft;
		let theirByte = address.bytes[Math.floor(this.subnetSize / 8)];
		theirByte >>= 8 - bitsLeft;

		if(ourByte !== theirByte)
			return false;

		return true;
	}
}

module.exports = Address;
