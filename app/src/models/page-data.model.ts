import { FormData } from "./form-data.model";
import { PriceData } from "./price-data.model";

export interface PageData {
  text: string;
  formsData: FormData[];
  pricesData: PriceData[];
  url: string;
}