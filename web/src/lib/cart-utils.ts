import type { CartItem, Product, OnlineFormation, PresentialFormation } from "@/types";

export function getCartItemPrice(item: CartItem): number {
  if ("priceTTC" in item) return (item as Product).priceTTC;
  return (item as OnlineFormation | PresentialFormation).price;
}

export function getCartItemId(item: CartItem): string | number {
  if ("priceTTC" in item) return (item as Product).id;
  return (item as OnlineFormation | PresentialFormation)._id;
}

export function getCartItemImage(item: CartItem): string {
  if ("imageUrl" in item) return (item as Product).imageUrl;
  return (item as OnlineFormation | PresentialFormation).image;
}

export function getCartItemDescription(item: CartItem): string {
  if ("shortDescription" in item) return (item as Product).shortDescription;
  return (item as OnlineFormation | PresentialFormation).description;
}
