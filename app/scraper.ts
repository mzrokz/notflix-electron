import * as cheerio from 'cheerio';
import { ipcMain, ipcRenderer } from 'electron';
import * as peerflix from 'peerflix';

// const axios = require("axios");
import axios from 'axios';
import { ReadStream } from 'fs';

export function registerEvents() {
  console.log(peerflix);
  searchTorrent();
  getItemDetails();
}

function searchTorrent() {
  ipcMain.on('searchTorrent', async (event, ...args) => {
    const result = [];
    let seacrhText = args[0];
    //TODO: Remove hard-coded value
    seacrhText = 'jersey';
    let response = await axios.get(`https://1337x.wtf/search/${seacrhText}/1/`);
    if (response) {
      const $doc = cheerio.load(response.data);
      let rows = $doc('.box-info-detail tr');
      for (let i = 0; i < rows.length; i++) {
        let anchorTags = $doc(rows[i]).find('a:not(.icon)');
        if (anchorTags.length > 0) {
          let anchorTorrent = anchorTags[0];
          if (anchorTorrent) {
            let item: any = {};
            let href = anchorTorrent.attributes.find((x) => x.name == 'href');
            if (href) {
              item.href = href.value;
            }
            if (anchorTorrent.children) {
              let textNode: any = anchorTorrent.children.at(0);
              item.name = textNode.data;
            }
            result.push(item);
          }
        }
      }

      event.sender.send('searchTorrentResponse', result);
    }
  });
}

function getItemDetails() {
  ipcMain.on('getItemDetails', async (event, ...args) => {
    let itemUrl = args[0];
    let response = await axios.get(`https://1337x.wtf${itemUrl}`);
    if (response) {
      const $doc = cheerio.load(response.data);
      let magnetRows = $doc(
        '.box-info.torrent-detail-page .no-top-radius .clearfix li>a'
      );
      if (magnetRows.length > 0) {
        let magnetElement = magnetRows[0];
        let href = magnetElement.attributes.find((f) => f.name == 'href');
        if (href) {
          console.log(href.value);
          let engine = peerflix(href.value, null);
          engine.on('ready', function () {
            engine.files.forEach(function (file) {
              console.log('filename:', file.name);
              var stream: ReadStream = file.createReadStream();
              // stream is readable stream to containing the file content

            });
          });
        }
      }
    }
  });
}
