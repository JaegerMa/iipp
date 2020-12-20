'use strict';

import Address from './Address';

class V6Address extends Address
{
	constructor({ bytes, subnetSize = 128 }: { bytes: number[], subnetSize?: number })
	{
		super({ bytes, subnetSize });
	}

	get addressType(): number
	{
		return 6;
	}
	get size(): number
	{
		return 128;
	}
	get blocks(): number[]
	{
		let blocks: number[] = [];
		for(let i = 0; i < this.bytes.length; ++i)
		{
			let byte = this.bytes[i];

			if(i % 2 === 0)
				blocks.push(0);
			
			blocks[blocks.length - 1] = (blocks[blocks.length - 1] << 8) | byte;
		}
		
		return blocks;
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


	covers(address: V6Address | string): boolean
	{
		let addressObj = typeof (address) == 'object' ? address : V6Address.parse(address);
		if(!addressObj)
			return false;		

		return super.covers(addressObj);
	}
	toString({ appendCIDR = undefined, uncompressed = false }: { appendCIDR?: boolean | undefined, uncompressed?: boolean } = {}): string
	{
		if(uncompressed)
			return this.toUncompressedString(...arguments);

		let biggestVoid = this.biggestVoid || { start: -1, size: 0 };
		let blocks = this.blocks
			.map((byte, idx) => idx === biggestVoid.start ? '' : byte)
			.filter((_, idx) => idx <= biggestVoid.start || idx >= biggestVoid.start + biggestVoid.size);

		if(biggestVoid.start === 0)
			blocks.splice(0, 0, '');
		if(biggestVoid.start + biggestVoid.size === 8)
			blocks.push('');


		let str = blocks.map((byte) => byte.toString(16)).join(':');
		if(appendCIDR === true || (appendCIDR === undefined && this.subnetSize !== this.size))
			str += '/' + this.subnetSize;

		return str;
	}
	toUncompressedString({ appendCIDR = undefined }: { appendCIDR?: boolean | undefined; } = {}): string
	{
		let str = this.blocks.map((byte) => byte.toString(16).padStart(4, '0')).join(':');
		if(appendCIDR === true || (appendCIDR === undefined && this.subnetSize !== this.size))
			str += '/' + this.subnetSize;

		return str;
	}
	[Symbol.toPrimitive](): string
	{
		return this.toString();
	}

	clone(): V6Address
	{
		return new V6Address({ bytes: this.bytes.slice(), subnetSize: this.subnetSize });
	}


	static parse(str: string): V6Address | undefined
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
		if(strParts.some((strPart) => Number.isNaN(Number(strPart)) && strPart !== ''))
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

		
		let bytes = ([] as number[]).concat(...parts.map((part) => [part >> 8, part & 0xff]));

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


export default V6Address;
