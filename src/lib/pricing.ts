export function salePrice(current:number,original:number|null){
 if(original===null||original<=current||current<=0)return null;
 return {original,current,percent:Math.round((original-current)/original*100)};
}