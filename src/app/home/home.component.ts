import { ElectronService } from './../core/services/electron/electron.service';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  regexTorrent: RegExp = /torrent\/[0-9]{7}\/[a-zA-Z0-9?%-]*/;
  searchText: string = '';

  searchResult: any = [];
  sourceBuffer: any = null;
  mediaSource = new MediaSource();
  videoElement: any = null;

  constructor(
    private router: Router,
    private http: HttpClient,
    private electronService: ElectronService
  ) {
    console.log(process.env);
    console.log('Run in electron');
    console.log('Electron ipcRenderer', this.electronService.ipcRenderer);
    console.log('NodeJS childProcess', this.electronService.childProcess);

    this.registerSearchResponse();
    this.registerTorrentResponse();
  }

  ngOnInit(): void {
    console.log('HomeComponent INIT');
  }

  ngAfterViewInit(): void {
    this.prepareVideoBuffer();
  }

  search() {
    this.electronService.ipcRenderer.send('searchTorrent', this.searchText);
  }

  registerSearchResponse() {
    this.electronService.ipcRenderer.on(
      'searchTorrentResponse',
      (sender, result) => {
        this.searchResult = result;
      }
    );
  }

  getItemDetails(href) {
    this.electronService.ipcRenderer.send('getItemDetails', href);
  }

  async prepareVideoBuffer() {
    this.videoElement = document.querySelector('#player');
    // Create a MediaSource instance and connect it to video element

    // This creates a URL that points to the media buffer,
    // and assigns it to the video element src
    this.videoElement.src = URL.createObjectURL(this.mediaSource);

    // // Video that will be fetched and appended
    // const remoteVidUrl = `https://raw.githubusercontent.com/chromium/chromium/b4b3566f27d2814fbba1b115639eb7801dd691cf/media/test/data/bear-vp9-opus.webm`;

    // Fetch remote URL, getting contents as binary blob
    // const vidBlob = await(await fetch(remoteVidUrl)).blob();
    // // We need array buffers to work with media source
    // const vidBuff = await vidBlob.arrayBuffer();

    /**
     * Before we can actually add the video, we need to:
     *  - Create a SourceBuffer, attached to the MediaSource object
     *  - Wait for the SourceBuffer to "open"
     */
    /** @type {SourceBuffer} */
    this.sourceBuffer = await new Promise((resolve, reject) => {
      const getSourceBuffer = () => {
        try {
          const sourceBuffer = this.mediaSource.addSourceBuffer(
            `video/webm; codecs="vp9,opus"`
          );
          resolve(sourceBuffer);
        } catch (e) {
          reject(e);
        }
      };
      if (this.mediaSource.readyState === 'open') {
        getSourceBuffer();
      } else {
        this.mediaSource.addEventListener('sourceopen', getSourceBuffer);
      }
    });
  }

  registerTorrentResponse() {
    this.electronService.ipcRenderer.on(
      'torrentData',
      (sender, result: Buffer) => {
        // Now that we have an "open" source buffer, we can append to it
        this.sourceBuffer.appendBuffer(result);
        // Listen for when append has been accepted and
        // You could alternative use `.addEventListener` here instead
        this.sourceBuffer.onupdateend = () => {
          // Nothing else to load
          this.mediaSource.endOfStream();
          // Start playback!
          // Note: this will fail if video is not muted, due to rules about
          // autoplay and non-muted videos
          this.videoElement.play();
        };
      }
    );
  }
}
