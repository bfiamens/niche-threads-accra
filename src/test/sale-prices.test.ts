import {expect,it} from 'vitest';
import {salePrice} from '@/lib/pricing';
it('crosses out the original price only when reduced',()=>expect(salePrice(150,200)).toEqual({current:150,original:200,percent:25}));
it('does not invent a sale without an original price',()=>expect(salePrice(150,null)).toBeNull());
it('does not mark a price increase as a discount',()=>expect(salePrice(200,150)).toBeNull());