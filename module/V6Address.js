'use strict';

const Address = require(__dirname + '/Address.js');

class V6Address extends Address
{
	constructor({ bytes, subnetSize = 128 })
	{
		super({ bytes, subnetSize });
	}

	get addressType()
	{
		return 6;
	}
	get size()
	{
		return 128;
	}
	get blocks()
	{
		return this.bytes.reduce((blocks, byte, idx) =>
		{
			if(idx % 2 === 0)
				blocks.push(byte << 8);
			else
				blocks[blocks.length - 1] |= byte;
			return blocks;
		}, []);
	}
	get biggestVoid()
	{
		let blocks = this.blocks;
		let biggestVoidStart = -1;
		let biggestVoidSize = 0;
		let currentVoidStart = -1;
		let currentVoidSize = 0;

		for(let i = 0; i < blocks.length; ++i)
		{
			if(blocks[i] !== 0)
			{
				currentVoidSize = 0;
				currentVoidStart = -1;
				continue;
			}

			if(currentVoidStart < 0)
				currentVoidStart = i;
			++currentVoidSize;

			if(currentVoidSize > biggestVoidSize)
			{
				biggestVoidSize = currentVoidSize;
				biggestVoidStart = currentVoidStart;
			}
		}

		return { start: biggestVoidStart, size: biggestVoidSize };
	}


	covers(address)
	{
		if(typeof (address) !== 'object')
			address = V6Address.parse(address);

		return super.covers(address);
	}
	toString({ appendCIDR = true } = {})
	{
		let biggestVoid = this.biggestVoid || { start: -1, size: 0 };
		let blocks = this.blocks
			.map((byte, idx) => idx === biggestVoid.start ? '' : byte)
			.filter((byte, idx) => idx <= biggestVoid.start || idx >= biggestVoid.start + biggestVoid.size);

		if(biggestVoid.start === 0)
			blocks.splice(0, 0, '');
		if(biggestVoid.start + biggestVoid.size === 8)
			blocks.push('');


		let str = blocks.map((byte) => byte.toString(16)).join(':');
		if(appendCIDR)
			str += '/' + this.subnetSize;

		return str;
	}
	toUncompressedString({ appendCIDR = true } = {})
	{
		let str = this.blocks.map((byte) => byte.toString(16).padStart(4, '0')).join(':');
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
		return new V6Address({ bytes: this.bytes.slice(), subnetSize: this.subnetSize });
	}


	static parse(str)
	{
		if(!str || typeof (str) !== 'string')
			return;

		let [, addressStr, , subnetStr] = str.match(/^([^\/]+)(\/(\d+))?$/) || [];
		if(!addressStr)
			return;

		if(addressStr.startsWith('::'))
			addressStr = '0' + addressStr;
		if(addressStr.endsWith('::'))
			addressStr = addressStr + '0';

		let strParts = addressStr.split(':').map((strPart) => strPart && '0x' + strPart);
		if(strParts.some((strPart) => isNaN(strPart) && strPart !== ''))
			return;
		if(strParts.filter((strPart) => strPart === '').length > 1)
			return;
		if(strParts.length > 8)
			return;

		let parts = strParts.map((strPart) => strPart !== '' ? parseInt(strPart) : -1);
		if(parts.some((part) => part < -1 || part > 0xffff))
			return;

		let voidIdx = parts.indexOf(-1);
		if(voidIdx !== -1)
		{
			let voidSize = 8 - parts.length + 1;
			let voidContent = new Array(voidSize).fill(0);
			parts.splice(voidIdx, 1, ...voidContent);
		}
		if(parts.length !== 8)
			return;

		let bytes = [].concat(...parts.map((part) => [part >> 8, part & 0xff]));


		let subnetSize = 128;
		if(subnetStr)
		{
			subnetSize = parseInt(subnetStr);
			if(subnetSize < 0 || subnetSize > 128)
				return;
		}

		let address = new V6Address({ bytes, subnetSize });

		return address;
	}
}


module.exports = V6Address;
