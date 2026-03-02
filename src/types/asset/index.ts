export interface AssetRecord {
  accountName: string;
  totalReserves: number;
  totalSupply: number;
  updatedAt: string;
  ripcord: boolean;
  ripcordDetails?: string[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AssetData extends AssetRecord {}

export interface ProofOfReservesData {
  accountName: string;
  PoR: number;
  updatedAt: string;
  ripcord: boolean;
  ripcordDetails?: string[];
}
