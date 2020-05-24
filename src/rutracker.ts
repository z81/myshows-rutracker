import RutrackerApi from "rutracker-api";
import SocksProxyAgent from "socks-proxy-agent";
import { config } from "./config";

const RANGE_REG_EXP = [
  /(Серия|Серии)[ :]+(?<start>\d+)[ ]*(из|-)[ ]*(?<end>\d+)/gim,
  /с (?<start>\d+)( по | до )(?<end>\d+)/gim,
];

const MAGNET_REG_EXP = /<a href="(magnet:\?xt=urn:.*)" class=".*" data-topic_id="\d*"  title="[A-F\d]*">/gim;

const RANGE_SEASON_REG_EXP = /Сезон[ :]+(\d+)/gim;

const QUALITY_REG_EX = /(WEB-DLRip|HDTVRip|BDRip-AVC|BDRip|HDTV|BDRemux|WEB-DL)[ ,]*(\d+p|1080i|\d+x\d+|)/gim;

export class Rutracker {
  private rutracker = new RutrackerApi();

  constructor() {
    this.proxyMonkeyPatch();
  }

  public login() {
    return this.rutracker.login(config.rutracker.auth);
  }

  public search(q: { query: string }) {
    return this.rutracker.search(q);
  }

  public getMagnetLink(id: string) {
    const { request, threadUrl, cookie } = this.rutracker.pageProvider;

    return request({
      url: `${threadUrl}?t=${encodeURIComponent(id)}`,
      method: "GET",
      responseType: "arraybuffer",
      headers: {
        Cookie: cookie,
      },
    })
      .then((response: { data: { toString(): string } }) =>
        response.data.toString()
      )
      .then((html: string) => {
        const magnet = MAGNET_REG_EXP.exec(html)?.[1];
        MAGNET_REG_EXP.lastIndex = 0;
        return magnet;
      });
  }

  public async getSerialMagnet(name: string, season: string, series: string) {
    const result = await this.search({
      query: `${name} сезон ${season}`,
    }).then((response: Array<{ title: string }>) =>
      response
        .flatMap((video) => {
          const range = { start: 0, end: 0 };

          const { start, end } = RANGE_REG_EXP.reduce((result, regEx) => {
            if (result && result.start) {
              return result;
            }

            const r = regEx.exec(video.title) as {
              groups: typeof range;
            } | null;

            regEx.lastIndex = 0;
            return r?.groups || range;
          }, range);

          if (start === 0) {
            return [];
          }

          RANGE_SEASON_REG_EXP.lastIndex = 0;

          return [
            {
              ...video,
              series: { start, end },
              season: RANGE_SEASON_REG_EXP.exec(video.title)?.[1],
              title: video.title,
              quality: video.title.match(QUALITY_REG_EX)?.[0],
            },
          ];
        })
        .filter(
          (t) =>
            t.series.start <= +series &&
            +series <= t.series.end &&
            t.season == season
        )
    );

    return result;
  }

  private proxyMonkeyPatch() {
    const httpsAgent = SocksProxyAgent(config.proxy);
    this.rutracker.pageProvider.request = this.rutracker.pageProvider.request.create(
      {
        httpsAgent,
        httpAgent: httpsAgent,
      }
    );
  }
}
