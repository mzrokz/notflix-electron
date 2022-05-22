/* SystemJS module definition */
declare const nodeModule: NodeModule;
interface NodeModule {
  id: string;
}
interface Window {
  process: any;
  require: any;
}

// declare module 'cheerio' {
//   interface Cheerio<T> {
//     logHtml(this: Cheerio<T>): void;
//   }
// }
