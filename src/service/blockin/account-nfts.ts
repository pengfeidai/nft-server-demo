import { Inject, Config, Provide } from '@midwayjs/decorator';
import { HttpService } from '@midwayjs/axios';
import { ILogger } from '@midwayjs/logger';
import { IApiKeysConfig } from '../../interface';

@Provide()
export class BlockinNftService {
  @Inject() logger: ILogger;

  @Inject() httpService: HttpService;

  @Config('apiKeys') apiKeysConfig: IApiKeysConfig;

  baseUrl = 'https://api.blockin.ai';

  async getAccountNfts(address: string, page: number, pageSize: number, chainName: string = 'eth') {
    try {
      const { data } = await this.httpService.get(`${this.baseUrl}/v2/user/nft/wallet_item_list`, {
        headers: { AccessKey: this.apiKeysConfig.blockinApiKey },
        params: { address, page, page_size: pageSize, chain_name: chainName },
      });
      if (data?.success) {
        return data?.data;
      }
      return {};
    } catch (err) {
      this.logger.error('BlockinNftService getAccountNfts error:', err);
      return {};
    }
  }

  async getAllNfts(address: string, chainName: string = 'eth') {
    const pageSize = 100;
    let page = 1;
    let allNfts = [];

    try {
      while (true) {
        const nftsResponse = await this.getAccountNfts(address, page, pageSize, chainName);
        const nfts = nftsResponse.list;

        if (nfts.length === 0) break;

        allNfts = allNfts.concat(nfts);

        if (nftsResponse.pagination.current >= nftsResponse.pagination.count_page) break;

        page++;
      }

      return allNfts;
    } catch (err) {
      this.logger.error('BlockinNftService getAllNfts error:', err);
      return [];
    }
  }
}
