import { Inject, Provide } from '@midwayjs/decorator';
import { ILogger } from '@midwayjs/logger';
import { BlockinNftService } from './blockin/account-nfts';
import { ScanNftService } from './nftscan/account-nfts';
import { CacheManager } from '@midwayjs/cache';

@Provide()
export class NftService {
  @Inject() logger: ILogger;

  @Inject() blockinNftService: BlockinNftService;

  @Inject() scanNftService: ScanNftService;

  @Inject() cacheManager: CacheManager;

  async getAccountNfts(address: string, page: number, limit: number) {
    try {
      const cacheKey = `accountNfts:${address}`;

      const cachedData = await this.cacheManager.get(cacheKey);
      // TODO: 定义数据类型，暂时用any
      let allNfts: any = cachedData || [];

      if (!cachedData) {
        const [blockinNfts, scanNfts] = await Promise.all([
          this.blockinNftService.getAllNfts(address),
          this.scanNftService.getAllNfts(address),
        ]);

        allNfts = [...blockinNfts, ...scanNfts];
        allNfts = this.deduplicateNfts(allNfts); // Perform deduplication

        await this.cacheManager.set(cacheKey, allNfts, { ttl: 20 });
      }

      // Perform pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const pagedNfts = allNfts.slice(startIndex, endIndex);

      return pagedNfts;
    } catch (err) {
      this.logger.error('NftService getAccountNfts error:', err);
      return [];
    }
  }

  private deduplicateNfts(nfts: any[]) {
    const uniqueNfts: any[] = [];
    const nftMap = new Map();

    for (const nft of nfts) {
      const key = nft.collection_address
        ? `${nft.collection_address}_${nft.token_id}`
        : `${nft.contract_address}_${nft.token_id}`;

      if (!nftMap.has(key)) {
        nftMap.set(key, true);
        uniqueNfts.push(nft);
      }
    }
    return uniqueNfts;
  }
}
