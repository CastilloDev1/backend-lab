export type LostUpdateStage = 'broken' | 'atomic-update';

export interface ProductDiscountBody {
  id: number;
  name: string;
  quantity: number;
}

export interface ProductDiscountResult {
  stage: LostUpdateStage;
  stock: number;
}
