import { Inject, Config, Provide } from '@midwayjs/decorator';
import { HttpService } from '@midwayjs/axios';
import { ILogger } from '@midwayjs/logger';
import { IApiKeysConfig } from '../../interface';

@Provide()
export class ScanNftService {
  @Inject() logger: ILogger;

  @Inject() httpService: HttpService;

  @Config('apiKeys') apiKeysConfig: IApiKeysConfig;

  baseUrl = 'https://restapi.nftscan.com/api';

  async getAccountNfts(address: string, ercType: string, limit: number, cursor?: string) {
    try {
      const params: { [key: string]: string | number } = { erc_type: ercType, limit };

      if (cursor) params.cursor = cursor;

      const { data } = await this.httpService.get(`${this.baseUrl}/v2/account/own/${address}`, {
        headers: { 'X-API-KEY': this.apiKeysConfig.nftScanApiKey },
        params,
      });
      if (data?.code === 200) {
        return data?.data;
      }
      return {};
    } catch (err) {
      this.logger.error('ScanNftService getAccountNfts error:', err);
      return {};
    }
  }

  async getAllNfts(address: string) {
    const limit = 100;
    let cursor = undefined;
    const allNfts = [];

    const ercTypeList = ['erc721', 'erc1155'];

    try {
      for (const ercType of ercTypeList) {
        while (true) {
          const nftsResponse = await this.getAccountNfts(address, ercType, limit, cursor);

          if (nftsResponse.content.length === 0) break;

          allNfts.push(...nftsResponse.content);

          if (!nftsResponse.next) break;

          cursor = nftsResponse.next;
        }

        cursor = undefined;
      }

      return allNfts;
    } catch (err) {
      this.logger.error('ScanNftService getAllNfts error:', err);
      return [];
    }
  }
}
