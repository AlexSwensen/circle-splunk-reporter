import { Callback, Logger, SendContext } from "splunk-logging";

export class SplunkSender {
  url: string;
  token: string;
  private _logger: Logger;
  constructor({
    /**
     * url
     */
    url,
    token,
    ssl,
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
    { name, data, index }: { name: string; data: any; index: string },
    callback: Callback
  ) => {
    const payload: SendContext = {
      message: {
        name,
        ...data,
      },
      metadata: {
        index: index,
      },
    };
    this._logger.send(payload, callback);
  };
}
