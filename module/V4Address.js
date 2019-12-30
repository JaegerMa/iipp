'use strict';

const Address = require(__dirname + '/Address.js');

class V4Address extends Address
{
	constructor({ bytes, subnetSize = 32 })
	{
		super({ bytes, subnetSize });
	}

	get addressType()
	{
		return 4;
	}
	get size()
	{
		return 32;
	}

	covers(address)
	{
		if(typeof (address) !== 'object')
			address = V4Address.parse(address);

		return super.covers(address);
	}
	toString({ appendCIDR = true } = {})
	{
		let str = this.bytes.map((byte) => byte.toString()).join('.');
		if(appendCIDR)
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


	static parse(str)
	{
		if(!str || typeof (str) !== 'string')
			return;

		let [, addressStr, , subnetStr] = str.match(/^([^\/]+)(\/(\d+))?$/) || [];
		if(!addressStr)
			return;

		let strParts = addressStr.split('.');
		if(strParts.length !== 4 || strParts.some((strPart) => isNaN(strPart)))
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
}


module.exports = V4Address;
