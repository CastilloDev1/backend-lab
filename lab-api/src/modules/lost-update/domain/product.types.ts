export type ProductScenario = 'problem' | 'atomic-update';

export interface ProductCommand {
    id: number;
    name: string;
    quantity: number;
}

export interface ProductResult {
    scenario: ProductScenario;
    stock: number;
}