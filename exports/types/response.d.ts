/**
 * @module socketResponse
 *
 * @param {object} connection socket connection
 * @param {string} url the request url
 */
declare const _default: (connection: any, url: string, id: string, customEvent?: any) => {
    connection: any;
    send: (data?: string, status?: number) => Promise<void>;
    error: (data: any) => Promise<void>;
};
export default _default;
