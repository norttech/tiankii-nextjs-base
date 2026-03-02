export interface AssetRecord {
  accountName: string;
  totalReserves: number;
  totalSupply: number;
  updatedAt: string;
  ripcord: boolean;
  ripcordDetails?: string[];
}

export interface AssetData extends AssetRecord {}

export interface ProofOfReservesData {
  accountName: string;
  PoR: number;
  updatedAt: string;
  ripcord: boolean;
  ripcordDetails?: string[];
}
