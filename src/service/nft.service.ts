import { Inject, Provide } from '@midwayjs/decorator';
import { ILogger } from '@midwayjs/logger';
import { BlockinNftService } from './blockin/account-nfts';
import { ScanNftService } from './nftscan/account-nfts';
import { CacheManager } from '@midwayjs/cache';

export type NftData = {
  contractAddress: string;
  contractName: string;
  tokenId: string;
  ownerAddress: string;
  ercType: string;
  amount: string;
  imageURI: string;
  smallURI: string;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: {
      name: string;
      value: string;
    }[];
  };
};

@Provide()
export class NftService {
  @Inject() logger: ILogger;

  @Inject() blockinNftService: BlockinNftService;

  @Inject() scanNftService: ScanNftService;

  @Inject() cacheManager: CacheManager;

  async getAccountNfts(address: string, page: number, limit: number): Promise<NftData[]> {
    try {
      const cacheKey = `accountNfts:${address}`;

      const cachedData = await this.cacheManager.get<NftData[]>(cacheKey);
      let allNfts: NftData[] = cachedData || [];

      if (!cachedData) {
        const [blockinNfts, scanNfts] = await Promise.all([
          this.blockinNftService.getAllNfts(address),
          this.scanNftService.getAllNfts(address),
        ]);

        allNfts = this.deduplicateAndFormatNfts([...scanNfts, ...blockinNfts]);

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

  private deduplicateAndFormatNfts(nfts: any[]): NftData[] {
    const uniqueNfts: NftData[] = [];
    const nftMap = new Map<string, boolean>();

    for (const nft of nfts) {
      const key = nft?.collection_address
        ? `${nft.collection_address}_${nft.token_id}`
        : `${nft.contract_address}_${nft.token_id}`;

      if (!nftMap.has(key)) {
        nftMap.set(key, true);

        const formattedNft = nft?.contract_address ? this.buildScanNftData(nft) : this.buildBlockinNftData(nft);
        uniqueNfts.push(formattedNft);
      }
    }

    return uniqueNfts;
  }

  jsonParse(str: string) {
    try {
      return JSON.parse(str);
    } catch (err) {
      this.logger.error('jsonParse error:', err);
      return {};
    }
  }

  private buildScanNftData(nft): NftData {
    const metadata = this.jsonParse(nft.metadata_json);

    return {
      contractAddress: nft.contract_address,
      contractName: nft.contract_name,
      tokenId: nft.token_id,
      amount: nft.amount,
      ownerAddress: nft.owner,
      ercType: nft.erc_type.toUpperCase(),
      imageURI: nft.image_uri,
      smallURI: nft?.small_nftscan_uri, // 缩略图
      metadata: {
        name: metadata.name,
        description: metadata.description,
        image: metadata.image,
        attributes: nft.attributes,
      },
    };
  }

  private buildBlockinNftData(nft): NftData {
    return {
      contractAddress: nft.collection_address,
      contractName: nft.name,
      tokenId: nft.token_id,
      amount: nft.amount,
      ownerAddress: nft.owner_address,
      ercType: nft.contract_type.toUpperCase(),
      imageURI: nft.image,
      smallURI: '',
      metadata: {
        name: nft.metadata?.name || '',
        description: nft.metadata?.description || '',
        image: nft.metadata?.image || '',
        attributes: nft.metadata?.attributes || [],
      },
    };
  }
}
