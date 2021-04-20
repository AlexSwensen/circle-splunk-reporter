import { Callback, Logger, SendContext } from "splunk-logging";

export class SplunkSender {
  url: string;
  token: string;
  private _logger: Logger;
  constructor({
    /**
     * splunk url
     */
    url,
    token,
    ssl = true,
  }: {
    url: string;
    token: string;
    ssl?: boolean;
  }) {
    this.url = url;
    this.token = token;
    this._logger = new Logger({
      token: this.token,
      url: this.url,
    });
    if (ssl) {
      this._logger.requestOptions.strictSSL = ssl;
    }
  }

  public send = (
    { name, data, index }: { name: string; data: any; index?: string },
    callback: Callback
  ) => {
    const payload: SendContext = {
      message: {
        name,
        data: data,
      },
    };

    if (index && index.length) {
      const metadata = {
        index: index,
      };

      payload.metadata = metadata;
    }
    this._logger.send(payload, callback);
  };
}
