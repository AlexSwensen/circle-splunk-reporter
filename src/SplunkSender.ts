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
    loggerOptions,
  }: {
    url: string;
    token: string;
    loggerOptions?: Logger["requestOptions"];
  }) {
    this.url = url;
    this.token = token;
    this._logger = new Logger({
      token: this.token,
      url: this.url,
    });

    if (loggerOptions) {
      this._logger.requestOptions = loggerOptions;
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
