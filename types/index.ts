export type AuctionItem = {
  id: string;
  case_number: string;
  title: string;
  address: string;
  image_url: string | null;
  appraisal_price: number;
  minimum_bid_price: number;
  deposit_amount: number;
  end_at: string;
  detail_url?: string;
  status: "open" | "closed";
  actual_price?: number;
  result_date?: string;
  result_open: boolean;
  created_at: string;
};

export type Prediction = {
  id: string;
  auction_id: string;
  email: string;
  nickname?: string;
  predicted_price: number;
  created_at: string;
};

export type PredictionWithDiff = Prediction & {
  diff: number;
};
