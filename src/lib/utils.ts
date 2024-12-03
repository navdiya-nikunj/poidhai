import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { arbitrum, base, degen } from "viem/chains"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getNetworkNameForPoidh(chainid: number) {
  return base.id === chainid ? "base" : degen.id === chainid ? "degen" : arbitrum.id === chainid ? "arbitrum" : "";
}

export function getNetworkNameForFrame(chainid: number) {
  return base.id === chainid ? `Base%2520Network` : degen.id === chainid ? `Degen%20Mainnet` : arbitrum.id === chainid ? `arbitrum` : "";
}