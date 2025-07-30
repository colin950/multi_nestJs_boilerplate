import { ethers } from 'ethers'
import { BadRequestException } from '@nestjs/common'
import { Err } from '../errors/err'

export function toChecksumAddress(address: string): string {
  if (!ethers.isAddress(address)) {
    throw new BadRequestException(Err.InvalidAddress)
  }
  return ethers.getAddress(address)
}

export function cleanEmptyValues(
  obj: Record<string, any>,
): Record<string, any> {
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([_, v]) => {
        if (v === '' || v === null) return false
        if (Array.isArray(v)) return v.filter((x) => x).length > 0
        if (typeof v === 'object') return Object.keys(v).length > 0
        return true
      })
      .map(([k, v]) => {
        if (Array.isArray(v)) {
          return [k, v.filter((x) => x)]
        }
        if (typeof v === 'object' && !Array.isArray(v)) {
          return [k, cleanEmptyValues(v)]
        }
        return [k, v]
      }),
  )
}
